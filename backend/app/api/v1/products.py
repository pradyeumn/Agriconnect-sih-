from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db, get_next_id
from app.core.security import get_current_user
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cursor = db.products.find({}).sort([("category", 1), ("name", 1)])
    docs = await cursor.to_list(length=200)
    return [ProductResponse.model_validate(Product(**p)) for p in docs]


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    p_id = await get_next_id(db, "products")
    doc = {
        "id": p_id,
        **data.model_dump(),
        "created_at": datetime.utcnow()
    }
    await db.products.insert_one(doc)
    return ProductResponse.model_validate(Product(**doc))


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = await db.products.find_one({"id": product_id})
    if not doc:
        raise HTTPException(404, "Product not found")
    return ProductResponse.model_validate(Product(**doc))
