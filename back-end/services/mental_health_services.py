from typing import List, Dict, Optional
from services.llm_services import run_llm_structure_output
from database import db_mongodb
from bson import ObjectId
from datetime import datetime
import math
import re

# Common mental health symptoms
SYMPTOMS = [
    "Anxiety",
    "Depression",
    "Sleep Issues",
    "Stress",
    "Mood Swings",
    "Social Withdrawal",
    "Concentration Problems",
    "Fatigue",
    "Loss of Interest",
    "Irritability"
]

# Question templates for each symptom
SYMPTOM_QUESTIONS = {
    "Anxiety": [
        {
            "text": "How often do you experience anxiety symptoms?",
            "options": ["Daily", "Several times a week", "Weekly", "Monthly"]
        },
        {
            "text": "What triggers your anxiety most often?",
            "options": ["Work/School", "Social situations", "Specific fears", "Uncertainty"]
        }
    ],
    "Depression": [
        {
            "text": "How long have you been feeling down or depressed?",
            "options": ["Less than 2 weeks", "2-4 weeks", "1-2 months", "More than 2 months"]
        },
        {
            "text": "How has your sleep pattern changed?",
            "options": ["Sleeping more than usual", "Difficulty sleeping", "No change", "Irregular patterns"]
        }
    ],
    "Sleep Issues": [
        {
            "text": "What type of sleep problems do you experience?",
            "options": ["Difficulty falling asleep", "Waking up frequently", "Early morning awakening", "Oversleeping"]
        },
        {
            "text": "How long have you had sleep issues?",
            "options": ["Less than 1 month", "1-3 months", "3-6 months", "More than 6 months"]
        }
    ],
    "Stress": [
        {
            "text": "What are your main sources of stress?",
            "options": ["Work/School", "Relationships", "Financial", "Health"]
        },
        {
            "text": "How do you typically cope with stress?",
            "options": ["Exercise", "Meditation", "Social support", "Avoidance"]
        }
    ],
    "Mood Swings": [
        {
            "text": "How frequently do you experience mood swings?",
            "options": ["Multiple times daily", "Daily", "Several times a week", "Weekly"]
        },
        {
            "text": "How severe are your mood changes typically?",
            "options": ["Very severe", "Moderate", "Mild", "Minimal"]
        }
    ],
    "Social Withdrawal": [
        {
            "text": "How often do you avoid social interactions?",
            "options": ["Almost always", "Frequently", "Sometimes", "Rarely"]
        },
        {
            "text": "What type of social situations do you most often avoid?",
            "options": ["Large groups", "Small gatherings", "One-on-one interactions", "Specific situations"]
        }
    ],
    "Concentration Problems": [
        {
            "text": "How often do you have difficulty focusing?",
            "options": ["Almost constantly", "Several times a day", "Occasionally", "Rarely"]
        },
        {
            "text": "When is your concentration typically worst?",
            "options": ["Morning", "Afternoon", "Evening", "It varies"]
        }
    ],
    "Fatigue": [
        {
            "text": "How often do you feel extremely tired?",
            "options": ["All day", "Most of the day", "Several hours", "Occasionally"]
        },
        {
            "text": "Does rest improve your energy levels?",
            "options": ["Not at all", "Slightly", "Moderately", "Significantly"]
        }
    ],
    "Loss of Interest": [
        {
            "text": "How many activities have you lost interest in?",
            "options": ["Most activities", "Several activities", "A few activities", "One or two activities"]
        },
        {
            "text": "How long have you experienced this loss of interest?",
            "options": ["More than 2 months", "1-2 months", "2-4 weeks", "Less than 2 weeks"]
        }
    ],
    "Irritability": [
        {
            "text": "How often do you feel irritable?",
            "options": ["Almost constantly", "Several times a day", "A few times a week", "Occasionally"]
        },
        {
            "text": "What typically triggers your irritability?",
            "options": ["Minor frustrations", "Specific situations", "People", "Environmental factors"]
        }
    ]
}

def get_questions_for_symptoms(symptoms: List[str]) -> List[Dict]:
    """
    Generate relevant questions based on selected symptoms
    """
    questions = []
    for symptom in symptoms:
        if symptom in SYMPTOM_QUESTIONS:
            for question in SYMPTOM_QUESTIONS[symptom]:
                questions.append({
                    "symptom": symptom,
                    "question": question["text"],
                    "options": question["options"]
                })
        else:
            # Generate dynamic questions for symptoms not in template
            prompt = f"Generate a multiple-choice question to assess the severity of {symptom} in mental health context."
            response = run_llm_structure_output(
                system="You are a mental health assessment expert. Generate a multiple choice question to assess symptom severity.",
                user_input=prompt,
                response_format={
                    "type": "object",
                    "properties": {
                        "question": {"type": "string"},
                        "options": {"type": "array", "items": {"type": "string"}}
                    }
                }
            )
            questions.append({
                "symptom": symptom,
                "question": response["question"],
                "options": response["options"]
            })
    return questions

def generate_mental_health_advice(symptoms: List[str], answers: Dict[str, str]) -> Dict:
    """
    Generate personalized mental health advice based on symptoms and answers
    """
    # Prepare context for LLM
    context = f"Based on the following symptoms and responses:\n"
    for symptom in symptoms:
        context += f"\nSymptom: {symptom}"
        # Find questions related to this symptom
        symptom_questions = [q for q, a in answers.items() if symptom.lower() in q.lower()]
        for question in symptom_questions:
            context += f"\nQ: {question}\nA: {answers[question]}"
    
    prompt = f"{context}\n\nProvide a response with:\n1. assessment: A brief assessment of potential mental health status\n2. advice: Personalized advice and coping strategies\n3. professional_help: Recommended professional help if needed\n4. related_keywords: A list of keywords for related articles\n\nEnsure the response is properly formatted as JSON with these exact field names."
    
    response = run_llm_structure_output(
        system="You are a mental health advisor. Analyze symptoms and provide personalized advice.",
        user_input=prompt,
        response_format={
            "type": "object",
            "properties": {
                "assessment": {"type": "string"},
                "advice": {"type": "string"},
                "professional_help": {"type": "string"},
                "related_keywords": {"type": "array", "items": {"type": "string"}}
            }
        }
    )
    
    return {
        "assessment": response["assessment"],
        "advice": response["advice"],
        "professional_help": response["professional_help"],
        "related_keywords": response["related_keywords"]
    }

# Mental Health Centers functions
def get_all_centers():
    """
    Get all mental health centers from the database
    """
    centers = list(db_mongodb['centers'].find())
    for center in centers:
        center['_id'] = str(center['_id'])
    return centers

def get_center_by_id(center_id: str):
    """
    Get a mental health center by ID
    """
    center = db_mongodb['centers'].find_one({'_id': ObjectId(center_id)})
    if center:
        center['_id'] = str(center['_id'])
    return center

def create_center(center_data: Dict):
    """
    Create a new mental health center
    """
    center_data['created_at'] = datetime.now()
    result = db_mongodb['centers'].insert_one(center_data)
    return str(result.inserted_id)

def update_center(center_id: str, center_data: Dict):
    """
    Update an existing mental health center
    """
    center_data['updated_at'] = datetime.now()
    db_mongodb['centers'].update_one(
        {'_id': ObjectId(center_id)},
        {'$set': center_data}
    )
    return get_center_by_id(center_id)

def delete_center(center_id: str):
    """
    Delete a mental health center
    """
    result = db_mongodb['centers'].delete_one({'_id': ObjectId(center_id)})
    return result.deleted_count > 0

def extract_location_from_text(text: str) -> Optional[str]:
    """
    Extract location information from user text using common patterns
    """
    # Common location patterns in Vietnamese and English
    location_patterns = [
        r'(?:ở|tại|gần|near|in|at)\s+([^,.\n]+)',
        r'(?:quận|district)\s+(\d+)',
        r'(?:thành phố|city)\s+([^,.\n]+)',
        r'(?:tỉnh|province)\s+([^,.\n]+)',
        r'(?:phường|ward)\s+([^,.\n]+)',
        r'(?:đường|street)\s+([^,.\n]+)',
    ]
    
    text_lower = text.lower()
    for pattern in location_patterns:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        if matches:
            return matches[0].strip()
    
    # Check for common Vietnamese city names
    vietnamese_cities = [
        'hồ chí minh', 'ho chi minh', 'saigon', 'sài gòn',
        'hà nội', 'hanoi', 'đà nẵng', 'da nang',
        'cần thơ', 'can tho', 'hải phòng', 'hai phong',
        'biên hòa', 'bien hoa', 'nha trang', 'vũng tàu', 'vung tau'
    ]
    
    for city in vietnamese_cities:
        if city in text_lower:
            return city
    
    return None

def calculate_distance_score(user_location: str, center_address: str) -> float:
    """
    Calculate a simple distance score based on text similarity and common location terms
    Returns a score from 0 to 1, where 1 is closest match
    """
    if not user_location or not center_address:
        return 0.0
    
    user_location = user_location.lower().strip()
    center_address = center_address.lower().strip()
    
    # Exact match gets highest score
    if user_location in center_address or center_address in user_location:
        return 1.0
    
    # Check for district/ward matches
    user_words = set(user_location.split())
    center_words = set(center_address.split())
    
    # Common location keywords
    location_keywords = {'quận', 'district', 'phường', 'ward', 'thành phố', 'city', 'tỉnh', 'province'}
    
    # Calculate word overlap, giving more weight to location-specific terms
    common_words = user_words.intersection(center_words)
    location_matches = common_words.intersection(location_keywords)
    
    if location_matches:
        return 0.8  # High score for location keyword matches
    elif common_words:
        return len(common_words) / max(len(user_words), len(center_words))
    
    return 0.0

def find_nearby_centers(user_location: str, limit: int = 3) -> List[Dict]:
    """
    Find mental health centers near the user's location
    """
    centers = get_all_centers()
    
    if not centers:
        return []
    
    # Calculate distance scores for each center
    scored_centers = []
    for center in centers:
        score = calculate_distance_score(user_location, center.get('address', ''))
        if score > 0:  # Only include centers with some location match
            center['distance_score'] = score
            scored_centers.append(center)
    
    # Sort by distance score (highest first) and limit results
    scored_centers.sort(key=lambda x: x['distance_score'], reverse=True)
    
    # Format the results for display
    nearby_centers = []
    for center in scored_centers[:limit]:
        nearby_centers.append({
            'name': center.get('name', 'Unknown Center'),
            'address': center.get('address', 'Address not available'),
            'contact': center.get('contact', 'Contact not available'),
            'specialization': center.get('specialization', 'General mental health'),
            'note': center.get('note', ''),
            'distance_score': center['distance_score']
        })
    
    return nearby_centers

def suggest_nearby_centers(user_message: str) -> str:
    """
    Suggest nearby mental health centers based on user's message
    """
    # Extract location from user message
    user_location = extract_location_from_text(user_message)
    
    if not user_location:
        # If no specific location found, return general advice
        centers = get_all_centers()[:3]  # Get first 3 centers as general suggestions
        if not centers:
            return "I'd recommend seeking professional help from a mental health center. Unfortunately, I don't have specific center information available right now."
        
        result = "Here are some mental health centers that might help:\n\n"
        for center in centers:
            result += f"**{center.get('name', 'Mental Health Center')}**\n"
            result += f"📍 Address: {center.get('address', 'Address not available')}\n"
            result += f"📞 Contact: {center.get('contact', 'Contact not available')}\n"
            result += f"🏥 Specialization: {center.get('specialization', 'General mental health')}\n"
            if center.get('note'):
                result += f"ℹ️ Note: {center['note']}\n"
            result += "\n"
        
        return result
    
    # Find nearby centers based on extracted location
    nearby_centers = find_nearby_centers(user_location)
    
    if not nearby_centers:
        return f"I couldn't find specific mental health centers near {user_location}. I'd recommend searching online for mental health services in your area or contacting your local healthcare provider for referrals."
    
    result = f"Based on your location ({user_location}), here are some nearby mental health centers:\n\n"
    
    for i, center in enumerate(nearby_centers, 1):
        result += f"**{i}. {center['name']}**\n"
        result += f"📍 Address: {center['address']}\n"
        result += f"📞 Contact: {center['contact']}\n"
        result += f"🏥 Specialization: {center['specialization']}\n"
        if center['note']:
            result += f"ℹ️ Note: {center['note']}\n"
        result += "\n"
    
    result += "💡 **Tip**: I recommend calling ahead to check availability and whether they accept your insurance. Many centers also offer online consultations."
    
    return result
