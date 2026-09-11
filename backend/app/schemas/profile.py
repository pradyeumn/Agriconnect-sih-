from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FarmerCreate(BaseModel):
    name: str
    phone: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    farm_size: Optional[float] = None
    crops: Optional[str] = None  # comma-separated
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    farm_size: Optional[float] = None
    crops: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FarmerResponse(BaseModel):
    id: int
    user_id: int
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
    reliability_score: float
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class BuyerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BuyerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BuyerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}
