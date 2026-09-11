from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import aiofiles, os, uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.buyer import Buyer
from app.models.user import User
from app.schemas.profile import BuyerCreate, BuyerUpdate, BuyerResponse

router = APIRouter(prefix="/buyers", tags=["Buyers"])


@router.get("/", response_model=list[BuyerResponse])
async def list_buyers(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")

    query = select(Buyer, User.email).join(User, Buyer.user_id == User.id)
    if search:
        query = query.where(
            Buyer.name.ilike(f"%{search}%") | Buyer.city.ilike(f"%{search}%")
        )

    result = await db.execute(query)
    rows = result.all()
    buyers = []
    for buyer, email in rows:
        b = BuyerResponse.model_validate(buyer)
        b.email = email
        buyers.append(b)
    return buyers


@router.get("/me", response_model=BuyerResponse)
async def get_my_buyer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Not a buyer account")
    result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(404, "Buyer profile not found")
    b = BuyerResponse.model_validate(buyer)
    b.email = current_user.email
    return b


@router.put("/me", response_model=BuyerResponse)
async def update_my_buyer_profile(
    update_data: BuyerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Not a buyer account")
    result = await db.execute(select(Buyer).where(Buyer.user_id == current_user.id))
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(404, "Buyer profile not found")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(buyer, key, value)

    await db.commit()
    await db.refresh(buyer)
    b = BuyerResponse.model_validate(buyer)
    b.email = current_user.email
    return b


@router.get("/{buyer_id}", response_model=BuyerResponse)
async def get_buyer(buyer_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    result = await db.execute(
        select(Buyer, User.email).join(User, Buyer.user_id == User.id).where(Buyer.id == buyer_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Buyer not found")
    buyer, email = row
    b = BuyerResponse.model_validate(buyer)
    b.email = email
    return b
