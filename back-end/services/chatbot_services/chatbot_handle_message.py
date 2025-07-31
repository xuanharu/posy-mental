from utils import (
    constants,
    helpers
)
import json
from services.chatbot_services.chatbot_crud import get_chat_history_by_id, update_chat_history, NewMessage
from services.chatbot_services.chatbot_tools import tools_list, retrieve_sample_answers_by_question, recommend_expert, suggest_nearby_mental_health_centers
from services import llm_services
from openai.types.chat import ChatCompletionMessage
from langsmith import traceable

import markdown

@helpers.iterable_handler
@traceable
def handle_new_message(chat_history_id, new_message: str):
    
    # get the chat history by id
    chat_history = get_chat_history_by_id(chat_history_id)
    if chat_history is None:
        raise ValueError("Chat history not found")
    
    # Append the new response to the chat history and see what user wants to do
    messages = chat_history["messages"]
    parsed_new_message = NewMessage(content=new_message, role="user")
    messages.append(parsed_new_message.model_dump())
    
    response:ChatCompletionMessage = llm_services.run_llm_chat_completion(
        system=constants.system_prompt,
        messages=messages,
        tools=tools_list
    )
    
    # if the tools are called, we need to handle the tools
    while response.tool_calls:
        function_name = response.tool_calls[0].function.name
        function_args = json.loads(response.tool_calls[0].function.arguments)
    
        if function_name == "retrieve_sample_answers_by_question":
            function_response = retrieve_sample_answers_by_question(function_args["new_message"])
        elif function_name == "recommend_expert":
            function_response = recommend_expert(function_args["user_address"])
        elif function_name == "suggest_nearby_mental_health_centers":
            function_response = suggest_nearby_mental_health_centers(function_args["user_message"])
        else:
            function_response = "The tool is not found"
        
        messages.append({k:v for k,v in response.model_dump().items() if k not in ['audio', 'function_call', 'refusal', 'content']})
        messages.append(NewMessage(content=function_response, role="tool", tool_call_id=response.tool_calls[0].id).model_dump())
        
        # re-run the completion
        response:ChatCompletionMessage = llm_services.run_llm_chat_completion(
            system=constants.system_prompt,
            messages=messages,
            tools=tools_list
        )
    
    messages.append(NewMessage(content=response.content, role="assistant").model_dump())
    
    # update the chat history
    update_chat_history(chat_history_id, messages)
    
    response_html = markdown.markdown(response.content)
    
    return response_html
