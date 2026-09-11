from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import re

from app.core.database import get_db, get_next_id
from app.core.security import get_current_user, require_admin
from app.models.procurement import Procurement, ProcurementSlot, SlotAllocation
from app.models.collection_center import CollectionCenter
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.notification import Notification
from app.models.user import User
from app.schemas.procurement import (
    ProcurementCreate, ProcurementResponse,
    SlotCreate, SlotResponse,
    AllocationResponse, AllocationAction, FarmerAllocationAction
)
from app.services.allocation import calculate_allocation_scores, format_allocation_results

router = APIRouter(prefix="/procurement", tags=["Procurement"])


# ── Procurement ────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ProcurementResponse])
async def list_procurements(
    status: Optional[str] = None,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status

    cursor = db.procurements.find(query)
    proc_docs = await cursor.to_list(length=100)

    p_ids = list(set([doc["product_id"] for doc in proc_docs if "product_id" in doc]))
    prods_cursor = db.products.find({"id": {"$in": p_ids}})
    prods_list = await prods_cursor.to_list(length=len(p_ids) or 1)
    prods_map = {p["id"]: p.get("name", "") for p in prods_list}

    procurements = []
    for doc in proc_docs:
        p_obj = Procurement(**doc)
        p_res = ProcurementResponse.model_validate(p_obj)
        p_res.product_name = prods_map.get(doc.get("product_id"), "")
        procurements.append(p_res)

    return procurements


@router.post("/", response_model=ProcurementResponse, status_code=201)
async def create_procurement(
    data: ProcurementCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    p_id = await get_next_id(db, "procurements")
    now = datetime.utcnow()
    doc = {
        "id": p_id,
        "admin_id": current_user.id,
        **data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db.procurements.insert_one(doc)

    product_doc = await db.products.find_one({"id": doc["product_id"]})
    p_obj = Procurement(**doc)
    p_res = ProcurementResponse.model_validate(p_obj)
    if product_doc:
        p_res.product_name = product_doc.get("name", "")
    return p_res


@router.get("/{procurement_id}", response_model=ProcurementResponse)
async def get_procurement(
    procurement_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = await db.procurements.find_one({"id": procurement_id})
    if not doc:
        raise HTTPException(404, "Procurement not found")

    product_doc = await db.products.find_one({"id": doc.get("product_id")})
    p_obj = Procurement(**doc)
    p_res = ProcurementResponse.model_validate(p_obj)
    if product_doc:
        p_res.product_name = product_doc.get("name", "")
    return p_res


# ── Slots ──────────────────────────────────────────────────────────────────────

@router.get("/slots/all", response_model=List[SlotResponse])
async def list_all_slots(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cursor = db.procurement_slots.find({})
    slot_docs = await cursor.to_list(length=100)

    cc_ids = list(set([s["collection_center_id"] for s in slot_docs if "collection_center_id" in s]))
    proc_ids = list(set([s["procurement_id"] for s in slot_docs if "procurement_id" in s]))

    ccs = await db.collection_centers.find({"id": {"$in": cc_ids}}).to_list(length=len(cc_ids) or 1)
    cc_map = {c["id"]: c.get("name", "") for c in ccs}

    procs = await db.procurements.find({"id": {"$in": proc_ids}}).to_list(length=len(proc_ids) or 1)
    proc_map = {p["id"]: p for p in procs}

    p_ids = list(set([p["product_id"] for p in procs if "product_id" in p]))
    prods = await db.products.find({"id": {"$in": p_ids}}).to_list(length=len(p_ids) or 1)
    prod_map = {p["id"]: p.get("name", "") for p in prods}

    slots = []
    for doc in slot_docs:
        s_obj = ProcurementSlot(**doc)
        s_res = SlotResponse.model_validate(s_obj)
        s_res.collection_center_name = cc_map.get(doc.get("collection_center_id"), "")

        proc_doc = proc_map.get(doc.get("procurement_id"))
        if proc_doc:
            s_res.procurement_title = proc_doc.get("title", "")
            s_res.product_name = prod_map.get(proc_doc.get("product_id"), "")

        slots.append(s_res)
    return slots


@router.get("/slots/my", response_model=List[SlotResponse])
async def list_my_slots(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Farmer access required")

    farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
    if not farmer_doc:
        raise HTTPException(404, "Farmer profile not found")

    alloc_cursor = db.slot_allocations.find({"farmer_id": farmer_doc["id"]})
    allocs = await alloc_cursor.to_list(length=100)
    slot_ids = [a["slot_id"] for a in allocs if "slot_id" in a]

    slot_docs = await db.procurement_slots.find({"id": {"$in": slot_ids}}).to_list(length=len(slot_ids) or 1)

    cc_ids = list(set([s["collection_center_id"] for s in slot_docs if "collection_center_id" in s]))
    proc_ids = list(set([s["procurement_id"] for s in slot_docs if "procurement_id" in s]))

    ccs = await db.collection_centers.find({"id": {"$in": cc_ids}}).to_list(length=len(cc_ids) or 1)
    cc_map = {c["id"]: c.get("name", "") for c in ccs}

    procs = await db.procurements.find({"id": {"$in": proc_ids}}).to_list(length=len(proc_ids) or 1)
    proc_map = {p["id"]: p for p in procs}

    p_ids = list(set([p["product_id"] for p in procs if "product_id" in p]))
    prods = await db.products.find({"id": {"$in": p_ids}}).to_list(length=len(p_ids) or 1)
    prod_map = {p["id"]: p.get("name", "") for p in prods}

    slots = []
    for doc in slot_docs:
        s_obj = ProcurementSlot(**doc)
        s_res = SlotResponse.model_validate(s_obj)
        s_res.collection_center_name = cc_map.get(doc.get("collection_center_id"), "")

        proc_doc = proc_map.get(doc.get("procurement_id"))
        if proc_doc:
            s_res.procurement_title = proc_doc.get("title", "")
            s_res.product_name = prod_map.get(proc_doc.get("product_id"), "")

        slots.append(s_res)
    return slots


@router.post("/slots", response_model=SlotResponse, status_code=201)
async def create_slot(
    data: SlotCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    s_id = await get_next_id(db, "procurement_slots")
    now = datetime.utcnow()
    doc = {
        "id": s_id,
        **data.model_dump(),
        "allocated_quantity": 0.0,
        "status": "open",
        "created_at": now
    }
    await db.procurement_slots.insert_one(doc)

    cc_doc = await db.collection_centers.find_one({"id": doc["collection_center_id"]})
    proc_doc = await db.procurements.find_one({"id": doc["procurement_id"]})

    s_obj = ProcurementSlot(**doc)
    s_res = SlotResponse.model_validate(s_obj)
    if cc_doc:
        s_res.collection_center_name = cc_doc.get("name", "")
    if proc_doc:
        s_res.procurement_title = proc_doc.get("title", "")
        prod_doc = await db.products.find_one({"id": proc_doc.get("product_id")})
        if prod_doc:
            s_res.product_name = prod_doc.get("name", "")
    return s_res


@router.get("/slots/{slot_id}/recommend", response_model=list)
async def recommend_farmers_for_slot(
    slot_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    slot_doc = await db.procurement_slots.find_one({"id": slot_id})
    if not slot_doc:
        raise HTTPException(404, "Slot not found")

    proc_doc = await db.procurements.find_one({"id": slot_doc["procurement_id"]})
    if not proc_doc:
        raise HTTPException(404, "Procurement not found")

    prod_doc = await db.products.find_one({"id": proc_doc["product_id"]})
    if not prod_doc:
        raise HTTPException(404, "Product not found")

    center_doc = await db.collection_centers.find_one({"id": slot_doc["collection_center_id"]})
    if not center_doc:
        raise HTTPException(404, "Collection center not found")

    # Find available inventory for this product
    inv_cursor = db.inventory.find({
        "product_id": prod_doc["id"],
        "status": "available",
        "quantity_available": {"$gt": 0}
    })
    inv_docs = await inv_cursor.to_list(length=500)
    farmer_ids = [inv["farmer_id"] for inv in inv_docs]

    # Find farmers matching crop & farmer_ids
    rx = re.compile(prod_doc["name"], re.IGNORECASE)
    farmers_cursor = db.farmers.find({
        "id": {"$in": farmer_ids},
        "crops": rx
    })
    farmer_docs = await farmers_cursor.to_list(length=len(farmer_ids) or 1)
    farmer_map = {f["id"]: f for f in farmer_docs}

    candidates = []
    for inv in inv_docs:
        f = farmer_map.get(inv["farmer_id"])
        if f:
            candidates.append({
                "farmer_id": f["id"],
                "name": f.get("name", ""),
                "phone": f.get("phone", ""),
                "village": f.get("village", "") or "",
                "latitude": f.get("latitude", 0.0) or 0.0,
                "longitude": f.get("longitude", 0.0) or 0.0,
                "reliability_score": f.get("reliability_score", 75.0),
                "crops": f.get("crops", "") or "",
                "available_quantity": inv.get("quantity_available", 0.0),
            })

    if not candidates:
        return []

    slot_dict = {"capacity": slot_doc["capacity"], "allocated_quantity": slot_doc.get("allocated_quantity", 0.0)}
    center_dict = {"latitude": center_doc.get("latitude", 0.0), "longitude": center_doc.get("longitude", 0.0)}

    ranked = calculate_allocation_scores(
        candidates, slot_dict, center_dict, prod_doc["name"], proc_doc["required_quantity"]
    )
    return format_allocation_results(ranked)


@router.post("/slots/{slot_id}/allocate", response_model=AllocationResponse, status_code=201)
async def allocate_farmer_to_slot(
    slot_id: int,
    farmer_id: int,
    quantity: float,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    slot_doc = await db.procurement_slots.find_one({"id": slot_id})
    if not slot_doc:
        raise HTTPException(404, "Slot not found")

    alloc_qty = slot_doc.get("allocated_quantity", 0.0)
    if alloc_qty + quantity > slot_doc["capacity"]:
        raise HTTPException(400, f"Exceeds slot capacity. Available: {slot_doc['capacity'] - alloc_qty}")

    farmer_doc = await db.farmers.find_one({"id": farmer_id})
    if not farmer_doc:
        raise HTTPException(404, "Farmer not found")

    a_id = await get_next_id(db, "slot_allocations")
    now = datetime.utcnow()
    alloc_doc = {
        "id": a_id,
        "slot_id": slot_id,
        "farmer_id": farmer_id,
        "allocated_quantity": quantity,
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }
    await db.slot_allocations.insert_one(alloc_doc)

    n_id = await get_next_id(db, "notifications")
    await db.notifications.insert_one({
        "id": n_id,
        "user_id": farmer_doc["user_id"],
        "title": "New Procurement Slot",
        "message": "You have been allocated to a procurement slot. Please confirm.",
        "notification_type": "procurement",
        "is_read": False,
        "link": "/farmer/procurement",
        "created_at": now
    })

    a_obj = SlotAllocation(**alloc_doc)
    a_res = AllocationResponse.model_validate(a_obj)
    a_res.farmer_name = farmer_doc.get("name", "")
    a_res.farmer_phone = farmer_doc.get("phone", "")
    a_res.farmer_village = farmer_doc.get("village", "")
    return a_res


@router.patch("/allocations/{allocation_id}/admin-action", response_model=AllocationResponse)
async def admin_allocation_action(
    allocation_id: int,
    action: AllocationAction,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    alloc_doc = await db.slot_allocations.find_one({"id": allocation_id})
    if not alloc_doc:
        raise HTTPException(404, "Allocation not found")

    now = datetime.utcnow()
    if action.action == "approve":
        new_qty = action.quantity if action.quantity else alloc_doc["allocated_quantity"]
        await db.slot_allocations.update_one(
            {"id": allocation_id},
            {"$set": {"status": "approved", "allocated_quantity": new_qty, "updated_at": now}}
        )

        slot_doc = await db.procurement_slots.find_one({"id": alloc_doc["slot_id"]})
        if slot_doc:
            await db.procurement_slots.update_one(
                {"id": slot_doc["id"]},
                {"$inc": {"allocated_quantity": new_qty}}
            )

        farmer_doc = await db.farmers.find_one({"id": alloc_doc["farmer_id"]})
        if farmer_doc:
            n_id = await get_next_id(db, "notifications")
            await db.notifications.insert_one({
                "id": n_id,
                "user_id": farmer_doc["user_id"],
                "title": "Allocation Approved",
                "message": "Your procurement slot allocation has been approved! Please confirm your participation.",
                "notification_type": "allocation",
                "is_read": False,
                "link": "/farmer/procurement",
                "created_at": now
            })
    elif action.action == "reject":
        await db.slot_allocations.update_one(
            {"id": allocation_id},
            {"$set": {"status": "rejected", "admin_notes": action.notes, "updated_at": now}}
        )
    else:
        raise HTTPException(400, "Action must be 'approve' or 'reject'")

    updated_alloc = await db.slot_allocations.find_one({"id": allocation_id})
    farmer_doc = await db.farmers.find_one({"id": updated_alloc["farmer_id"]})

    a_res = AllocationResponse.model_validate(SlotAllocation(**updated_alloc))
    if farmer_doc:
        a_res.farmer_name = farmer_doc.get("name", "")
        a_res.farmer_phone = farmer_doc.get("phone", "")
        a_res.farmer_village = farmer_doc.get("village", "")
    return a_res


@router.patch("/allocations/{allocation_id}/farmer-action", response_model=AllocationResponse)
async def farmer_allocation_action(
    allocation_id: int,
    action: FarmerAllocationAction,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Farmer access required")

    alloc_doc = await db.slot_allocations.find_one({"id": allocation_id})
    if not alloc_doc:
        raise HTTPException(404, "Allocation not found")

    farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
    if not farmer_doc or alloc_doc["farmer_id"] != farmer_doc["id"]:
        raise HTTPException(403, "Not your allocation")

    if alloc_doc.get("status") not in ["approved"]:
        raise HTTPException(400, f"Can only confirm approved allocations. Current status: {alloc_doc.get('status')}")

    now = datetime.utcnow()
    if action.action == "confirm":
        await db.slot_allocations.update_one(
            {"id": allocation_id},
            {"$set": {"status": "confirmed", "farmer_notes": action.notes, "updated_at": now}}
        )
        new_score = min(100.0, farmer_doc.get("reliability_score", 75.0) + 1.0)
        await db.farmers.update_one({"id": farmer_doc["id"]}, {"$set": {"reliability_score": new_score}})
    elif action.action == "cancel":
        await db.slot_allocations.update_one(
            {"id": allocation_id},
            {"$set": {"status": "cancelled", "farmer_notes": action.notes, "updated_at": now}}
        )
        slot_doc = await db.procurement_slots.find_one({"id": alloc_doc["slot_id"]})
        if slot_doc:
            new_alloc_qty = max(0.0, slot_doc.get("allocated_quantity", 0.0) - alloc_doc["allocated_quantity"])
            await db.procurement_slots.update_one({"id": slot_doc["id"]}, {"$set": {"allocated_quantity": new_alloc_qty}})

        new_score = max(0.0, farmer_doc.get("reliability_score", 75.0) - 2.0)
        await db.farmers.update_one({"id": farmer_doc["id"]}, {"$set": {"reliability_score": new_score}})
    else:
        raise HTTPException(400, "Action must be 'confirm' or 'cancel'")

    updated_alloc = await db.slot_allocations.find_one({"id": allocation_id})
    a_res = AllocationResponse.model_validate(SlotAllocation(**updated_alloc))
    a_res.farmer_name = farmer_doc.get("name", "")
    a_res.farmer_phone = farmer_doc.get("phone", "")
    a_res.farmer_village = farmer_doc.get("village", "")
    return a_res


@router.get("/allocations/", response_model=List[AllocationResponse])
async def list_allocations(
    slot_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    status: Optional[str] = None,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = {}
    if current_user.role == "farmer":
        farmer_doc = await db.farmers.find_one({"user_id": current_user.id})
        if farmer_doc:
            query["farmer_id"] = farmer_doc["id"]
    elif farmer_id:
        query["farmer_id"] = farmer_id

    if slot_id:
        query["slot_id"] = slot_id
    if status:
        query["status"] = status

    cursor = db.slot_allocations.find(query)
    alloc_docs = await cursor.to_list(length=200)

    f_ids = list(set([a["farmer_id"] for a in alloc_docs if "farmer_id" in a]))
    farmers = await db.farmers.find({"id": {"$in": f_ids}}).to_list(length=len(f_ids) or 1)
    f_map = {f["id"]: f for f in farmers}

    allocations = []
    for doc in alloc_docs:
        a_obj = SlotAllocation(**doc)
        a_res = AllocationResponse.model_validate(a_obj)
        f_doc = f_map.get(doc.get("farmer_id"))
        if f_doc:
            a_res.farmer_name = f_doc.get("name", "")
            a_res.farmer_phone = f_doc.get("phone", "")
            a_res.farmer_village = f_doc.get("village", "")
        allocations.append(a_res)

    return allocations
