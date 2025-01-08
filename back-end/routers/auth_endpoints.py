from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.auth_services import authenticate_user, create_user, create_access_token

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user["_id"])}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register(user_data: UserCreate):
    user = create_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return {"message": "User created successfully"}
