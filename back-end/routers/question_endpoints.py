from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from services.question_services import generate_questions_for_tags

router = APIRouter()

class TagsRequest(BaseModel):
    tags: List[str]

@router.post("/generate-questions")
async def generate_questions(request: TagsRequest):
    """
    Generate questions based on selected mental health tags.
    """
    try:
        questions = generate_questions_for_tags(request.tags)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
