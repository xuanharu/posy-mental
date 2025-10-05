from services import (
    llm_services,
    knowledge_base_services,
    mental_health_services
)

from database import db_mongodb
from utils.helpers import check_if_iterable
import json

from openai_function_calling.tool_helpers import ToolHelpers

def retrieve_sample_answers_by_question(new_message: str)->str:
    """This function retrieves sample or reference responses from the knowledge base to assist in mental health consultations.
Trigger Condition: Whenever the user expresses concerns, emotions, or statements related to stress, anxiety, relationships, depression, motivation, or other mental health issues, automatically activate this function.
Behavior Guidelines: When triggered, the chatbot should: Acknowledge the user's feelings with empathy (e.g., "That sounds really stressful" or "I can understand why you’d feel that way").
Ask gentle follow-up questions to explore the situation (e.g., "What do you think is making you feel this way?" or "How long have you been feeling like this?").
Offer constructive, personalized guidance — practical but supportive advice relevant to the situation.
Encourage self-reflection and healthy coping strategies rather than giving direct medical advice. Maintain a professional, calm, and compassionate tone. Example: User: “My wife is stressed because we’re planning to buy a house.” Expected Response: “That sounds like a big step — it’s normal to feel stressed about major financial decisions.” “What part of the process is making her most anxious?” “Maybe you could plan together, set saving goals, or explore options that fit your budget.” “It might also help to share household responsibilities or find small relaxing activities you can enjoy together.”"""
    
    retrieved_results =  knowledge_base_services.retrive_by_question(new_message, 0.6)
    
    if not retrieved_results:
        return "No exact matches found in the knowledge base. Please provide a helpful response based on your general knowledge about mental health."
    
    retrieved_results_str = '\n-----\n'.join([f"Sample Question: {result['sampleQuestion']}\nSample Answer: {result['sampleAnswers'][0]}\n" for result in retrieved_results])
    retrieved_results_str = f"Here are the relevant answers from the knowledge base: \n-----\n{retrieved_results_str}"
    
    return retrieved_results_str

def recommend_expert(user_address: str)->str:
    """This function will help to recommend expert to the user.
    Only trigger this function when the user is in need of professional help and share their address in the chat."""

    # Find all the centers in the database:
    all_centers = list(db_mongodb['centers'].find())
    all_centers = check_if_iterable(all_centers)
    all_centers_text = json.dumps(all_centers)
    
    return f"""
You are given a list of psychiatrist centers as below.
Try to pick the one the closest to the user's address ({user_address}) and mention it only. If no clinics are found nearby, suggest options from neighboring districts or wards, based on geographical proximity. For example: District 3 is near Phu Nhuan, Binh Thanh, and District 1. Tan Binh is near Go Vap, Phu Nhuan, Tan Phu, and District 10. District 7 is near District 4, District 8, Nha Be, and Thu Duc (via Phu My Bridge). Tân Bình (near Tân Phú, Phú Nhuận, Gò Vấp, District 10), Phú Nhuận (close to Tân Bình, Gò Vấp, Bình Thạnh, District 3), Bình Thạnh (near Phú Nhuận, District 1, Thủ Đức), District 3 (close to District 1, Phú Nhuận, District 10), District 1 (near District 3, Bình Thạnh, District 4, District 5), District 4 (next to District 1, District 7, District 8), District 7 (near District 4, District 8, Nhà Bè, Thủ Đức), District 8 (close to District 5, District 6, District 7, Bình Chánh), Tân Phú (near Tân Bình, Bình Tân, District 11), Bình Tân (next to Tân Phú, Bình Chánh, District 6), and Thủ Đức City (bordering Bình Thạnh, District 7, Nhà Bè). Return in a paragraph, as in a conversation
{all_centers_text}
"""

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
