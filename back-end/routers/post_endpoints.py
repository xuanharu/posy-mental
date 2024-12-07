# chatbot_endpoints.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import post_services

router = APIRouter()

@router.get("/posts")
def get_posts():
    post_services.get_posts()

@router.get("/post/{post_id}")
def get_post(post_id):
    post_services.get_post(post_id)

@router.post("/create-post")
def create_post(title, content, image_url):
    post_services.create_post(title, content, image_url)

@router.put("/update-post/{post_id}")
def update_post(post_id, title, content, image_url):
    post_services.update_post(post_id, title, content, image_url)

@router.delete("/delete-post/{post_id}")
def delete_post(post_id):
    post_services.delete_post(post_id)