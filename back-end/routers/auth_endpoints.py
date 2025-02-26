from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from services.auth_services import authenticate_user, create_user, create_access_token

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"
    name: Optional[str] = None
    license: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None

@router.post("/login")
async def login(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if the user has the role they're trying to log in with
    user_role = user.get("role", "user")
    if user_data.role != "user" and user_data.role != user_role:
        raise HTTPException(
            status_code=403,
            detail=f"User is not authorized as a {user_data.role}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user["_id"])}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user_role
    }

@router.post("/register")
async def register(user_data: UserCreate):
    # Create user with role and additional fields
    kwargs = {}
    if user_data.role == "psychiatrist":
        kwargs = {
            "name": user_data.name,
            "license": user_data.license,
            "specialization": user_data.specialization,
            "experience": user_data.experience
        }
    
    user = create_user(
        email=user_data.email, 
        password=user_data.password,
        role=user_data.role,
        **kwargs
    )
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return {"message": "User created successfully"}
