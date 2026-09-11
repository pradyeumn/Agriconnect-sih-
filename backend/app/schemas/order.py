from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.inventory import InventoryResponse


class OrderItemCreate(BaseModel):
    inventory_id: int
    quantity: float


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    inventory_id: int
    quantity: float
    price_per_unit: float
    subtotal: float
    inventory: Optional[InventoryResponse] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    status: str
    farmer_status: str
    total_amount: float
    delivery_address: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    buyer_name: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class FarmerOrderAction(BaseModel):
    action: str  # accept or reject
    notes: Optional[str] = None
