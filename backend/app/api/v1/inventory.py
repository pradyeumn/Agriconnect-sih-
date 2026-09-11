from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from typing import Optional, List
import aiofiles, os, uuid, math, re
from datetime import datetime

from app.core.database import get_db, get_next_id
from app.core.security import get_current_user
from app.models.inventory import Inventory
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse, ProductResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


@router.get("/", response_model=List[InventoryResponse])
async def list_inventory(
    farmer_id: Optional[int] = None,
    product_id: Optional[int] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    buyer_lat: Optional[float] = None,
    buyer_lng: Optional[float] = None,
    max_distance_km: Optional[float] = Query(None),
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    db = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = {}

    if current_user.role == "farmer":
        my_farmer = await db.farmers.find_one({"user_id": current_user.id})
        if my_farmer:
            query["farmer_id"] = my_farmer["id"]
    elif farmer_id:
        query["farmer_id"] = farmer_id

    if product_id:
        query["product_id"] = product_id

    if status:
        query["status"] = status
    elif current_user.role == "buyer":
        query["status"] = "available"

    if min_price is not None or max_price is not None:
        query["price_per_unit"] = {}
        if min_price is not None:
            query["price_per_unit"]["$gte"] = min_price
        if max_price is not None:
            query["price_per_unit"]["$lte"] = max_price

    # Get matching products if category or search is provided
    matching_product_ids = None
    if search or category:
        prod_query = {}
        if search:
            rx = re.compile(search, re.IGNORECASE)
            prod_query["$or"] = [{"name": rx}, {"category": rx}]
        if category:
            prod_query["category"] = re.compile(category, re.IGNORECASE)

        prods_cursor = db.products.find(prod_query)
        prods = await prods_cursor.to_list(length=500)
        matching_product_ids = [p["id"] for p in prods]
        query["product_id"] = {"$in": matching_product_ids}

    cursor = db.inventory.find(query)
    inv_docs = await cursor.to_list(length=200)

    # Collect farmers & products maps
    f_ids = list(set([doc["farmer_id"] for doc in inv_docs if "farmer_id" in doc]))
    p_ids = list(set([doc["product_id"] for doc in inv_docs if "product_id" in doc]))

    farmers_cursor = db.farmers.find({"id": {"$in": f_ids}})
    farmers_list = await farmers_cursor.to_list(length=len(f_ids) or 1)
    farmers_map = {f["id"]: f for f in farmers_list}

    products_cursor = db.products.find({"id": {"$in": p_ids}})
    products_list = await products_cursor.to_list(length=len(p_ids) or 1)
    products_map = {p["id"]: p for p in products_list}

    inventory_list = []
    for inv_doc in inv_docs:
        inv_obj = Inventory(**inv_doc)
        item = InventoryResponse.model_validate(inv_obj)

        prod_doc = products_map.get(inv_doc.get("product_id"))
        if prod_doc:
            item.product = ProductResponse.model_validate(Product(**prod_doc))

        farmer_doc = farmers_map.get(inv_doc.get("farmer_id"))
        if farmer_doc:
            item.farmer_name = farmer_doc.get("name", "")
            item.farmer_location = f"{farmer_doc.get('village', '') or ''}, {farmer_doc.get('district', '') or ''}".strip(", ")
            item.farmer_lat = farmer_doc.get("latitude")
            item.farmer_lng = farmer_doc.get("longitude")

            if buyer_lat is not None and buyer_lng is not None and item.farmer_lat and item.farmer_lng:
                dist = haversine(buyer_lat, buyer_lng, item.farmer_lat, item.farmer_lng)
                item.distance_km = round(dist, 2)
                if max_distance_km and dist > max_distance_km:
                    continue

        inventory_list.append(item)

    if buyer_lat and sort_by == "distance":
        inventory_list.sort(key=lambda x: x.distance_km or 9999)
    elif sort_by == "price":
        reverse = sort_order == "desc"
        inventory_list.sort(key=lambda x: x.price_per_unit, reverse=reverse)

    return inventory_list


@router.post("/", response_model=InventoryResponse, status_code=201)
async def create_inventory(
    data: InventoryCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Only farmers can add inventory")

    farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
    if not farmer_doc:
        raise HTTPException(404, "Farmer profile not found")

    prod_doc = await db.products.find_one({"id": data.product_id})
    if not prod_doc:
        raise HTTPException(404, "Product not found")

    inv_id = await get_next_id(db, "inventory")
    now = datetime.utcnow()
    inv_doc = {
        "id": inv_id,
        "farmer_id": farmer_doc["id"],
        **data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db.inventory.insert_one(inv_doc)

    inv_obj = Inventory(**inv_doc)
    item = InventoryResponse.model_validate(inv_obj)
    item.product = ProductResponse.model_validate(Product(**prod_doc))
    item.farmer_name = farmer_doc.get("name", "")
    return item


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: int,
    data: InventoryUpdate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv_doc = await db.inventory.find_one({"id": inventory_id})
    if not inv_doc:
        raise HTTPException(404, "Inventory item not found")

    if current_user.role == "farmer":
        farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
        if not farmer_doc or inv_doc["farmer_id"] != farmer_doc["id"]:
            raise HTTPException(403, "Not your inventory")

    update_dict = data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    await db.inventory.update_one({"id": inventory_id}, {"$set": update_dict})
    updated_doc = await db.inventory.find_one({"id": inventory_id})

    return InventoryResponse.model_validate(Inventory(**updated_doc))


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory(
    inventory_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv_doc = await db.inventory.find_one({"id": inventory_id})
    if not inv_doc:
        raise HTTPException(404, "Inventory item not found")

    if current_user.role == "farmer":
        farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
        if not farmer_doc or inv_doc["farmer_id"] != farmer_doc["id"]:
            raise HTTPException(403, "Not your inventory")

    if inv_doc.get("quantity_reserved", 0) > 0:
        raise HTTPException(400, "Cannot delete inventory with reserved quantities (active orders)")

    await db.inventory.delete_one({"id": inventory_id})


@router.post("/{inventory_id}/upload-image")
async def upload_inventory_image(
    inventory_id: int,
    file: UploadFile = File(...),
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv_doc = await db.inventory.find_one({"id": inventory_id})
    if not inv_doc:
        raise HTTPException(404, "Inventory not found")

    upload_dir = "./uploads/inventory"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    img_url = f"/uploads/inventory/{filename}"
    await db.inventory.update_one(
        {"id": inventory_id},
        {"$set": {"image_url": img_url, "updated_at": datetime.utcnow()}}
    )
    return {"image_url": img_url}
