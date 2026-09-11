from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Farmer(BaseModel):
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
    profile_image: Optional[str] = None
    reliability_score: float = 75.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @property
    def crops_list(self) -> List[str]:
        if self.crops:
            return [c.strip() for c in self.crops.split(",")]
        return []

    class Config:
        from_attributes = True
