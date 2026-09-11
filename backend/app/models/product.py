from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Product(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    unit: str = "kg"
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
