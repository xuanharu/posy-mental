from database import db_mongodb
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password: str):
    user = db_mongodb.users.find_one({"email": email})
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def create_user(email: str, password: str, role: str = "user", **kwargs):
    # Check if user already exists
    if db_mongodb.users.find_one({"email": email}):
        return None
    
    # Create new user
    hashed_password = get_password_hash(password)
    user = {
        "email": email,
        "password": hashed_password,
        "role": role,
        "created_at": datetime.utcnow()
    }
    
    # Add additional fields based on role
    if role == "psychiatrist":
        user["name"] = kwargs.get("name", "")
        user["license"] = kwargs.get("license", "")
        user["specialization"] = kwargs.get("specialization", "")
        user["experience"] = kwargs.get("experience", 0)
    
    result = db_mongodb.users.insert_one(user)
    user["_id"] = result.inserted_id
    return user

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db_mongodb.users.find_one({"_id": payload["sub"]})
        if not user:
            return False
        return user
    except jwt.JWTError:
        return False
    except Exception as e:
        return False
