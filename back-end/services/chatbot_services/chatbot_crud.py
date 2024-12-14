from typing import Literal, Optional, List
from pydantic import BaseModel
from database import db_mongodb
from bson.objectid import ObjectId
from utils import (
    constants,
    helpers
)
import json
from utils.logger import logger
from datetime import datetime
from services import (
    llm_services,
    knowledge_base_services)

class NewMessage(BaseModel):
    content: str
    role: Literal["user", "assistant", "tool", "function", "tool_"]
    tool_call_id: Optional[str] = None

@helpers.iterable_handler
def get_list_of_chat_histories_by_user_id(user_id):
    cursor = db_mongodb['chatHistories'].find({"userId": ObjectId(user_id)})
    return list(cursor)

@helpers.iterable_handler
def get_chat_history_by_id(chat_history_id):
    chat_history = db_mongodb['chatHistories'].find_one({"_id": ObjectId(chat_history_id)})
    chat_history['messages'] = [message for message in chat_history['messages'] 
                                if (message['role'] in ['user', 'assistant']) and ('content' in message)]
    return chat_history

@helpers.iterable_handler
def update_chat_history(chat_history_id, messages:List[dict]):
    result =  db_mongodb['chatHistories'].update_one(
        {"_id": ObjectId(chat_history_id)},
        {
        "$set": {
            "updatedAt": datetime.now(),
            "messages": messages
        }
        }
    )
    return result.modified_count

def push_new_message_to_chat_history(chat_history_id, new_message: NewMessage):
    result =  db_mongodb['chatHistories'].update_one(
        {"_id": ObjectId(chat_history_id)},
        {"$push": {
            "messages": new_message.model_dump(),
        },
        "$set": {
            "updatedAt": datetime.now()
        }
        }
    )
    return result.modified_count

@helpers.iterable_handler
def create_chat_history(user_id, chat_history_name):
    result = db_mongodb['chatHistories'].insert_one(
        {
            "userId": ObjectId(user_id),
            "name": chat_history_name,
            "messages":[],
            "updatedAt": datetime.now()
        }
    )
    return result.inserted_id

class RoutingResult(BaseModel):
    consult_expert: bool
    share_location: bool