from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta

from app.core.database import get_db, get_next_id
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, settings
)
from app.models.user import User
from app.schemas.user import UserCreate, Token, LoginRequest, UserResponse, FarmerRegisterRequest, BuyerRegisterRequest
from app.schemas.profile import FarmerCreate, BuyerCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/farmer", response_model=Token, status_code=201)
async def register_farmer(
    payload: FarmerRegisterRequest,
    db = Depends(get_db)
):
    # Check email exists
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "Email already registered")

    user_id = await get_next_id(db, "users")
    now = datetime.utcnow()
    user_doc = {
        "id": user_id,
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "role": "farmer",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(user_doc)

    farmer_id = await get_next_id(db, "farmers")
    farmer_doc = {
        "id": farmer_id,
        "user_id": user_id,
        "name": payload.name,
        "phone": payload.phone,
        "village": payload.village,
        "district": payload.district,
        "state": payload.state,
        "pincode": payload.pincode,
        "farm_size": payload.farm_size,
        "crops": payload.crops,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "reliability_score": 75.0,
        "created_at": now,
        "updated_at": now,
    }
    await db.farmers.insert_one(farmer_doc)

    user = User(**user_doc)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/register/buyer", response_model=Token, status_code=201)
async def register_buyer(
    payload: BuyerRegisterRequest,
    db = Depends(get_db)
):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "Email already registered")

    user_id = await get_next_id(db, "users")
    now = datetime.utcnow()
    user_doc = {
        "id": user_id,
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "role": "buyer",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(user_doc)

    buyer_id = await get_next_id(db, "buyers")
    buyer_doc = {
        "id": buyer_id,
        "user_id": user_id,
        "name": payload.name,
        "phone": payload.phone,
        "address": payload.address,
        "city": payload.city,
        "state": payload.state,
        "pincode": payload.pincode,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "created_at": now,
        "updated_at": now,
    }
    await db.buyers.insert_one(buyer_doc)

    user = User(**user_doc)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db = Depends(get_db)):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = User(**user_doc)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
