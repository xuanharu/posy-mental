# chatbot_endpoints.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import chatbot_services

router = APIRouter()

@router.post("/create-chat-history")
def create_chat_history(user_id: str, chat_history_name: str):
    chat_history_id = chatbot_services.create_chat_history(user_id, chat_history_name)
    return {"chat_history_id": chat_history_id}

@router.get("/chat-histories-by-user-id")
def get_chat_histories(user_id: str):
    chat_histories = chatbot_services.get_list_of_chat_histories_by_user_id(user_id)
    return chat_histories

@router.get("/chat-history-by-id")
def send_chat_history(chat_history_id: str):
    chat_history = chatbot_services.get_chat_history_by_id(chat_history_id)
    return chat_history

@router.post("/chat")
def chat(chat_history_id: str, new_message: str):
    assistant_response = chatbot_services.handle_new_message(chat_history_id, new_message)
    return {"assistant_response": assistant_response}

@router.get("/health")
def health_check():
    return {"status": "healthy"}