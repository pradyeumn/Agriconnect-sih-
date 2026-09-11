from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import auth, farmers, buyers, products, inventory, orders, procurement, collection_centers, notifications, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/farmers", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/inventory", exist_ok=True)
    print("✅ AgriConnect API started successfully")
    yield
    # Shutdown
    print("👋 AgriConnect API shutting down")


app = FastAPI(
    title="AgriConnect API",
    description="Smart Farmer Procurement and Sales Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs("./uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# API Routes
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(farmers.router, prefix=api_prefix)
app.include_router(buyers.router, prefix=api_prefix)
app.include_router(products.router, prefix=api_prefix)
app.include_router(inventory.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(procurement.router, prefix=api_prefix)
app.include_router(collection_centers.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)


@app.get("/")
async def root():
    return {"message": "AgriConnect API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
