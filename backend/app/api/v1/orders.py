from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.order import Order, OrderItem
from app.models.inventory import Inventory
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.models.user import User
from app.models.notification import Notification
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, FarmerOrderAction

router = APIRouter(prefix="/orders", tags=["Orders"])


async def create_notification(db: AsyncSession, user_id: int, title: str, message: str, notif_type: str, link: str = None):
    notif = Notification(user_id=user_id, title=title, message=message, notification_type=notif_type, link=link)
    db.add(notif)


@router.post("/", response_model=OrderResponse, status_code=201)
async def place_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Only buyers can place orders")

    result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(404, "Buyer profile not found")

    total_amount = 0.0
    order_items_data = []

    # Validate and reserve inventory atomically
    for item_data in order_data.items:
        result = await db.execute(
            select(Inventory).where(Inventory.id == item_data.inventory_id).with_for_update()
        )
        inv = result.scalar_one_or_none()
        if not inv:
            raise HTTPException(404, f"Inventory {item_data.inventory_id} not found")
        if inv.status != "available":
            raise HTTPException(400, f"Item {inv.id} is not available")
        if inv.quantity_available < item_data.quantity:
            raise HTTPException(
                400,
                f"Insufficient stock. Available: {inv.quantity_available}, Requested: {item_data.quantity}"
            )

        # Reserve quantity
        inv.quantity_available -= item_data.quantity
        inv.quantity_reserved += item_data.quantity
        if inv.quantity_available == 0:
            inv.status = "reserved"

        subtotal = item_data.quantity * inv.price_per_unit
        total_amount += subtotal
        order_items_data.append((inv, item_data.quantity, inv.price_per_unit, subtotal))

    # Create order
    order = Order(
        buyer_id=buyer.id,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address or buyer.address,
        delivery_lat=order_data.delivery_lat or buyer.latitude,
        delivery_lng=order_data.delivery_lng or buyer.longitude,
        notes=order_data.notes,
        status="pending",
        farmer_status="pending",
    )
    db.add(order)
    await db.flush()

    # Create order items and notify farmers
    farmer_ids_notified = set()
    for inv, qty, price, subtotal in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            inventory_id=inv.id,
            quantity=qty,
            price_per_unit=price,
            subtotal=subtotal,
        )
        db.add(order_item)

        # Notify the farmer
        if inv.farmer_id not in farmer_ids_notified:
            result = await db.execute(select(Farmer).where(Farmer.id == inv.farmer_id))
            farmer = result.scalar_one_or_none()
            if farmer:
                await create_notification(
                    db, farmer.user_id,
                    "New Order Received",
                    f"You have a new order from {buyer.name} for ₹{total_amount:.0f}",
                    "order",
                    f"/farmer/orders/{order.id}"
                )
            farmer_ids_notified.add(inv.farmer_id)

    await db.commit()
    await db.refresh(order)

    # Load with relationships for response
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.inventory).selectinload(Inventory.product))
        .where(Order.id == order.id)
    )
    order = result.scalar_one()
    resp = OrderResponse.model_validate(order)
    resp.buyer_name = buyer.name
    return resp


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.inventory).selectinload(Inventory.product)
    )

    if current_user.role == "buyer":
        result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
        buyer = result.scalar_one_or_none()
        if buyer:
            query = query.where(Order.buyer_id == buyer.id)
    elif current_user.role == "farmer":
        result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
        farmer = result.scalar_one_or_none()
        if farmer:
            # Farmer sees orders that contain their inventory
            from sqlalchemy import exists
            farmer_inv_subq = select(Inventory.id).where(Inventory.farmer_id == farmer.id)
            query = query.where(
                exists().where(
                    and_(OrderItem.order_id == Order.id, OrderItem.inventory_id.in_(farmer_inv_subq))
                )
            )

    if status:
        query = query.where(Order.status == status)

    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()

    responses = []
    for order in orders:
        resp = OrderResponse.model_validate(order)
        buyer_result = await db.execute(select(Buyer).where(Buyer.id == order.buyer_id))
        buyer = buyer_result.scalar_one_or_none()
        if buyer:
            resp.buyer_name = buyer.name
        responses.append(resp)
    return responses


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.inventory).selectinload(Inventory.product))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")

    resp = OrderResponse.model_validate(order)
    buyer_result = await db.execute(select(Buyer).where(Buyer.id == order.buyer_id))
    buyer = buyer_result.scalar_one_or_none()
    if buyer:
        resp.buyer_name = buyer.name
    return resp


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")

    if current_user.role not in ["admin"]:
        raise HTTPException(403, "Only admin can update order status directly")

    old_status = order.status
    order.status = update.status

    # Handle inventory on completion or cancellation
    if update.status == "completed" and old_status != "completed":
        result2 = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order_id)
        )
        items = result2.scalars().all()
        for item in items:
            inv_result = await db.execute(
                select(Inventory).where(Inventory.id == item.inventory_id).with_for_update()
            )
            inv = inv_result.scalar_one_or_none()
            if inv:
                inv.quantity_reserved -= item.quantity
                inv.quantity_sold += item.quantity
                if inv.quantity_reserved < 0:
                    inv.quantity_reserved = 0

    elif update.status == "cancelled" and old_status not in ["completed", "cancelled"]:
        result2 = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order_id)
        )
        items = result2.scalars().all()
        for item in items:
            inv_result = await db.execute(
                select(Inventory).where(Inventory.id == item.inventory_id).with_for_update()
            )
            inv = inv_result.scalar_one_or_none()
            if inv:
                inv.quantity_reserved -= item.quantity
                inv.quantity_available += item.quantity
                if inv.quantity_reserved < 0:
                    inv.quantity_reserved = 0
                inv.status = "available"

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/farmer-action", response_model=OrderResponse)
async def farmer_order_action(
    order_id: int,
    action: FarmerOrderAction,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Only farmers can accept/reject orders")

    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")

    result2 = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result2.scalar_one_or_none()

    if action.action == "accept":
        order.farmer_status = "accepted"
        order.status = "confirmed"
        # Notify buyer
        buyer_result = await db.execute(select(Buyer).where(Buyer.id == order.buyer_id))
        buyer = buyer_result.scalar_one_or_none()
        if buyer:
            await create_notification(
                db, buyer.user_id,
                "Order Accepted",
                f"Your order #{order.id} has been accepted by the farmer",
                "order",
                f"/buyer/orders/{order.id}"
            )
    elif action.action == "reject":
        order.farmer_status = "rejected"
        order.status = "cancelled"
        # Return inventory
        items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        items = items_result.scalars().all()
        for item in items:
            inv_result = await db.execute(
                select(Inventory).where(Inventory.id == item.inventory_id).with_for_update()
            )
            inv = inv_result.scalar_one_or_none()
            if inv:
                inv.quantity_reserved -= item.quantity
                inv.quantity_available += item.quantity
                if inv.quantity_reserved < 0:
                    inv.quantity_reserved = 0
                inv.status = "available"
        # Notify buyer
        buyer_result = await db.execute(select(Buyer).where(Buyer.id == order.buyer_id))
        buyer = buyer_result.scalar_one_or_none()
        if buyer:
            await create_notification(
                db, buyer.user_id,
                "Order Rejected",
                f"Your order #{order.id} was rejected by the farmer. Inventory has been restored.",
                "order",
                f"/buyer/orders/{order.id}"
            )
    else:
        raise HTTPException(400, "Action must be 'accept' or 'reject'")

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Buyer can cancel their own pending order."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")

    if current_user.role == "buyer":
        buyer_result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
        buyer = buyer_result.scalar_one_or_none()
        if not buyer or order.buyer_id != buyer.id:
            raise HTTPException(403, "Not your order")

    if order.status not in ["pending", "confirmed"]:
        raise HTTPException(400, f"Cannot cancel order in '{order.status}' status")

    order.status = "cancelled"

    # Return reserved inventory
    items_result = await db.execute(select(OrderItem).where(OrderItem.order_id == order_id))
    items = items_result.scalars().all()
    for item in items:
        inv_result = await db.execute(
            select(Inventory).where(Inventory.id == item.inventory_id).with_for_update()
        )
        inv = inv_result.scalar_one_or_none()
        if inv:
            inv.quantity_reserved -= item.quantity
            inv.quantity_available += item.quantity
            if inv.quantity_reserved < 0:
                inv.quantity_reserved = 0
            inv.status = "available"

    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)
