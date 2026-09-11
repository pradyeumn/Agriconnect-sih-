from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, settings
)
from app.models.user import User
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.schemas.user import UserCreate, Token, LoginRequest, UserResponse
from app.schemas.profile import FarmerCreate, BuyerCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/farmer", response_model=Token, status_code=201)
async def register_farmer(
    user_data: UserCreate,
    farmer_data: FarmerCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role="farmer"
    )
    db.add(user)
    await db.flush()

    # Create farmer profile
    farmer = Farmer(user_id=user.id, **farmer_data.model_dump())
    db.add(farmer)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/register/buyer", response_model=Token, status_code=201)
async def register_buyer(
    user_data: UserCreate,
    buyer_data: BuyerCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role="buyer"
    )
    db.add(user)
    await db.flush()

    buyer = Buyer(user_id=user.id, **buyer_data.model_dump())
    db.add(buyer)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout():
    # JWT is stateless; client must delete the token
    return {"message": "Logged out successfully"}
