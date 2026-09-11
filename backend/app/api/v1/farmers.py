from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Optional, List
import aiofiles
import os
import uuid
import re
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.profile import FarmerCreate, FarmerUpdate, FarmerResponse

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("/", response_model=List[FarmerResponse])
async def list_farmers(
    search: Optional[str] = None,
    state: Optional[str] = None,
    crop: Optional[str] = None,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = {}
    if search:
        rx = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"name": rx},
            {"village": rx},
            {"district": rx}
        ]
    if state:
        query["state"] = re.compile(state, re.IGNORECASE)
    if crop:
        query["crops"] = re.compile(crop, re.IGNORECASE)

    cursor = db.farmers.find(query)
    farmers_docs = await cursor.to_list(length=100)

    # Get users for email lookup
    user_ids = [f["user_id"] for f in farmers_docs if "user_id" in f]
    users_cursor = db.users.find({"id": {"$in": user_ids}})
    users_list = await users_cursor.to_list(length=len(user_ids) or 1)
    user_map = {u["id"]: u.get("email", "") for u in users_list}

    results = []
    for doc in farmers_docs:
        f_obj = Farmer(**doc)
        f_res = FarmerResponse.model_validate(f_obj)
        f_res.email = user_map.get(doc.get("user_id"), "")
        results.append(f_res)

    return results


@router.get("/me", response_model=FarmerResponse)
async def get_my_farmer_profile(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")

    doc = await db.farmers.find_one({"user_id": current_user.id})
    if not doc:
        raise HTTPException(404, "Farmer profile not found")

    f_obj = Farmer(**doc)
    f_res = FarmerResponse.model_validate(f_obj)
    f_res.email = current_user.email
    return f_res


@router.put("/me", response_model=FarmerResponse)
async def update_my_farmer_profile(
    update_data: FarmerUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")

    doc = await db.farmers.find_one({"user_id": current_user.id})
    if not doc:
        raise HTTPException(404, "Farmer profile not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()

    await db.farmers.update_one({"user_id": current_user.id}, {"$set": update_dict})
    updated_doc = await db.farmers.find_one({"user_id": current_user.id})

    f_obj = Farmer(**updated_doc)
    f_res = FarmerResponse.model_validate(f_obj)
    f_res.email = current_user.email
    return f_res


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(
    farmer_id: int,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = await db.farmers.find_one({"id": farmer_id})
    if not doc:
        raise HTTPException(404, "Farmer not found")

    user_doc = await db.users.find_one({"id": doc.get("user_id")})
    f_obj = Farmer(**doc)
    f_res = FarmerResponse.model_validate(f_obj)
    f_res.email = user_doc.get("email", "") if user_doc else ""
    return f_res


@router.post("/me/upload-image")
async def upload_farmer_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.role != "farmer":
        raise HTTPException(403, "Not a farmer account")

    upload_dir = "./uploads/farmers"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    img_url = f"/uploads/farmers/{filename}"
    await db.farmers.update_one(
        {"user_id": current_user.id},
        {"$set": {"profile_image": img_url, "updated_at": datetime.utcnow()}}
    )

    return {"image_url": img_url}
