from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional, List
import aiofiles, os, uuid, re
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.buyer import Buyer
from app.models.user import User
from app.schemas.profile import BuyerCreate, BuyerUpdate, BuyerResponse

router = APIRouter(prefix="/buyers", tags=["Buyers"])


@router.get("/", response_model=List[BuyerResponse])
async def list_buyers(
    search: Optional[str] = None,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")

    query = {}
    if search:
        rx = re.compile(search, re.IGNORECASE)
        query["$or"] = [{"name": rx}, {"city": rx}]

    cursor = db.buyers.find(query)
    buyers_docs = await cursor.to_list(length=100)

    user_ids = [b["user_id"] for b in buyers_docs if "user_id" in b]
    users_cursor = db.users.find({"id": {"$in": user_ids}})
    users_list = await users_cursor.to_list(length=len(user_ids) or 1)
    user_map = {u["id"]: u.get("email", "") for u in users_list}

    results = []
    for doc in buyers_docs:
        b_obj = Buyer(**doc)
        b_res = BuyerResponse.model_validate(b_obj)
        b_res.email = user_map.get(doc.get("user_id"), "")
        results.append(b_res)

    return results


@router.get("/me", response_model=BuyerResponse)
async def get_my_buyer_profile(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Not a buyer account")
    doc = await db.buyers.find_one({"user_id": current_user.id})
    if not doc:
        raise HTTPException(404, "Buyer profile not found")

    b_obj = Buyer(**doc)
    b_res = BuyerResponse.model_validate(b_obj)
    b_res.email = current_user.email
    return b_res


@router.put("/me", response_model=BuyerResponse)
async def update_my_buyer_profile(
    update_data: BuyerUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "buyer":
        raise HTTPException(403, "Not a buyer account")
    doc = await db.buyers.find_one({"user_id": current_user.id})
    if not doc:
        raise HTTPException(404, "Buyer profile not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    await db.buyers.update_one({"user_id": current_user.id}, {"$set": update_dict})
    updated_doc = await db.buyers.find_one({"user_id": current_user.id})

    b_obj = Buyer(**updated_doc)
    b_res = BuyerResponse.model_validate(b_obj)
    b_res.email = current_user.email
    return b_res


@router.get("/{buyer_id}", response_model=BuyerResponse)
async def get_buyer(buyer_id: int, db = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    doc = await db.buyers.find_one({"id": buyer_id})
    if not doc:
        raise HTTPException(404, "Buyer not found")

    user_doc = await db.users.find_one({"id": doc.get("user_id")})
    b_obj = Buyer(**doc)
    b_res = BuyerResponse.model_validate(b_obj)
    b_res.email = user_doc.get("email", "") if user_doc else ""
    return b_res
