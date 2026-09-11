from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    farmer = "farmer"
    buyer = "buyer"


class User(BaseModel):
    id: int
    email: str
    password_hash: str
    role: str  # admin, farmer, buyer
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
