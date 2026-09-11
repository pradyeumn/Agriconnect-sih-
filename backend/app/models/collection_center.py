from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CollectionCenter(BaseModel):
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
    is_active: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
