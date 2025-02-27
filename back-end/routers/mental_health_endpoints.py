from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from services.mental_health_services import (
    get_questions_for_symptoms,
    generate_mental_health_advice,
    get_all_centers,
    get_center_by_id,
    create_center,
    update_center,
    delete_center
)

router = APIRouter()

class SymptomsRequest(BaseModel):
    symptoms: List[str]

class AnswersRequest(BaseModel):
    symptoms: List[str]
    answers: Dict[str, str]

class CenterRequest(BaseModel):
    name: str
    address: str
    map_embed: str
    contact: str
    specialization: str
    note: Optional[str] = None

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

# Centers endpoints
@router.get("/centers")
def get_centers():
    """
    Get all mental health centers
    """
    try:
        centers = get_all_centers()
        return {"centers": centers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/centers/{center_id}")
def get_center(center_id: str):
    """
    Get a mental health center by ID
    """
    try:
        center = get_center_by_id(center_id)
        if not center:
            raise HTTPException(status_code=404, detail="Center not found")
        return center
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/centers")
def add_center(center: CenterRequest):
    """
    Create a new mental health center
    """
    try:
        center_id = create_center(center.dict())
        return {"id": center_id, "message": "Center created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/centers/{center_id}")
def edit_center(center_id: str, center: CenterRequest):
    """
    Update an existing mental health center
    """
    try:
        updated_center = update_center(center_id, center.dict())
        if not updated_center:
            raise HTTPException(status_code=404, detail="Center not found")
        return updated_center
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/centers/{center_id}")
def remove_center(center_id: str):
    """
    Delete a mental health center
    """
    try:
        success = delete_center(center_id)
        if not success:
            raise HTTPException(status_code=404, detail="Center not found")
        return {"message": "Center deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
