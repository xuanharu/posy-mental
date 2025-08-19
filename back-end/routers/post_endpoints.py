# chatbot_endpoints.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import json
from services import post_services, auth_services

router = APIRouter()

# --- NEW API for /api/posts ---
from fastapi import APIRouter as FastAPIRouter

api_router = FastAPIRouter(prefix="/api/posts")

class PostSubmitRequest(BaseModel):
    title: str
    content: str
    authorId: str
    imageUrl: str = ""

@api_router.post("/submit")
def submit_post(data: PostSubmitRequest):
    # Create a post with status "pending"
    return post_services.create_post(
        data.title,
        data.content,
        data.imageUrl,  # image_url
        data.authorId,
        ["pending"],  # tags
        None  # source
    )

@api_router.get("")
def get_posts_by_status(status: str = None):
    # If status is provided, filter by tag/status
    posts = post_services.get_posts()
    if status:
        posts = [p for p in posts if "tags" in p and status in p["tags"]]
    return posts

@api_router.get("/pending")
def get_pending_posts():
    posts = post_services.get_posts()
    return [p for p in posts if "tags" in p and "pending" in p["tags"]]

@api_router.post("/approve/{post_id}")
def approve_post(post_id: str):
    modified = post_services.approve_post(post_id)
    if modified:
        return {"success": True}
    else:
        raise HTTPException(status_code=404, detail="Post not found")

@api_router.delete("/decline/{post_id}")
def decline_post(post_id: str):
    deleted = post_services.delete_post(post_id)
    if deleted:
        return {"success": True}
    else:
        raise HTTPException(status_code=404, detail="Post not found")

@api_router.get("/user/{user_id}")
def get_user(user_id: str):
    from database import db_mongodb
    from bson.objectid import ObjectId
    user = db_mongodb['users'].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only return safe fields
    return {"_id": str(user["_id"]), "name": user.get("name", ""), "email": user.get("email", "")}

@router.get("/posts")
def get_posts():
    return post_services.get_posts()

@router.get("/post/{post_id}")
def get_post(post_id):
    return post_services.get_post(post_id)

@router.post("/create-post")
def create_post(title, content, image_url, author, tags: Optional[str] = None, source: Optional[str] = None):
    # Safely parse tags JSON string
    tag_list = []
    if tags:
        try:
            tag_list = json.loads(tags)
            if not isinstance(tag_list, list):
                raise ValueError("Tags must be a list")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid tags format: {str(e)}")
    
    # Validate required parameters
    if not title or not content or not author:
        raise HTTPException(status_code=422, detail="Title, content, and author are required")
    
    try:
        return post_services.create_post(title, content, image_url, author, tag_list, source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@router.put("/update-post/{post_id}")
def update_post(post_id, title, content, image_url, author, tags: Optional[str] = None):
    # Safely parse tags JSON string
    tag_list = []
    if tags:
        try:
            tag_list = json.loads(tags)
            if not isinstance(tag_list, list):
                raise ValueError("Tags must be a list")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid tags format: {str(e)}")
    
    # Validate required parameters
    if not title or not content or not author:
        raise HTTPException(status_code=422, detail="Title, content, and author are required")
    
    try:
        return post_services.update_post(post_id, title, content, image_url, author, tag_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update post: {str(e)}")

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
