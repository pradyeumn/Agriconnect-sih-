from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/admin/overview")
async def admin_overview(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    total_farmers = await db.farmers.count_documents({})
    total_buyers = await db.buyers.count_documents({})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    total_inventory = await db.inventory.count_documents({})
    total_procurement = await db.procurements.count_documents({})
    active_slots = await db.procurement_slots.count_documents({"status": "open"})

    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    sales_res = await db.orders.aggregate(pipeline).to_list(length=1)
    total_sales = sales_res[0]["total"] if sales_res else 0.0

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
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pipeline = [
        {"$match": {"status": "available"}},
        {"$group": {"_id": "$product_id", "total_qty": {"$sum": "$quantity_available"}}},
        {"$sort": {"total_qty": -1}}
    ]
    agg_res = await db.inventory.aggregate(pipeline).to_list(length=100)
    p_ids = [item["_id"] for item in agg_res if item["_id"] is not None]

    products_cursor = db.products.find({"id": {"$in": p_ids}})
    prods = await products_cursor.to_list(length=len(p_ids) or 1)
    prod_map = {p["id"]: p for p in prods}

    results = []
    for item in agg_res:
        p_doc = prod_map.get(item["_id"])
        if p_doc:
            results.append({
                "name": p_doc.get("name", ""),
                "category": p_doc.get("category", ""),
                "quantity": float(item["total_qty"] or 0)
            })

    return results


@router.get("/admin/monthly-sales")
async def monthly_sales(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pipeline = [
        {"$match": {"status": "completed"}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}},
                "total_sales": {"$sum": "$total_amount"},
                "order_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    agg_res = await db.orders.aggregate(pipeline).to_list(length=100)
    return [
        {
            "month": item["_id"] or "",
            "total_sales": float(item["total_sales"] or 0),
            "order_count": int(item["order_count"] or 0)
        }
        for item in agg_res
    ]


@router.get("/admin/location-supply")
async def location_supply(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv_docs = await db.inventory.find({"status": "available"}).to_list(length=500)
    f_ids = list(set([i["farmer_id"] for i in inv_docs if "farmer_id" in i]))

    farmers = await db.farmers.find({"id": {"$in": f_ids}}).to_list(length=len(f_ids) or 1)
    f_district_map = {f["id"]: f.get("district", "Unknown") for f in farmers}

    dist_supply = {}
    for inv in inv_docs:
        dist = f_district_map.get(inv.get("farmer_id"), "Unknown")
        dist_supply[dist] = dist_supply.get(dist, 0.0) + inv.get("quantity_available", 0.0)

    sorted_dist = sorted(dist_supply.items(), key=lambda x: x[1], reverse=True)[:10]
    return [{"district": k or "Unknown", "quantity": float(v)} for k, v in sorted_dist]


@router.get("/farmer/overview")
async def farmer_overview(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer = await db.farmers.find_one({"user_id": current_user.id})
    if not farmer:
        return {}

    inv_cursor = db.inventory.find({"farmer_id": farmer["id"]})
    inv_docs = await inv_cursor.to_list(length=500)

    avail = sum([i.get("quantity_available", 0) for i in inv_docs])
    res = sum([i.get("quantity_reserved", 0) for i in inv_docs])
    sold = sum([i.get("quantity_sold", 0) for i in inv_docs])

    f_inv_ids = [i["id"] for i in inv_docs]
    matching_items = await db.order_items.find({"inventory_id": {"$in": f_inv_ids}}).to_list(length=500)
    distinct_order_ids = len(set([item["order_id"] for item in matching_items]))

    return {
        "available_quantity": float(avail),
        "reserved_quantity": float(res),
        "sold_quantity": float(sold),
        "total_orders": distinct_order_ids,
    }


@router.get("/buyer/overview")
async def buyer_overview(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    buyer = await db.buyers.find_one({"user_id": current_user.id})
    if not buyer:
        return {}

    b_id = buyer["id"]
    total_orders = await db.orders.count_documents({"buyer_id": b_id})
    active_orders = await db.orders.count_documents({
        "buyer_id": b_id,
        "status": {"$in": ["pending", "confirmed", "packed", "dispatched"]}
    })
    completed_orders = await db.orders.count_documents({"buyer_id": b_id, "status": "completed"})

    pipeline = [
        {"$match": {"buyer_id": b_id, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    spent_res = await db.orders.aggregate(pipeline).to_list(length=1)
    total_spent = spent_res[0]["total"] if spent_res else 0.0

    return {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "total_spent": float(total_spent),
    }
