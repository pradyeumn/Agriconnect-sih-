from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import Optional, List
import aiofiles, os, uuid, math

from app.core.database import get_db
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Inventory, Farmer, Product)
        .join(Farmer, Inventory.farmer_id == Farmer.id)
        .join(Product, Inventory.product_id == Product.id)
    )

    # Role-based filtering
    if current_user.role == "farmer":
        result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
        my_farmer = result.scalar_one_or_none()
        if my_farmer:
            query = query.where(Inventory.farmer_id == my_farmer.id)
    elif farmer_id:
        query = query.where(Inventory.farmer_id == farmer_id)

    if product_id:
        query = query.where(Inventory.product_id == product_id)
    if status:
        query = query.where(Inventory.status == status)
    elif current_user.role == "buyer":
        query = query.where(Inventory.status == "available")
    if min_price:
        query = query.where(Inventory.price_per_unit >= min_price)
    if max_price:
        query = query.where(Inventory.price_per_unit <= max_price)
    if search:
        query = query.where(
            or_(Product.name.ilike(f"%{search}%"), Product.category.ilike(f"%{search}%"))
        )
    if category:
        query = query.where(Product.category.ilike(f"%{category}%"))

    result = await db.execute(query)
    rows = result.all()

    inventory_list = []
    for inv, farmer, product in rows:
        item = InventoryResponse.model_validate(inv)
        item.product = ProductResponse.model_validate(product)
        item.farmer_name = farmer.name
        item.farmer_location = f"{farmer.village or ''}, {farmer.district or ''}".strip(", ")
        item.farmer_lat = farmer.latitude
        item.farmer_lng = farmer.longitude

        if buyer_lat is not None and buyer_lng is not None and farmer.latitude and farmer.longitude:
            dist = haversine(buyer_lat, buyer_lng, farmer.latitude, farmer.longitude)
            item.distance_km = round(dist, 2)
            if max_distance_km and dist > max_distance_km:
                continue

        inventory_list.append(item)

    # Sort results
    if buyer_lat and sort_by == "distance":
        inventory_list.sort(key=lambda x: x.distance_km or 9999)
    elif sort_by == "price":
        reverse = sort_order == "desc"
        inventory_list.sort(key=lambda x: x.price_per_unit, reverse=reverse)

    return inventory_list


@router.post("/", response_model=InventoryResponse, status_code=201)
async def create_inventory(
    data: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Only farmers can add inventory")

    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "Farmer profile not found")

    # Verify product exists
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(404, "Product not found")

    inv = Inventory(farmer_id=farmer.id, **data.model_dump())
    db.add(inv)
    await db.commit()
    await db.refresh(inv)

    item = InventoryResponse.model_validate(inv)
    item.product = ProductResponse.model_validate(product)
    item.farmer_name = farmer.name
    return item


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: int,
    data: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(404, "Inventory item not found")

    if current_user.role == "farmer":
        result2 = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
        farmer = result2.scalar_one_or_none()
        if not farmer or inv.farmer_id != farmer.id:
            raise HTTPException(403, "Not your inventory")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(inv, key, value)

    await db.commit()
    await db.refresh(inv)
    return InventoryResponse.model_validate(inv)


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(404, "Inventory item not found")

    if current_user.role == "farmer":
        result2 = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
        farmer = result2.scalar_one_or_none()
        if not farmer or inv.farmer_id != farmer.id:
            raise HTTPException(403, "Not your inventory")

    if inv.quantity_reserved > 0:
        raise HTTPException(400, "Cannot delete inventory with reserved quantities (active orders)")

    await db.delete(inv)
    await db.commit()


@router.post("/{inventory_id}/upload-image")
async def upload_inventory_image(
    inventory_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(404, "Inventory not found")

    upload_dir = "./uploads/inventory"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    inv.image_url = f"/uploads/inventory/{filename}"
    await db.commit()
    return {"image_url": inv.image_url}
