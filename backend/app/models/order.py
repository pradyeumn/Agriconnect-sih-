from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderItem(BaseModel):
    id: int
    order_id: int
    inventory_id: int
    quantity: float
    price_per_unit: float
    subtotal: float

    class Config:
        from_attributes = True


class Order(BaseModel):
    id: int
    buyer_id: int
    status: str = "pending"
    farmer_status: str = "pending"
    total_amount: float
    delivery_address: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
