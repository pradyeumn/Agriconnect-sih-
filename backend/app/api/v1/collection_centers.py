from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime

from app.core.database import get_db, get_next_id
from app.core.security import get_current_user
from app.models.collection_center import CollectionCenter
from app.models.user import User
from app.schemas.procurement import CollectionCenterCreate, CollectionCenterResponse

router = APIRouter(prefix="/collection-centers", tags=["Collection Centers"])


@router.get("/", response_model=List[CollectionCenterResponse])
async def list_collection_centers(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cursor = db.collection_centers.find({})
    docs = await cursor.to_list(length=100)
    return [CollectionCenterResponse.model_validate(CollectionCenter(**c)) for c in docs]


@router.post("/", response_model=CollectionCenterResponse, status_code=201)
async def create_collection_center(
    data: CollectionCenterCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    cc_id = await get_next_id(db, "collection_centers")
    doc = {
        "id": cc_id,
        **data.model_dump(),
        "created_at": datetime.utcnow()
    }
    await db.collection_centers.insert_one(doc)
    return CollectionCenterResponse.model_validate(CollectionCenter(**doc))


@router.get("/{center_id}", response_model=CollectionCenterResponse)
async def get_collection_center(
    center_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = await db.collection_centers.find_one({"id": center_id})
    if not doc:
        raise HTTPException(404, "Collection center not found")
    return CollectionCenterResponse.model_validate(CollectionCenter(**doc))


@router.put("/{center_id}", response_model=CollectionCenterResponse)
async def update_collection_center(
    center_id: int,
    data: CollectionCenterCreate,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    doc = await db.collection_centers.find_one({"id": center_id})
    if not doc:
        raise HTTPException(404, "Collection center not found")

    await db.collection_centers.update_one({"id": center_id}, {"$set": data.model_dump()})
    updated_doc = await db.collection_centers.find_one({"id": center_id})
    return CollectionCenterResponse.model_validate(CollectionCenter(**updated_doc))


@router.delete("/{center_id}", status_code=204)
async def delete_collection_center(
    center_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")

    doc = await db.collection_centers.find_one({"id": center_id})
    if not doc:
        raise HTTPException(404, "Collection center not found")

    await db.collection_centers.delete_one({"id": center_id})
