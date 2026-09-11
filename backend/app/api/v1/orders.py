from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db, get_next_id
from app.core.security import get_current_user
from app.models.order import Order, OrderItem
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.models.user import User
from app.models.notification import Notification
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate, FarmerOrderAction
from app.schemas.inventory import ProductResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


async def create_notification(db, user_id: int, title: str, message: str, notif_type: str, link: str = None):
    n_id = await get_next_id(db, "notifications")
    notif = {
        "id": n_id,
        "user_id": user_id,
        "title": title,
        "message": message,
        "notification_type": notif_type,
        "is_read": False,
        "link": link,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(notif)


async def build_order_response(db, order_doc: dict) -> OrderResponse:
    order_id = order_doc["id"]
    order_obj = Order(**order_doc)
    resp = OrderResponse.model_validate(order_obj)

    # Fetch buyer
    buyer_doc = await db.buyers.find_one({"id": order_doc.get("buyer_id")})
    if buyer_doc:
        resp.buyer_name = buyer_doc.get("name", "")

    # Fetch items
    items_cursor = db.order_items.find({"order_id": order_id})
    item_docs = await items_cursor.to_list(length=100)

    # Collect inventory & product ids
    inv_ids = [it["inventory_id"] for it in item_docs if "inventory_id" in it]
    inv_cursor = db.inventory.find({"id": {"$in": inv_ids}})
    inv_docs = await inv_cursor.to_list(length=len(inv_ids) or 1)
    inv_map = {inv["id"]: inv for inv in inv_docs}

    prod_ids = [inv["product_id"] for inv in inv_docs if "product_id" in inv]
    prod_cursor = db.products.find({"id": {"$in": prod_ids}})
    prod_docs = await prod_cursor.to_list(length=len(prod_ids) or 1)
    prod_map = {p["id"]: p for p in prod_docs}

    response_items = []
    for it_doc in item_docs:
        it_obj = OrderItem(**it_doc)
        item_resp = OrderItemResponse.model_validate(it_obj)

        inv_doc = inv_map.get(it_doc.get("inventory_id"))
        if inv_doc:
            prod_doc = prod_map.get(inv_doc.get("product_id"))
            if prod_doc:
                item_resp.product = ProductResponse.model_validate(Product(**prod_doc))

        response_items.append(item_resp)

    resp.items = response_items
    return resp


@router.post("/", response_model=OrderResponse, status_code=201)
async def place_order(
    order_data: OrderCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Only buyers can place orders")

    buyer_doc = await db.buyers.find_one({"user_id": current_user.id})
    if not buyer_doc:
        raise HTTPException(404, "Buyer profile not found")

    total_amount = 0.0
    order_items_data = []

    for item_data in order_data.items:
        inv = await db.inventory.find_one({"id": item_data.inventory_id})
        if not inv:
            raise HTTPException(404, f"Inventory {item_data.inventory_id} not found")
        if inv.get("status") != "available":
            raise HTTPException(400, f"Item {inv['id']} is not available")
        if inv.get("quantity_available", 0) < item_data.quantity:
            raise HTTPException(
                400,
                f"Insufficient stock. Available: {inv.get('quantity_available')}, Requested: {item_data.quantity}"
            )

        new_avail = inv["quantity_available"] - item_data.quantity
        new_res = inv.get("quantity_reserved", 0) + item_data.quantity
        new_status = "reserved" if new_avail == 0 else "available"

        await db.inventory.update_one(
            {"id": inv["id"]},
            {"$set": {
                "quantity_available": new_avail,
                "quantity_reserved": new_res,
                "status": new_status,
                "updated_at": datetime.utcnow()
            }}
        )

        subtotal = item_data.quantity * inv["price_per_unit"]
        total_amount += subtotal
        order_items_data.append((inv, item_data.quantity, inv["price_per_unit"], subtotal))

    order_id = await get_next_id(db, "orders")
    now = datetime.utcnow()
    order_doc = {
        "id": order_id,
        "buyer_id": buyer_doc["id"],
        "total_amount": total_amount,
        "delivery_address": order_data.delivery_address or buyer_doc.get("address"),
        "delivery_lat": order_data.delivery_lat or buyer_doc.get("latitude"),
        "delivery_lng": order_data.delivery_lng or buyer_doc.get("longitude"),
        "notes": order_data.notes,
        "status": "pending",
        "farmer_status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    await db.orders.insert_one(order_doc)

    farmer_ids_notified = set()
    for inv, qty, price, subtotal in order_items_data:
        item_id = await get_next_id(db, "order_items")
        item_doc = {
            "id": item_id,
            "order_id": order_id,
            "inventory_id": inv["id"],
            "quantity": qty,
            "price_per_unit": price,
            "subtotal": subtotal
        }
        await db.order_items.insert_one(item_doc)

        f_id = inv.get("farmer_id")
        if f_id and f_id not in farmer_ids_notified:
            farmer_doc = await db.farmers.find_one({"id": f_id})
            if farmer_doc:
                await create_notification(
                    db, farmer_doc["user_id"],
                    "New Order Received",
                    f"You have a new order from {buyer_doc.get('name')} for ₹{total_amount:.0f}",
                    "order",
                    f"/farmer/orders/{order_id}"
                )
            farmer_ids_notified.add(f_id)

    return await build_order_response(db, order_doc)


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = {}
    if current_user.role == "buyer":
        buyer = await db.buyers.find_one({"user_id": current_user.id})
        if buyer:
            query["buyer_id"] = buyer["id"]
    elif current_user.role == "farmer":
        farmer = await db.farmers.find_one({"user_id": current_user.id})
        if farmer:
            # Find inventory ids belonging to this farmer
            farmer_invs = await db.inventory.find({"farmer_id": farmer["id"]}).to_list(length=500)
            f_inv_ids = [inv["id"] for inv in farmer_invs]

            matching_order_items = await db.order_items.find({"inventory_id": {"$in": f_inv_ids}}).to_list(length=500)
            f_order_ids = list(set([it["order_id"] for it in matching_order_items]))
            query["id"] = {"$in": f_order_ids}

    if status:
        query["status"] = status

    cursor = db.orders.find(query).sort("created_at", -1)
    order_docs = await cursor.to_list(length=200)

    responses = []
    for doc in order_docs:
        resp = await build_order_response(db, doc)
        responses.append(resp)
    return responses


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(404, "Order not found")
    return await build_order_response(db, order_doc)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    update: OrderStatusUpdate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(404, "Order not found")

    if current_user.role not in ["admin"]:
        raise HTTPException(403, "Only admin can update order status directly")

    old_status = order_doc.get("status")
    new_status = update.status

    # Update inventory state
    if new_status == "completed" and old_status != "completed":
        items = await db.order_items.find({"order_id": order_id}).to_list(length=100)
        for item in items:
            inv = await db.inventory.find_one({"id": item["inventory_id"]})
            if inv:
                res_qty = max(0, inv.get("quantity_reserved", 0) - item["quantity"])
                sold_qty = inv.get("quantity_sold", 0) + item["quantity"]
                await db.inventory.update_one(
                    {"id": inv["id"]},
                    {"$set": {"quantity_reserved": res_qty, "quantity_sold": sold_qty, "updated_at": datetime.utcnow()}}
                )
    elif new_status == "cancelled" and old_status not in ["completed", "cancelled"]:
        items = await db.order_items.find({"order_id": order_id}).to_list(length=100)
        for item in items:
            inv = await db.inventory.find_one({"id": item["inventory_id"]})
            if inv:
                res_qty = max(0, inv.get("quantity_reserved", 0) - item["quantity"])
                avail_qty = inv.get("quantity_available", 0) + item["quantity"]
                await db.inventory.update_one(
                    {"id": inv["id"]},
                    {"$set": {
                        "quantity_reserved": res_qty,
                        "quantity_available": avail_qty,
                        "status": "available",
                        "updated_at": datetime.utcnow()
                    }}
                )

    await db.orders.update_one({"id": order_id}, {"$set": {"status": new_status, "updated_at": datetime.utcnow()}})
    updated_doc = await db.orders.find_one({"id": order_id})
    return await build_order_response(db, updated_doc)


@router.patch("/{order_id}/farmer-action", response_model=OrderResponse)
async def farmer_order_action(
    order_id: int,
    action: FarmerOrderAction,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Only farmers can accept/reject orders")

    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(404, "Order not found")

    buyer_doc = await db.buyers.find_one({"id": order_doc["buyer_id"]})

    if action.action == "accept":
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"farmer_status": "accepted", "status": "confirmed", "updated_at": datetime.utcnow()}}
        )
        if buyer_doc:
            await create_notification(
                db, buyer_doc["user_id"],
                "Order Accepted",
                f"Your order #{order_id} has been accepted by the farmer",
                "order",
                f"/buyer/orders/{order_id}"
            )
    elif action.action == "reject":
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"farmer_status": "rejected", "status": "cancelled", "updated_at": datetime.utcnow()}}
        )
        items = await db.order_items.find({"order_id": order_id}).to_list(length=100)
        for item in items:
            inv = await db.inventory.find_one({"id": item["inventory_id"]})
            if inv:
                res_qty = max(0, inv.get("quantity_reserved", 0) - item["quantity"])
                avail_qty = inv.get("quantity_available", 0) + item["quantity"]
                await db.inventory.update_one(
                    {"id": inv["id"]},
                    {"$set": {
                        "quantity_reserved": res_qty,
                        "quantity_available": avail_qty,
                        "status": "available",
                        "updated_at": datetime.utcnow()
                    }}
                )
        if buyer_doc:
            await create_notification(
                db, buyer_doc["user_id"],
                "Order Rejected",
                f"Your order #{order_id} was rejected by the farmer. Inventory has been restored.",
                "order",
                f"/buyer/orders/{order_id}"
            )
    else:
        raise HTTPException(400, "Action must be 'accept' or 'reject'")

    updated_doc = await db.orders.find_one({"id": order_id})
    return await build_order_response(db, updated_doc)


@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order_doc = await db.orders.find_one({"id": order_id})
    if not order_doc:
        raise HTTPException(404, "Order not found")

    if current_user.role == "buyer":
        buyer = await db.buyers.find_one({"user_id": current_user.id})
        if not buyer or order_doc["buyer_id"] != buyer["id"]:
            raise HTTPException(403, "Not your order")

    if order_doc.get("status") not in ["pending", "confirmed"]:
        raise HTTPException(400, f"Cannot cancel order in '{order_doc.get('status')}' status")

    await db.orders.update_one({"id": order_id}, {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}})

    items = await db.order_items.find({"order_id": order_id}).to_list(length=100)
    for item in items:
        inv = await db.inventory.find_one({"id": item["inventory_id"]})
        if inv:
            res_qty = max(0, inv.get("quantity_reserved", 0) - item["quantity"])
            avail_qty = inv.get("quantity_available", 0) + item["quantity"]
            await db.inventory.update_one(
                {"id": inv["id"]},
                {"$set": {
                    "quantity_reserved": res_qty,
                    "quantity_available": avail_qty,
                    "status": "available",
                    "updated_at": datetime.utcnow()
                }}
            )

    updated_doc = await db.orders.find_one({"id": order_id})
    return await build_order_response(db, updated_doc)
