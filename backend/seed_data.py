"""
Seed data script for AgriConnect (MongoDB Atlas).
Run: python seed_data.py
Creates demo admin, farmers, buyers, products, inventory, collection centers, and procurement data in MongoDB.
"""
import asyncio
import os
import sys
import certifi
from passlib.context import CryptContext
from datetime import date, datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

sys.path.insert(0, os.path.dirname(__file__))
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    print(f"[INFO] Initializing AgriConnect Database in MongoDB Atlas...")

    kwargs = {}
    if "mongodb+srv://" in settings.MONGODB_URL:
        kwargs["tlsCAFile"] = certifi.where()

    client = AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
    db = client[settings.MONGODB_DB_NAME]

    # Check if already seeded
    existing_users = await db.users.find_one({})
    if existing_users:
        print("[INFO] Database already contains seed data! Skipping...")
        client.close()
        return

    print("[INFO] Seeding AgriConnect demo records into MongoDB...")
    now = datetime.utcnow()

    # Counter helper
    async def get_next_seq(name: str) -> int:
        res = await db.counters.find_one_and_update(
            {"_id": name},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )
        return res["seq"]

    # ── Admin ─────────────────────────────────────────────────────
    admin_id = await get_next_seq("users")
    admin_doc = {
        "id": admin_id,
        "email": "admin@agriconnect.in",
        "password_hash": pwd_context.hash("admin123"),
        "role": "admin",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(admin_doc)
    print("[SUCCESS] Admin created: admin@agriconnect.in / admin123")

    # ── Products ──────────────────────────────────────────────────
    products_data = [
        ("Tomato", "vegetable", "Fresh red tomatoes, rich in lycopene", "kg"),
        ("Potato", "vegetable", "Fresh farm potatoes", "kg"),
        ("Onion", "vegetable", "Red onions, pungent and fresh", "kg"),
        ("Wheat", "grain", "Premium quality wheat grains", "quintal"),
        ("Rice", "grain", "Fine quality basmati rice", "quintal"),
        ("Mango", "fruit", "Alphonso mangoes from Maharashtra", "kg"),
        ("Banana", "fruit", "Fresh bananas, dozen pack", "dozen"),
        ("Spinach", "leafy vegetable", "Fresh spinach leaves", "kg"),
        ("Cauliflower", "vegetable", "White fresh cauliflower", "piece"),
        ("Carrot", "vegetable", "Orange carrots, fresh harvest", "kg"),
    ]
    products_map = {}
    for name, category, desc, unit in products_data:
        p_id = await get_next_seq("products")
        p_doc = {
            "id": p_id,
            "name": name,
            "category": category,
            "description": desc,
            "unit": unit,
            "created_at": now
        }
        await db.products.insert_one(p_doc)
        products_map[name] = p_doc
    print(f"[SUCCESS] {len(products_data)} products created")

    # ── Farmers ───────────────────────────────────────────────────
    farmers_data = [
        {
            "email": "farmer1@agriconnect.in",
            "name": "Ramesh Kumar",
            "phone": "9876543210",
            "village": "Nashik Village",
            "district": "Nashik",
            "state": "Maharashtra",
            "pincode": "422001",
            "farm_size": 5.5,
            "crops": "Tomato, Onion, Potato",
            "latitude": 19.9975,
            "longitude": 73.7898,
            "reliability_score": 88.0,
        },
        {
            "email": "farmer2@agriconnect.in",
            "name": "Suresh Patil",
            "phone": "9876543211",
            "village": "Satara Farm",
            "district": "Satara",
            "state": "Maharashtra",
            "pincode": "415001",
            "farm_size": 8.0,
            "crops": "Tomato, Carrot, Cauliflower",
            "latitude": 17.6805,
            "longitude": 73.9897,
            "reliability_score": 92.0,
        },
        {
            "email": "farmer3@agriconnect.in",
            "name": "Anjali Devi",
            "phone": "9876543212",
            "village": "Pune Rural",
            "district": "Pune",
            "state": "Maharashtra",
            "pincode": "411001",
            "farm_size": 3.2,
            "crops": "Spinach, Banana, Mango",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "reliability_score": 78.5,
        },
        {
            "email": "farmer4@agriconnect.in",
            "name": "Mahesh Singh",
            "phone": "9876543213",
            "village": "Ahmednagar",
            "district": "Ahmednagar",
            "state": "Maharashtra",
            "pincode": "414001",
            "farm_size": 12.0,
            "crops": "Wheat, Rice, Onion",
            "latitude": 19.0952,
            "longitude": 74.7498,
            "reliability_score": 85.0,
        },
        {
            "email": "farmer5@agriconnect.in",
            "name": "Priya Sharma",
            "phone": "9876543214",
            "village": "Solapur North",
            "district": "Solapur",
            "state": "Maharashtra",
            "pincode": "413001",
            "farm_size": 6.8,
            "crops": "Tomato, Mango, Carrot",
            "latitude": 17.6599,
            "longitude": 75.9064,
            "reliability_score": 76.0,
        },
    ]

    farmer_docs = []
    for fd in farmers_data:
        u_id = await get_next_seq("users")
        u_doc = {
            "id": u_id,
            "email": fd["email"],
            "password_hash": pwd_context.hash("farmer123"),
            "role": "farmer",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        await db.users.insert_one(u_doc)

        f_id = await get_next_seq("farmers")
        f_doc = {
            "id": f_id,
            "user_id": u_id,
            "name": fd["name"],
            "phone": fd["phone"],
            "village": fd["village"],
            "district": fd["district"],
            "state": fd["state"],
            "pincode": fd["pincode"],
            "farm_size": fd["farm_size"],
            "crops": fd["crops"],
            "latitude": fd["latitude"],
            "longitude": fd["longitude"],
            "reliability_score": fd["reliability_score"],
            "created_at": now,
            "updated_at": now,
        }
        await db.farmers.insert_one(f_doc)
        farmer_docs.append(f_doc)

    print(f"[SUCCESS] {len(farmers_data)} farmers created (password: farmer123)")

    # ── Inventory ─────────────────────────────────────────────────
    inventory_data = [
        (farmer_docs[0], products_map["Tomato"], 500, 25.0, "A"),
        (farmer_docs[0], products_map["Onion"], 800, 18.0, "A"),
        (farmer_docs[0], products_map["Potato"], 600, 20.0, "B"),
        (farmer_docs[1], products_map["Tomato"], 750, 22.0, "A"),
        (farmer_docs[1], products_map["Carrot"], 300, 30.0, "A"),
        (farmer_docs[2], products_map["Spinach"], 200, 40.0, "A"),
        (farmer_docs[3], products_map["Wheat"], 2000, 22.0, "A"),
        (farmer_docs[3], products_map["Onion"], 1200, 16.0, "B"),
        (farmer_docs[4], products_map["Tomato"], 400, 24.0, "B"),
        (farmer_docs[4], products_map["Carrot"], 250, 28.0, "A"),
    ]

    for farmer, product, qty, price, grade in inventory_data:
        i_id = await get_next_seq("inventory")
        i_doc = {
            "id": i_id,
            "farmer_id": farmer["id"],
            "product_id": product["id"],
            "quantity_available": float(qty),
            "quantity_reserved": 0.0,
            "quantity_sold": 0.0,
            "price_per_unit": float(price),
            "grade": grade,
            "status": "available",
            "created_at": now,
            "updated_at": now,
        }
        await db.inventory.insert_one(i_doc)

    print(f"[SUCCESS] {len(inventory_data)} inventory items created")

    # ── Collection Centers ────────────────────────────────────────
    centers_data = [
        {
            "name": "Nashik Collection Center",
            "address": "APMC Market Yard, Nashik",
            "city": "Nashik",
            "district": "Nashik",
            "state": "Maharashtra",
            "latitude": 20.0059,
            "longitude": 73.7900,
            "capacity": 50000.0,
            "manager_name": "Vikram Joshi",
            "manager_phone": "9999000001",
        },
        {
            "name": "Pune Central Hub",
            "address": "Gultekdi Market Yard, Pune",
            "city": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "latitude": 18.4960,
            "longitude": 73.8539,
            "capacity": 80000.0,
            "manager_name": "Kavita Desai",
            "manager_phone": "9999000002",
        },
        {
            "name": "Satara Agri Center",
            "address": "APMC Satara",
            "city": "Satara",
            "district": "Satara",
            "state": "Maharashtra",
            "latitude": 17.6914,
            "longitude": 73.9991,
            "capacity": 30000.0,
            "manager_name": "Rajesh More",
            "manager_phone": "9999000003",
        },
    ]

    center_docs = []
    for cd in centers_data:
        c_id = await get_next_seq("collection_centers")
        c_doc = {
            "id": c_id,
            **cd,
            "is_active": 1,
            "created_at": now
        }
        await db.collection_centers.insert_one(c_doc)
        center_docs.append(c_doc)

    print(f"[SUCCESS] {len(center_docs)} collection centers created")

    # ── Procurement ───────────────────────────────────────────────
    proc_id = await get_next_seq("procurements")
    proc_doc = {
        "id": proc_id,
        "admin_id": admin_id,
        "title": "Tomato Bulk Procurement",
        "product_id": products_map["Tomato"]["id"],
        "description": "Large procurement for supermarket chain distribution",
        "required_quantity": 5000.0,
        "status": "active",
        "created_at": now,
        "updated_at": now
    }
    await db.procurements.insert_one(proc_doc)

    slot_id = await get_next_seq("procurement_slots")
    slot_doc = {
        "id": slot_id,
        "procurement_id": proc_id,
        "collection_center_id": center_docs[0]["id"],
        "slot_date": (date.today() + timedelta(days=7)).isoformat(),
        "capacity": 2000.0,
        "allocated_quantity": 0.0,
        "status": "open",
        "created_at": now
    }
    await db.procurement_slots.insert_one(slot_doc)
    print("[SUCCESS] Procurement and slot created")

    # ── Buyers ────────────────────────────────────────────────────
    buyers_data = [
        {
            "email": "buyer1@agriconnect.in",
            "name": "Fresh Mart Retail",
            "phone": "9111222333",
            "address": "MG Road, Pune",
            "city": "Pune",
            "state": "Maharashtra",
            "latitude": 18.5204,
            "longitude": 73.8567,
        },
        {
            "email": "buyer2@agriconnect.in",
            "name": "Rahul Vegetables",
            "phone": "9111222334",
            "address": "Nashik Market, Nashik",
            "city": "Nashik",
            "state": "Maharashtra",
            "latitude": 19.9975,
            "longitude": 73.7898,
        },
        {
            "email": "buyer3@agriconnect.in",
            "name": "Mumbai Grocers",
            "phone": "9111222335",
            "address": "Dadar Market, Mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "latitude": 19.0176,
            "longitude": 72.8562,
        },
    ]

    for bd in buyers_data:
        u_id = await get_next_seq("users")
        u_doc = {
            "id": u_id,
            "email": bd["email"],
            "password_hash": pwd_context.hash("buyer123"),
            "role": "buyer",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        await db.users.insert_one(u_doc)

        b_id = await get_next_seq("buyers")
        b_doc = {
            "id": b_id,
            "user_id": u_id,
            "name": bd["name"],
            "phone": bd["phone"],
            "address": bd["address"],
            "city": bd["city"],
            "state": bd["state"],
            "latitude": bd["latitude"],
            "longitude": bd["longitude"],
            "created_at": now,
            "updated_at": now,
        }
        await db.buyers.insert_one(b_doc)

    print(f"[SUCCESS] {len(buyers_data)} buyers created (password: buyer123)")

    client.close()

    print("\n" + "=" * 60)
    print("AgriConnect seed data created successfully in MongoDB!")
    print("=" * 60)
    print("\nDemo Credentials:")
    print("  Admin:   admin@agriconnect.in    / admin123")
    print("  Farmer:  farmer1@agriconnect.in  / farmer123")
    print("  Buyer:   buyer1@agriconnect.in   / buyer123")


if __name__ == "__main__":
    asyncio.run(seed())
