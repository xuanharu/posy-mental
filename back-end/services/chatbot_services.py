
from typing import Literal
from pydantic import BaseModel
from database import db_mongodb
from bson.objectid import ObjectId
from utils import constants
import json
from utils.logger import logger

from services import (
    llm_services,
    knowledge_base_services)

def get_list_of_chat_histories_by_user_id(user_id):
    cursor = db_mongodb['chatHistories'].find({"userId": ObjectId(user_id)})
    return list(cursor)

def get_chat_history_by_id(chat_history_id):
    return db_mongodb['chatHistories'].find_one({"_id": ObjectId(chat_history_id)})

class NewMessage(BaseModel):
    content: str
    role: Literal["user", "assistant"]
def update_chat_history(chat_history_id, new_message: NewMessage):
    result =  db_mongodb['chatHistories'].update_one(
        {"_id": ObjectId(chat_history_id)},
        {"$push": {"messages": new_message.model_dump()}}
    )
    return result.modified_count

def create_chat_history(user_id, chat_history_name):
    result = db_mongodb['chatHistories'].insert_one(
        {
            "userId": ObjectId(user_id),
            "name": chat_history_name,
            "messages":[]
        }
    )
    return result.inserted_id

class RoutingResult(BaseModel):
    consult_expert: bool
    share_location: bool
def handle_new_message(chat_history_id, new_message: str):
    chat_history = get_chat_history_by_id(chat_history_id)
    if chat_history is None:
        raise ValueError("Chat history not found")
    
    # Append the new message to the chat history and see what user wants to do
    messages = chat_history["messages"]
    parsed_new_message = NewMessage(content=new_message, role="user")
    messages.append(parsed_new_message.model_dump())
    routing_result = llm_services.run_llm_structure_output(
        system=constants.prompt_chat_routing_system,
        user_input=json.dumps(messages, indent=4),
        response_format=RoutingResult
    )
    logger.info(f"Routing result: {routing_result}")
    
    # Route the user's message based on the routing result
    if not routing_result["consult_expert"]:
        # step 1: retrieve on the database to get relevant context (question-answer pairs)
        question_answer_pairs = knowledge_base_services.retrive_by_question(new_message, 0.7)
        
        # step 2: parse the question_answer_pairs into a string.
        if len(question_answer_pairs) == 0:
            logger.info("No relevant question-answer pairs found in the knowledge base")
            assistant_response = "I'm sorry, I don't have the answer to your question. Would you like to consult an expert?"
        else:
            context = question_answer_pairs2context(question_answer_pairs)
            system_prompt = constants.prompt_normal_chat_system.format(context=context)
            # step 2.2: run the llm service here
            assistant_response = llm_services.run_llm_chat_completion(system_prompt, messages)
            
    elif routing_result["consult_expert"] and not routing_result["share_location"]:
        assistant_response = "Great! I will connect you with an expert. Could you please confirm to share your location?"
    else:
        assistant_response = "The feature is not available yet."
    
    # Update the chat history with the new message
    logger.info(f"Assistant response: {assistant_response}")
    update_chat_history(chat_history_id, NewMessage(content=new_message, role="user"))
    update_chat_history(chat_history_id, NewMessage(content=assistant_response, role="assistant"))
    
    return assistant_response

def question_answer_pairs2context(question_answer_pairs):
    context = "Below is some of the most relevant questions to the user newest message and its possible answers for you to refer:\n-------------------\n"
    for record in question_answer_pairs:
        text = f"Sample question: {record['sampleQuestion']}\nPosible Answers: {record['sampleAnswers']}"
        context += text
        context += "\n----sample seperator----\n"
    return context
        
    