from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.collection_center import CollectionCenter
from app.models.user import User
from app.schemas.procurement import CollectionCenterCreate, CollectionCenterResponse

router = APIRouter(prefix="/collection-centers", tags=["Collection Centers"])


@router.get("/", response_model=List[CollectionCenterResponse])
async def list_collection_centers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(CollectionCenter))
    centers = result.scalars().all()
    return [CollectionCenterResponse.model_validate(c) for c in centers]


@router.post("/", response_model=CollectionCenterResponse, status_code=201)
async def create_collection_center(
    data: CollectionCenterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    center = CollectionCenter(**data.model_dump())
    db.add(center)
    await db.commit()
    await db.refresh(center)
    return CollectionCenterResponse.model_validate(center)


@router.get("/{center_id}", response_model=CollectionCenterResponse)
async def get_collection_center(
    center_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(CollectionCenter).where(CollectionCenter.id == center_id))
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(404, "Collection center not found")
    return CollectionCenterResponse.model_validate(center)


@router.put("/{center_id}", response_model=CollectionCenterResponse)
async def update_collection_center(
    center_id: int,
    data: CollectionCenterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    result = await db.execute(select(CollectionCenter).where(CollectionCenter.id == center_id))
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(404, "Collection center not found")
    for key, value in data.model_dump().items():
        setattr(center, key, value)
    await db.commit()
    await db.refresh(center)
    return CollectionCenterResponse.model_validate(center)


@router.delete("/{center_id}", status_code=204)
async def delete_collection_center(
    center_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin only")
    result = await db.execute(select(CollectionCenter).where(CollectionCenter.id == center_id))
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(404, "Collection center not found")
    await db.delete(center)
    await db.commit()
