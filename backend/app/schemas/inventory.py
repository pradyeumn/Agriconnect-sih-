from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class ProductCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    unit: str = "kg"


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    unit: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InventoryCreate(BaseModel):
    product_id: int
    quantity_available: float
    price_per_unit: float
    grade: str = "A"
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    description: Optional[str] = None


class InventoryUpdate(BaseModel):
    quantity_available: Optional[float] = None
    price_per_unit: Optional[float] = None
    grade: Optional[str] = None
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None
    description: Optional[str] = None


class InventoryResponse(BaseModel):
    id: int
    farmer_id: int
    product_id: int
    quantity_available: float
    quantity_reserved: float
    quantity_sold: float
    price_per_unit: float
    grade: str
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    farmer_name: Optional[str] = None
    farmer_location: Optional[str] = None
    farmer_lat: Optional[float] = None
    farmer_lng: Optional[float] = None
    distance_km: Optional[float] = None

    model_config = {"from_attributes": True}
