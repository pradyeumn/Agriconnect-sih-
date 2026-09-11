from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Procurement, Product.name).join(Product, Procurement.product_id == Product.id)
    if status:
        query = query.where(Procurement.status == status)
    result = await db.execute(query)
    rows = result.all()
    procurements = []
    for proc, product_name in rows:
        p = ProcurementResponse.model_validate(proc)
        p.product_name = product_name
        procurements.append(p)
    return procurements


@router.post("/", response_model=ProcurementResponse, status_code=201)
async def create_procurement(
    data: ProcurementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    proc = Procurement(admin_id=current_user.id, **data.model_dump())
    db.add(proc)
    await db.commit()
    await db.refresh(proc)

    result = await db.execute(select(Product).where(Product.id == proc.product_id))
    product = result.scalar_one_or_none()

    p = ProcurementResponse.model_validate(proc)
    if product:
        p.product_name = product.name
    return p


@router.get("/{procurement_id}", response_model=ProcurementResponse)
async def get_procurement(
    procurement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Procurement, Product.name)
        .join(Product, Procurement.product_id == Product.id)
        .where(Procurement.id == procurement_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Procurement not found")
    proc, product_name = row
    p = ProcurementResponse.model_validate(proc)
    p.product_name = product_name
    return p


# ── Slots ──────────────────────────────────────────────────────────────────────

@router.get("/slots/all", response_model=List[SlotResponse])
async def list_all_slots(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(ProcurementSlot, CollectionCenter.name, Procurement.title, Product.name)
        .join(CollectionCenter, ProcurementSlot.collection_center_id == CollectionCenter.id)
        .join(Procurement, ProcurementSlot.procurement_id == Procurement.id)
        .join(Product, Procurement.product_id == Product.id)
    )
    result = await db.execute(query)
    rows = result.all()
    slots = []
    for slot, cc_name, proc_title, prod_name in rows:
        s = SlotResponse.model_validate(slot)
        s.collection_center_name = cc_name
        s.procurement_title = proc_title
        s.product_name = prod_name
        slots.append(s)
    return slots


@router.get("/slots/my", response_model=List[SlotResponse])
async def list_my_slots(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """For farmers: slots they have allocations in."""
    if current_user.role != "farmer":
        raise HTTPException(403, "Farmer access required")

    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "Farmer profile not found")

    query = (
        select(ProcurementSlot, CollectionCenter.name, Procurement.title, Product.name)
        .join(SlotAllocation, SlotAllocation.slot_id == ProcurementSlot.id)
        .join(CollectionCenter, ProcurementSlot.collection_center_id == CollectionCenter.id)
        .join(Procurement, ProcurementSlot.procurement_id == Procurement.id)
        .join(Product, Procurement.product_id == Product.id)
        .where(SlotAllocation.farmer_id == farmer.id)
    )
    result = await db.execute(query)
    rows = result.all()
    slots = []
    for slot, cc_name, proc_title, prod_name in rows:
        s = SlotResponse.model_validate(slot)
        s.collection_center_name = cc_name
        s.procurement_title = proc_title
        s.product_name = prod_name
        slots.append(s)
    return slots


@router.post("/slots", response_model=SlotResponse, status_code=201)
async def create_slot(
    data: SlotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    slot = ProcurementSlot(**data.model_dump())
    db.add(slot)
    await db.commit()
    await db.refresh(slot)

    result = await db.execute(
        select(CollectionCenter.name).where(CollectionCenter.id == slot.collection_center_id)
    )
    cc_name = result.scalar_one_or_none()
    result2 = await db.execute(
        select(Procurement.title, Product.name)
        .join(Product, Procurement.product_id == Product.id)
        .where(Procurement.id == slot.procurement_id)
    )
    row = result2.first()

    s = SlotResponse.model_validate(slot)
    s.collection_center_name = cc_name
    if row:
        s.procurement_title, s.product_name = row
    return s


@router.get("/slots/{slot_id}/recommend", response_model=list)
async def recommend_farmers_for_slot(
    slot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Smart allocation: recommend ranked farmers for a slot."""
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    # Load slot
    result = await db.execute(select(ProcurementSlot).where(ProcurementSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(404, "Slot not found")

    # Load procurement + product
    result = await db.execute(
        select(Procurement, Product)
        .join(Product, Procurement.product_id == Product.id)
        .where(Procurement.id == slot.procurement_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Procurement not found")
    procurement, product = row

    # Load collection center
    result = await db.execute(select(CollectionCenter).where(CollectionCenter.id == slot.collection_center_id))
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(404, "Collection center not found")

    # Find eligible farmers: grow the required crop AND have available inventory
    result = await db.execute(
        select(Farmer, Inventory)
        .join(Inventory, Inventory.farmer_id == Farmer.id)
        .where(
            Inventory.product_id == product.id,
            Inventory.status == "available",
            Inventory.quantity_available > 0,
            Farmer.crops.ilike(f"%{product.name}%")
        )
    )
    rows = result.all()

    if not rows:
        return []

    candidates = []
    for farmer, inv in rows:
        candidates.append({
            "farmer_id": farmer.id,
            "name": farmer.name,
            "phone": farmer.phone,
            "village": farmer.village or "",
            "latitude": farmer.latitude or 0,
            "longitude": farmer.longitude or 0,
            "reliability_score": farmer.reliability_score,
            "crops": farmer.crops or "",
            "available_quantity": inv.quantity_available,
        })

    slot_dict = {"capacity": slot.capacity, "allocated_quantity": slot.allocated_quantity}
    center_dict = {"latitude": center.latitude, "longitude": center.longitude}

    ranked = calculate_allocation_scores(
        candidates, slot_dict, center_dict, product.name, procurement.required_quantity
    )
    return format_allocation_results(ranked)


@router.post("/slots/{slot_id}/allocate", response_model=AllocationResponse, status_code=201)
async def allocate_farmer_to_slot(
    slot_id: int,
    farmer_id: int,
    quantity: float,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin creates an allocation for a farmer."""
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    result = await db.execute(select(ProcurementSlot).where(ProcurementSlot.id == slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(404, "Slot not found")

    if slot.allocated_quantity + quantity > slot.capacity:
        raise HTTPException(400, f"Exceeds slot capacity. Available: {slot.capacity - slot.allocated_quantity}")

    result = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "Farmer not found")

    alloc = SlotAllocation(
        slot_id=slot_id,
        farmer_id=farmer_id,
        allocated_quantity=quantity,
        status="pending"
    )
    db.add(alloc)

    # Notify farmer
    notif = Notification(
        user_id=farmer.user_id,
        title="New Procurement Slot",
        message=f"You have been allocated to a procurement slot. Please confirm.",
        notification_type="procurement",
        link=f"/farmer/procurement"
    )
    db.add(notif)

    await db.commit()
    await db.refresh(alloc)

    a = AllocationResponse.model_validate(alloc)
    a.farmer_name = farmer.name
    a.farmer_phone = farmer.phone
    a.farmer_village = farmer.village
    return a


@router.patch("/allocations/{allocation_id}/admin-action", response_model=AllocationResponse)
async def admin_allocation_action(
    allocation_id: int,
    action: AllocationAction,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin approves or rejects an allocation."""
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    result = await db.execute(select(SlotAllocation).where(SlotAllocation.id == allocation_id))
    alloc = result.scalar_one_or_none()
    if not alloc:
        raise HTTPException(404, "Allocation not found")

    if action.action == "approve":
        alloc.status = "approved"
        if action.quantity:
            alloc.allocated_quantity = action.quantity

        # Update slot allocated quantity
        slot_result = await db.execute(
            select(ProcurementSlot).where(ProcurementSlot.id == alloc.slot_id).with_for_update()
        )
        slot = slot_result.scalar_one_or_none()
        if slot:
            slot.allocated_quantity += alloc.allocated_quantity

        # Notify farmer
        farmer_result = await db.execute(select(Farmer).where(Farmer.id == alloc.farmer_id))
        farmer = farmer_result.scalar_one_or_none()
        if farmer:
            notif = Notification(
                user_id=farmer.user_id,
                title="Allocation Approved",
                message=f"Your procurement slot allocation has been approved! Please confirm your participation.",
                notification_type="allocation",
                link="/farmer/procurement"
            )
            db.add(notif)
    elif action.action == "reject":
        alloc.status = "rejected"
        alloc.admin_notes = action.notes
    else:
        raise HTTPException(400, "Action must be 'approve' or 'reject'")

    await db.commit()
    await db.refresh(alloc)

    result = await db.execute(select(Farmer).where(Farmer.id == alloc.farmer_id))
    farmer = result.scalar_one_or_none()

    a = AllocationResponse.model_validate(alloc)
    if farmer:
        a.farmer_name = farmer.name
        a.farmer_phone = farmer.phone
        a.farmer_village = farmer.village
    return a


@router.patch("/allocations/{allocation_id}/farmer-action", response_model=AllocationResponse)
async def farmer_allocation_action(
    allocation_id: int,
    action: FarmerAllocationAction,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Farmer confirms or cancels their slot allocation."""
    if current_user.role != "farmer":
        raise HTTPException(403, "Farmer access required")

    result = await db.execute(select(SlotAllocation).where(SlotAllocation.id == allocation_id))
    alloc = result.scalar_one_or_none()
    if not alloc:
        raise HTTPException(404, "Allocation not found")

    # Verify this farmer owns the allocation
    farmer_result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = farmer_result.scalar_one_or_none()
    if not farmer or alloc.farmer_id != farmer.id:
        raise HTTPException(403, "Not your allocation")

    if alloc.status not in ["approved"]:
        raise HTTPException(400, f"Can only confirm approved allocations. Current status: {alloc.status}")

    if action.action == "confirm":
        alloc.status = "confirmed"
        alloc.farmer_notes = action.notes
        # Update farmer reliability score
        farmer.reliability_score = min(100.0, farmer.reliability_score + 1.0)
    elif action.action == "cancel":
        alloc.status = "cancelled"
        alloc.farmer_notes = action.notes
        # Revert slot capacity
        slot_result = await db.execute(
            select(ProcurementSlot).where(ProcurementSlot.id == alloc.slot_id).with_for_update()
        )
        slot = slot_result.scalar_one_or_none()
        if slot:
            slot.allocated_quantity -= alloc.allocated_quantity
            if slot.allocated_quantity < 0:
                slot.allocated_quantity = 0
        # Reduce reliability
        farmer.reliability_score = max(0.0, farmer.reliability_score - 2.0)
    else:
        raise HTTPException(400, "Action must be 'confirm' or 'cancel'")

    await db.commit()
    await db.refresh(alloc)

    a = AllocationResponse.model_validate(alloc)
    a.farmer_name = farmer.name
    a.farmer_phone = farmer.phone
    a.farmer_village = farmer.village
    return a


@router.get("/allocations/", response_model=List[AllocationResponse])
async def list_allocations(
    slot_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(SlotAllocation, Farmer.name, Farmer.phone, Farmer.village).join(
        Farmer, SlotAllocation.farmer_id == Farmer.id
    )

    if current_user.role == "farmer":
        farmer_result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
        farmer = farmer_result.scalar_one_or_none()
        if farmer:
            query = query.where(SlotAllocation.farmer_id == farmer.id)
    else:
        if farmer_id:
            query = query.where(SlotAllocation.farmer_id == farmer_id)

    if slot_id:
        query = query.where(SlotAllocation.slot_id == slot_id)
    if status:
        query = query.where(SlotAllocation.status == status)

    result = await db.execute(query)
    rows = result.all()
    allocations = []
    for alloc, name, phone, village in rows:
        a = AllocationResponse.model_validate(alloc)
        a.farmer_name = name
        a.farmer_phone = phone
        a.farmer_village = village
        allocations.append(a)
    return allocations
