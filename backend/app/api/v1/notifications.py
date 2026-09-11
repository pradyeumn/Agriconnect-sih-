from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: Optional[str] = None
    is_read: bool
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    unread_only: bool = False,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = {"user_id": current_user.id}
    if unread_only:
        query["is_read"] = False

    cursor = db.notifications.find(query).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(length=50)
    return [NotificationResponse.model_validate(Notification(**n)) for n in docs]


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = await db.notifications.find_one({"id": notification_id, "user_id": current_user.id})
    if not doc:
        raise HTTPException(404, "Notification not found")

    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_read(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.notifications.update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": f"Marked {result.modified_count} notifications as read"}


@router.get("/count")
async def get_unread_count(
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = await db.notifications.count_documents({"user_id": current_user.id, "is_read": False})
    return {"unread_count": count}
