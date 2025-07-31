from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Optional
from database import db_mongodb
from fastapi.security import OAuth2PasswordBearer
import jwt
from services.auth_services import SECRET_KEY, ALGORITHM
from bson import ObjectId
from utils.helpers import check_if_iterable
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


router = APIRouter()

class PsychiatristProfile(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None

class PasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = db_mongodb["users"].find_one({"_id": user_id, "role": "psychiatrist"})
        if not user:
            raise HTTPException(status_code=404, detail="Psychiatrist not found")
        return user
    except Exception as e:
        raise e

@router.get("/")
def get_psychiatrist_profile(psychiatrist_id: str):
    user_doc = db_mongodb["users"].find_one({"_id": ObjectId(psychiatrist_id), "role": "psychiatrist"})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Psychiatrist not found")
    # Remove sensitive fields
    user_doc.pop("password", None)
    user_doc["id"] = str(user_doc["_id"])
    user_doc.pop("_id", None)
    return check_if_iterable(user_doc)

@router.put("/")
def update_psychiatrist_profile(psychiatrist_id: str, profile: PsychiatristProfile):
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    result = db_mongodb["users"].update_one(
        {"_id": ObjectId(psychiatrist_id), "role": "psychiatrist"},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Psychiatrist not found")
    return {"message": "Profile updated successfully"}

@router.put("/password")
def update_psychiatrist_password(psychiatrist_id: str, pw_update: PasswordUpdate):
    user_doc = db_mongodb["users"].find_one({"_id": ObjectId(psychiatrist_id), "role": "psychiatrist"})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Psychiatrist not found")
    # Verify current password
    from services.auth_services import verify_password, get_password_hash
    if not verify_password(pw_update.currentPassword, user_doc["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hashed = get_password_hash(pw_update.newPassword)
    db_mongodb["users"].update_one(
        {"_id": ObjectId(psychiatrist_id), "role": "psychiatrist"},
        {"$set": {"password": new_hashed}}
    )
    return {"message": "Password updated successfully"}
