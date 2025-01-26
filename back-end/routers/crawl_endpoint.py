from fastapi import APIRouter
from services import crawl_service

router = APIRouter()

@router.post("/crawl")
def crawl(url: str):
    return crawl_service.crawl_and_parse(url)