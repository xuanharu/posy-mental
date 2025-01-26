from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
from services.advice_services import generate_advice

router = APIRouter()

class AnswerSubmission(BaseModel):
    answers: List[Dict[str, str]]
    tags: List[str]

@router.post("/generate-advice")
async def get_advice(submission: AnswerSubmission):
    """
    Generate personalized advice based on questionnaire answers.
    """
    try:
        advice = generate_advice(submission.answers, submission.tags)
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
