from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class CollectionCenterCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    capacity: Optional[float] = None
    manager_name: Optional[str] = None
    manager_phone: Optional[str] = None
    description: Optional[str] = None


class CollectionCenterResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    capacity: Optional[float] = None
    manager_name: Optional[str] = None
    manager_phone: Optional[str] = None
    description: Optional[str] = None
    is_active: int

    model_config = {"from_attributes": True}


class ProcurementCreate(BaseModel):
    product_id: int
    title: str
    description: Optional[str] = None
    required_quantity: float
    required_by_date: Optional[date] = None
    min_grade: str = "B"
    price_per_unit: Optional[float] = None


class ProcurementResponse(BaseModel):
    id: int
    product_id: int
    title: str
    description: Optional[str] = None
    required_quantity: float
    required_by_date: Optional[date] = None
    min_grade: str
    price_per_unit: Optional[float] = None
    status: str
    created_at: Optional[datetime] = None
    product_name: Optional[str] = None

    model_config = {"from_attributes": True}


class SlotCreate(BaseModel):
    procurement_id: int
    collection_center_id: int
    slot_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    capacity: float
    notes: Optional[str] = None


class SlotResponse(BaseModel):
    id: int
    procurement_id: int
    collection_center_id: int
    slot_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    capacity: float
    allocated_quantity: float
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    collection_center_name: Optional[str] = None
    procurement_title: Optional[str] = None
    product_name: Optional[str] = None
    allocations: List = []

    model_config = {"from_attributes": True}


class AllocationResponse(BaseModel):
    id: int
    slot_id: int
    farmer_id: int
    allocated_quantity: float
    allocation_score: Optional[float] = None
    distance_km: Optional[float] = None
    status: str
    admin_notes: Optional[str] = None
    farmer_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_village: Optional[str] = None

    model_config = {"from_attributes": True}


class AllocationAction(BaseModel):
    action: str  # approve, reject
    notes: Optional[str] = None
    quantity: Optional[float] = None  # admin can modify quantity


class FarmerAllocationAction(BaseModel):
    action: str  # confirm, cancel
    notes: Optional[str] = None
