from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.profile import FarmerCreate, FarmerUpdate, FarmerResponse
import aiofiles
import os
import uuid

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("/", response_model=list[FarmerResponse])
async def list_farmers(
    search: Optional[str] = None,
    state: Optional[str] = None,
    crop: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Farmer, User.email).join(User, Farmer.user_id == User.id)

    if search:
        query = query.where(
            Farmer.name.ilike(f"%{search}%") |
            Farmer.village.ilike(f"%{search}%") |
            Farmer.district.ilike(f"%{search}%")
        )
    if state:
        query = query.where(Farmer.state.ilike(f"%{state}%"))
    if crop:
        query = query.where(Farmer.crops.ilike(f"%{crop}%"))

    result = await db.execute(query)
    rows = result.all()
    farmers = []
    for farmer, email in rows:
        f = FarmerResponse.model_validate(farmer)
        f.email = email
        farmers.append(f)
    return farmers


@router.get("/me", response_model=FarmerResponse)
async def get_my_farmer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")
    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "Farmer profile not found")
    f = FarmerResponse.model_validate(farmer)
    f.email = current_user.email
    return f


@router.put("/me", response_model=FarmerResponse)
async def update_my_farmer_profile(
    update_data: FarmerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")
    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(404, "Farmer profile not found")

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(farmer, key, value)

    await db.commit()
    await db.refresh(farmer)
    f = FarmerResponse.model_validate(farmer)
    f.email = current_user.email
    return f


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(
    farmer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Farmer, User.email).join(User, Farmer.user_id == User.id).where(Farmer.id == farmer_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(404, "Farmer not found")
    farmer, email = row
    f = FarmerResponse.model_validate(farmer)
    f.email = email
    return f


@router.post("/me/upload-image")
async def upload_farmer_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")

    upload_dir = "./uploads/farmers"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    result = await db.execute(select(Farmer).where(Farmer.user_id == current_user.id))
    farmer = result.scalar_one_or_none()
    if farmer:
        farmer.profile_image = f"/uploads/farmers/{filename}"
        await db.commit()

    return {"image_url": f"/uploads/farmers/{filename}"}
