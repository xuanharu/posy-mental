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
        # Find questions related to this symptom
        symptom_questions = [q for q, a in answers.items() if symptom.lower() in q.lower()]
        for question in symptom_questions:
            context += f"\nQ: {question}\nA: {answers[question]}"
    
    prompt = f"{context}\n\nProvide a response with:\n1. assessment: A brief assessment of potential mental health status\n2. advice: Personalized advice and coping strategies\n3. professional_help: Recommended professional help if needed\n4. related_keywords: A list of keywords for related articles\n\nEnsure the response is properly formatted as JSON with these exact field names."
    
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
