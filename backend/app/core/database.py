import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Database engine setup with fallback
db_url = settings.DATABASE_URL

# Check if postgres or sqlite
try:
    engine = create_async_engine(
        db_url,
        echo=settings.DEBUG,
        pool_pre_ping=True,
    )
except Exception:
    # Fallback to local SQLite database if Postgres is not accessible
    sqlite_url = "sqlite+aiosqlite:///./agriconnect.db"
    engine = create_async_engine(sqlite_url, echo=settings.DEBUG)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        from app.models import all_models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
