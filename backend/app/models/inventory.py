from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class Inventory(BaseModel):
    id: int
    farmer_id: int
    product_id: int
    quantity_available: float = 0.0
    quantity_reserved: float = 0.0
    quantity_sold: float = 0.0
    price_per_unit: float
    grade: str = "A"
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: str = "available"
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
