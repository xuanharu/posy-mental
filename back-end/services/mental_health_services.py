from typing import List, Dict
from services.llm_services import run_llm_structure_output

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
    ]
}

async def get_questions_for_symptoms(symptoms: List[str]) -> List[Dict]:
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
            response = await run_llm_structure_output(
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

async def generate_mental_health_advice(symptoms: List[str], answers: Dict[str, str]) -> Dict:
    """
    Generate personalized mental health advice based on symptoms and answers
    """
    # Prepare context for LLM
    context = f"Based on the following symptoms and responses:\n"
    for symptom in symptoms:
        context += f"\nSymptom: {symptom}"
        for q_key, answer in answers.items():
            if q_key.startswith(symptom):
                context += f"\nQ: {q_key}\nA: {answer}"
    
    prompt = f"{context}\n\nProvide:\n1. A brief assessment of potential mental health status\n2. Personalized advice and coping strategies\n3. Recommended professional help if needed\n4. Keywords for related articles"
    
    response = await run_llm_structure_output(
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
