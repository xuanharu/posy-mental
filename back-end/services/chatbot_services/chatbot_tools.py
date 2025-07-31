from services import (
    llm_services,
    knowledge_base_services,
    mental_health_services
)

from openai_function_calling.tool_helpers import ToolHelpers

def retrieve_sample_answers_by_question(new_message: str)->str:
    """This function will help to retrieve sample answers by question from the knowledge base service.
    Whenever the user express something related to the mental health, trigger this function."""
    
    retrieved_results =  knowledge_base_services.retrive_by_question(new_message, 0.6)
    
    if not retrieved_results:
        return "No exact matches found in the knowledge base. Please provide a helpful response based on your general knowledge about mental health."
    
    retrieved_results_str = '\n-----\n'.join([f"Sample Question: {result['sampleQuestion']}\nSample Answer: {result['sampleAnswers'][0]}\n" for result in retrieved_results])
    retrieved_results_str = f"Here are the relevant answers from the knowledge base: \n-----\n{retrieved_results_str}"
    
    return retrieved_results_str

def recommend_expert(user_address: str)->str:
    """This function will help to recommend expert to the user.
    Only trigger this function when the user is in need of professional help and share their address in the chat."""
    
    return "Xuan Nguyen - Clinical Psychologist\nAddress: 123 Nguyen Van Linh, District 7, Ho Chi Minh City\nPhone: 0123456789"

def suggest_nearby_mental_health_centers(user_message: str)->str:
    """This function will suggest nearby mental health centers based on the user's location mentioned in their message.
    Trigger this function when the user asks for help finding mental health centers, therapists, or professional help, 
    especially when they mention their location or ask about services near them."""
    
    return mental_health_services.suggest_nearby_centers(user_message)

tools_list = ToolHelpers.infer_from_function_refs(
        [retrieve_sample_answers_by_question, 
         recommend_expert,
         suggest_nearby_mental_health_centers]
)
