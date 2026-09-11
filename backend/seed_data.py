"""
Seed data script for AgriConnect.
Run: python seed_data.py
Creates demo admin, farmers, buyers, products, inventory, collection centers, and procurement data.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from passlib.context import CryptContext
from datetime import date, datetime, timedelta
import os
import sys

# Load env or default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agriconnect.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    engine = create_async_engine(DATABASE_URL, echo=False)
except Exception:
    DATABASE_URL = "sqlite+aiosqlite:///./agriconnect.db"
    engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    # Make sure app path is in sys.path
    sys.path.insert(0, os.path.dirname(__file__))
    
    from app.core.database import Base
    from app.models import all_models  # noqa: F401
    from app.models.user import User
    from app.models.farmer import Farmer
    from app.models.buyer import Buyer
    from app.models.product import Product
    from app.models.inventory import Inventory
    from app.models.collection_center import CollectionCenter
    from app.models.procurement import Procurement, ProcurementSlot
    from app.models.notification import Notification

    print(f"🌱 Initializing AgriConnect Database using: {DATABASE_URL}")

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select
        existing_users = await db.execute(select(User))
        if existing_users.scalars().first():
            print("⚡ Database already contains seed data! Skipping...")
            return

        print("🌱 Seeding AgriConnect demo records...")

        # ── Admin ─────────────────────────────────────────────────────
        admin = User(
            email="admin@agriconnect.in",
            password_hash=pwd_context.hash("admin123"),
            role="admin"
        )
        db.add(admin)
        await db.flush()
        print("✅ Admin created: admin@agriconnect.in / admin123")

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
        products = []
        for name, category, desc, unit in products_data:
            p = Product(name=name, category=category, description=desc, unit=unit)
            db.add(p)
            products.append(p)
        await db.flush()
        print(f"✅ {len(products)} products created")

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

        farmer_objects = []
        for fd in farmers_data:
            user = User(
                email=fd["email"],
                password_hash=pwd_context.hash("farmer123"),
                role="farmer"
            )
            db.add(user)
            await db.flush()

            farmer = Farmer(
                user_id=user.id,
                name=fd["name"],
                phone=fd["phone"],
                village=fd["village"],
                district=fd["district"],
                state=fd["state"],
                pincode=fd["pincode"],
                farm_size=fd["farm_size"],
                crops=fd["crops"],
                latitude=fd["latitude"],
                longitude=fd["longitude"],
                reliability_score=fd["reliability_score"],
            )
            db.add(farmer)
            farmer_objects.append(farmer)

        await db.flush()
        print(f"✅ {len(farmers_data)} farmers created (password: farmer123)")

        # ── Inventory ─────────────────────────────────────────────────
        tomato = next(p for p in products if p.name == "Tomato")
        onion = next(p for p in products if p.name == "Onion")
        potato = next(p for p in products if p.name == "Potato")
        carrot = next(p for p in products if p.name == "Carrot")
        spinach = next(p for p in products if p.name == "Spinach")
        wheat = next(p for p in products if p.name == "Wheat")

        inventory_data = [
            (farmer_objects[0], tomato, 500, 2500.0, "Grade A"),
            (farmer_objects[0], onion, 800, 1800.0, "Grade A"),
            (farmer_objects[0], potato, 600, 2000.0, "Grade B"),
            (farmer_objects[1], tomato, 750, 2200.0, "Grade A"),
            (farmer_objects[1], carrot, 300, 3000.0, "Grade A"),
            (farmer_objects[2], spinach, 200, 4000.0, "Grade A"),
            (farmer_objects[3], wheat, 2000, 2200.0, "Grade A"),
            (farmer_objects[3], onion, 1200, 1600.0, "Grade B"),
            (farmer_objects[4], tomato, 400, 2400.0, "Grade B"),
            (farmer_objects[4], carrot, 250, 2800.0, "Grade A"),
        ]

        for farmer, product, qty, price, grade in inventory_data:
            inv = Inventory(
                farmer_id=farmer.id,
                product_id=product.id,
                quantity_available=qty,
                price_per_unit=price,
                grade=grade,
                harvest_date=date.today() - timedelta(days=2),
                status="available",
            )
            db.add(inv)

        await db.flush()
        print(f"✅ {len(inventory_data)} inventory items created")

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

        centers = []
        for cd in centers_data:
            center = CollectionCenter(**cd)
            db.add(center)
            centers.append(center)

        await db.flush()
        print(f"✅ {len(centers)} collection centers created")

        # ── Procurement ───────────────────────────────────────────────
        proc1 = Procurement(
            admin_id=admin.id,
            product_id=tomato.id,
            description="Large procurement for supermarket chain distribution",
            required_quantity=5000,
            required_by_date=date.today() + timedelta(days=30),
            status="active"
        )
        db.add(proc1)
        await db.flush()

        slot1 = ProcurementSlot(
            procurement_id=proc1.id,
            collection_center_id=centers[0].id,
            date=date.today() + timedelta(days=7),
            capacity=2000,
            allocated_quantity=0,
            status="open"
        )
        db.add(slot1)
        print("✅ Procurement and slot created")

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
            user = User(
                email=bd["email"],
                password_hash=pwd_context.hash("buyer123"),
                role="buyer"
            )
            db.add(user)
            await db.flush()

            buyer = Buyer(
                user_id=user.id,
                name=bd["name"],
                phone=bd["phone"],
                address=bd["address"],
                latitude=bd["latitude"],
                longitude=bd["longitude"],
            )
            db.add(buyer)

        await db.commit()
        print(f"✅ {len(buyers_data)} buyers created (password: buyer123)")

        print("\n" + "="*60)
        print("🎉 AgriConnect seed data created successfully!")
        print("="*60)
        print("\nDemo Credentials:")
        print("  Admin:   admin@agriconnect.in    / admin123")
        print("  Farmer:  farmer1@agriconnect.in  / farmer123")
        print("  Buyer:   buyer1@agriconnect.in   / buyer123")


if __name__ == "__main__":
    asyncio.run(seed())
