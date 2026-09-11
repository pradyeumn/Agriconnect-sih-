from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    role: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ["admin", "farmer", "buyer"]:
            raise ValueError("Role must be admin, farmer, or buyer")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class FarmerRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    farm_size: Optional[float] = None
    crops: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BuyerRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
