from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from services.mental_health_services import (
    get_questions_for_symptoms,
    generate_mental_health_advice
)

router = APIRouter()

class SymptomsRequest(BaseModel):
    symptoms: List[str]

class AnswersRequest(BaseModel):
    symptoms: List[str]
    answers: Dict[str, str]

@router.post("/get_questions")
def get_questions(request: SymptomsRequest):
    """
    Generate questions based on selected symptoms
    """
    try:
        questions = get_questions_for_symptoms(request.symptoms)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_advice")
def get_advice(request: AnswersRequest):
    """
    Generate personalized mental health advice based on symptoms and answers
    """
    try:
        advice = generate_mental_health_advice(request.symptoms, request.answers)
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
