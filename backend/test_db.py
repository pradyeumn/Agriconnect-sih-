import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


async def test():
    try:
        print(f"Connecting to MongoDB at: {settings.MONGODB_URL}...")
        kwargs = {}
        if "mongodb+srv://" in settings.MONGODB_URL:
            kwargs["tlsCAFile"] = certifi.where()

        client = AsyncIOMotorClient(settings.MONGODB_URL, **kwargs)
        await client.admin.command('ping')
        print("[SUCCESS] MONGODB ATLAS CONNECTED SUCCESSFULLY!")
        client.close()
    except Exception as e:
        print("[FAILED] MONGODB CONNECTION FAILED:")
        print(e)


if __name__ == "__main__":
    asyncio.run(test())