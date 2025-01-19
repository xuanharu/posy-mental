# chatbot_endpoints.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services import post_services, auth_services

router = APIRouter()

@router.get("/posts")
def get_posts():
    return post_services.get_posts()

@router.get("/post/{post_id}")
def get_post(post_id):
    return post_services.get_post(post_id)

@router.post("/create-post")
def create_post(title, content, image_url, author, tags: Optional[str] = None):
    tag_list = [] if not tags else eval(tags)  # Convert string representation of list to actual list
    return post_services.create_post(title, content, image_url, author, tag_list)

@router.put("/update-post/{post_id}")
def update_post(post_id, title, content, image_url, author, tags: Optional[str] = None):
    tag_list = [] if not tags else eval(tags)  # Convert string representation of list to actual list
    return post_services.update_post(post_id, title, content, image_url, author, tag_list)

@router.get("/posts/tag/{tag}")
def get_posts_by_tag(tag: str):
    return post_services.get_posts_by_tag(tag)

@router.delete("/delete-post/{post_id}")
def delete_post(post_id):
    return post_services.delete_post(post_id)

@router.get("/search")
def search_posts(term: str):
    return post_services.search_posts(term)
