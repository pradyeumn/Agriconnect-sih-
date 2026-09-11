from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.models.inventory import Inventory
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.procurement import Procurement, ProcurementSlot

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/admin/overview")
async def admin_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(403, "Admin only")

    total_farmers = (await db.execute(select(func.count(Farmer.id)))).scalar()
    total_buyers = (await db.execute(select(func.count(Buyer.id)))).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()
    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )).scalar()
    total_inventory = (await db.execute(select(func.count(Inventory.id)))).scalar()
    total_procurement = (await db.execute(select(func.count(Procurement.id)))).scalar()
    active_slots = (await db.execute(
        select(func.count(ProcurementSlot.id)).where(ProcurementSlot.status == "open")
    )).scalar()
    total_sales = (await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.status == "completed")
    )).scalar()

    return {
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_inventory": total_inventory,
        "total_procurement": total_procurement,
        "active_slots": active_slots,
        "total_sales": float(total_sales),
    }


@router.get("/admin/crop-inventory")
async def crop_inventory(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crop-wise available inventory."""
    result = await db.execute(
        select(Product.name, Product.category, func.sum(Inventory.quantity_available))
        .join(Inventory, Inventory.product_id == Product.id)
        .where(Inventory.status == "available")
        .group_by(Product.name, Product.category)
        .order_by(func.sum(Inventory.quantity_available).desc())
    )
    rows = result.all()
    return [{"name": r[0], "category": r[1], "quantity": float(r[2] or 0)} for r in rows]


@router.get("/admin/monthly-sales")
async def monthly_sales(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Monthly completed order sales."""
    result = await db.execute(
        select(
            func.date_trunc("month", Order.created_at).label("month"),
            func.sum(Order.total_amount).label("total"),
            func.count(Order.id).label("count")
        )
        .where(Order.status == "completed")
        .group_by(func.date_trunc("month", Order.created_at))
        .order_by(func.date_trunc("month", Order.created_at))
    )
    rows = result.all()
    return [
        {
            "month": str(r[0])[:7] if r[0] else "",
            "total_sales": float(r[1] or 0),
            "order_count": int(r[2] or 0)
        }
        for r in rows
    ]


@router.get("/admin/location-supply")
async def location_supply(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """District-wise inventory supply."""
    result = await db.execute(
        select(Farmer.district, func.sum(Inventory.quantity_available))
        .join(Inventory, Inventory.farmer_id == Farmer.id)
        .where(Inventory.status == "available")
        .group_by(Farmer.district)
        .order_by(func.sum(Inventory.quantity_available).desc())
        .limit(10)
    )
    rows = result.all()
    return [{"district": r[0] or "Unknown", "quantity": float(r[1] or 0)} for r in rows]


@router.get("/farmer/overview")
async def farmer_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        return {}

    available = (await db.execute(
        select(func.coalesce(func.sum(Inventory.quantity_available), 0))
        .where(Inventory.farmer_id == farmer.id)
    )).scalar()

    reserved = (await db.execute(
        select(func.coalesce(func.sum(Inventory.quantity_reserved), 0))
        .where(Inventory.farmer_id == farmer.id)
    )).scalar()

    sold = (await db.execute(
        select(func.coalesce(func.sum(Inventory.quantity_sold), 0))
        .where(Inventory.farmer_id == farmer.id)
    )).scalar()

    # Orders involving this farmer's inventory
    farmer_inv_ids = (await db.execute(
        select(Inventory.id).where(Inventory.farmer_id == farmer.id)
    )).scalars().all()

    total_orders = 0
    if farmer_inv_ids:
        total_orders = (await db.execute(
            select(func.count(func.distinct(OrderItem.order_id)))
            .where(OrderItem.inventory_id.in_(farmer_inv_ids))
        )).scalar()

    return {
        "available_quantity": float(available),
        "reserved_quantity": float(reserved),
        "sold_quantity": float(sold),
        "total_orders": total_orders,
    }


@router.get("/buyer/overview")
async def buyer_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = result.scalar_one_or_none()
    if not buyer:
        return {}

    total_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.buyer_id == buyer.id)
    )).scalar()

    active_orders = (await db.execute(
        select(func.count(Order.id)).where(
            Order.buyer_id == buyer.id,
            Order.status.in_(["pending", "confirmed", "packed", "dispatched"])
        )
    )).scalar()

    completed_orders = (await db.execute(
        select(func.count(Order.id)).where(
            Order.buyer_id == buyer.id, Order.status == "completed"
        )
    )).scalar()

    total_spent = (await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.buyer_id == buyer.id, Order.status == "completed"
        )
    )).scalar()

    return {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "total_spent": float(total_spent),
    }
