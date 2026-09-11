import logging
import certifi
from pymongo import ReturnDocument
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDBManager:
    client: AsyncIOMotorClient = None
    db = None

db_manager = MongoDBManager()

def connect_to_mongo():
    """Create MongoDB connection client."""
    try:
        kwargs = {}
        if "mongodb+srv://" in settings.MONGODB_URL:
            kwargs["tlsCAFile"] = certifi.where()

        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            **kwargs
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

def close_mongo_connection():
    """Close MongoDB connection client."""
    if db_manager.client is not None:
        db_manager.client.close()
        logger.info("Closed MongoDB connection.")

def get_db():
    """FastAPI Dependency for accessing MongoDB database instance."""
    if db_manager.db is None:
        connect_to_mongo()
    return db_manager.db

async def get_next_id(db, sequence_name: str) -> int:
    """Auto-increment integer ID helper for MongoDB documents."""
    result = await db.counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return result["seq"]

async def init_db():
    """Initialize MongoDB indexes or collections if required."""
    db = get_db()
    try:
        await db.users.create_index("email", unique=True)
        await db.farmers.create_index("user_id")
        await db.buyers.create_index("user_id")
        await db.products.create_index("category")
        await db.inventory.create_index("farmer_id")
        await db.orders.create_index("buyer_id")
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.warning(f"Note on MongoDB index creation: {e}")
