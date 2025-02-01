from fastapi import APIRouter, HTTPException
from services import crawl_service

router = APIRouter()

@router.post("/crawl")
def crawl(url: str):
    try:
        result = crawl_service.crawl_and_parse(url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
