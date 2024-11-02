# chatbot_endpoints.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import chatbot_services

router = APIRouter()

class Message(BaseModel):
    text: str
    user_id: Optional[str] = None

@router.post("/send")
async def send_message(message: Message):
    return chatbot_services.send_message(msg=message)

@router.get("/health")
async def health_check():
    return {"status": "healthy"}