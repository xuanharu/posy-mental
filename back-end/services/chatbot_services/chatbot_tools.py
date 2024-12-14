from services import (
    llm_services,
    knowledge_base_services
)

from openai_function_calling.tool_helpers import ToolHelpers

def retrieve_sample_answers_by_question(new_message: str)->str:
    """This function will help to retrieve sample answers by question from the knowledge base service.
    Whenever the user express something related to the mental health, trigger this function."""
    
    retrieved_results =  knowledge_base_services.retrive_by_question(new_message, 0.8)
    
    if not retrieved_results:
        return "The question is not found in the knowledge base, you may suggest the user to consult with real experts."
    
    retrieved_results_str = '\n-----\n'.join([f"Sample Question: {result['sampleQuestion']}\nSample Answer: {result['sampleAnswers'][0]}\n" for result in retrieved_results])
    retrieved_results_str = f"Here are the sample answers for the question: \n-----\n{retrieved_results_str}"
    
    return retrieved_results_str

def recommend_expert(user_address: str)->str:
    """This function will help to recommend expert to the user.
    Only trigger this function when the user is in need of professional help and share their address in the chat."""
    
    return "Sang Vo - Clinical Psychologist\nAddress: 123 Nguyen Van Linh, District 7, Ho Chi Minh City\nPhone: 0123456789"

tools_list = ToolHelpers.infer_from_function_refs(
        [retrieve_sample_answers_by_question, 
         recommend_expert]
)