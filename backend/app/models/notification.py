from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: Optional[str] = None
    is_read: bool = False
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
