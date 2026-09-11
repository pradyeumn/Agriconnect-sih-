from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class Procurement(BaseModel):
    id: int
    admin_id: int
    product_id: int
    title: str
    description: Optional[str] = None
    required_quantity: float
    required_by_date: Optional[date] = None
    min_grade: str = "B"
    price_per_unit: Optional[float] = None
    status: str = "active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProcurementSlot(BaseModel):
    id: int
    procurement_id: int
    collection_center_id: int
    slot_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    capacity: float
    allocated_quantity: float = 0.0
    status: str = "open"
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SlotAllocation(BaseModel):
    id: int
    slot_id: int
    farmer_id: int
    allocated_quantity: float
    allocation_score: Optional[float] = None
    distance_km: Optional[float] = None
    status: str = "pending"
    admin_notes: Optional[str] = None
    farmer_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
