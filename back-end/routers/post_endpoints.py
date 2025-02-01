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
def create_post(title, content, image_url, author, tags: Optional[str] = None, source: Optional[str] = None):
    tag_list = [] if not tags else eval(tags)  # Convert string representation of list to actual list
    return post_services.create_post(title, content, image_url, author, tag_list, source)

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

@router.post("/post/{post_id}/comment")
def add_comment(post_id: str, author: str, content: str):
    return post_services.add_comment(post_id, author, content)

@router.get("/post/{post_id}/comments")
def get_comments(post_id: str):
    return post_services.get_comments(post_id)

@router.get("/post/{post_id}/comment-count")
def get_comment_count(post_id: str):
    return post_services.get_comment_count(post_id)

@router.delete("/comment/{comment_id}")
def delete_comment(comment_id: str):
    return post_services.delete_comment(comment_id)

@router.get("/crawled-posts")
def get_crawled_posts():
    """Get all posts that were created from crawled content"""
    return post_services.get_crawled_posts()
