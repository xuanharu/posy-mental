from typing import Literal
from pydantic import BaseModel
from database import db_mongodb
from bson.objectid import ObjectId
from utils import (
    constants,
    helpers
)
from datetime import datetime

# Comment schema in MongoDB:
# {
#     "_id": ObjectId,
#     "postId": ObjectId,
#     "author": str,
#     "content": str,
#     "createdAt": datetime
# }

# Create indexes
db_mongodb['posts'].create_index([("title", "text"), ("content", "text")])
db_mongodb['posts'].create_index([("tags", 1)])  # Index for tag filtering

@helpers.iterable_handler
def get_posts():
    cursor = db_mongodb['posts'].find()
    return list(cursor)

@helpers.iterable_handler
def get_post(post_id):
    return db_mongodb['posts'].find_one({"_id": ObjectId(post_id)})

@helpers.iterable_handler
def create_post(title, content, image_url, author, tags=None, source=None):
    post_data = {
        "title": title,
        "content": content,
        "imageUrl": image_url,
        "author": author,
        "tags": tags or [],
        "createdAt": datetime.now()
    }
    
    if source:
        post_data["source"] = source
        
    result = db_mongodb['posts'].insert_one(post_data)
    return result.inserted_id

@helpers.iterable_handler
def update_post(post_id, title, content, image_url, author, tags=None):
    result = db_mongodb['posts'].update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {
            "title": title,
            "content": content,
            "imageUrl": image_url,
            "author": author,
            "tags": tags or [],
            "updatedAt": datetime.now()
        }}
    )
    return result.modified_count

@helpers.iterable_handler
def delete_post(post_id):
    result = db_mongodb['posts'].delete_one({"_id": ObjectId(post_id)})
    return result.deleted_count

@helpers.iterable_handler
@helpers.iterable_handler
def get_posts_by_tag(tag: str):
    cursor = db_mongodb['posts'].find({"tags": tag})
    return list(cursor)

def search_posts(term: str):
    # Search in both title and content using text index
    cursor = db_mongodb['posts'].find(
        {"$text": {"$search": term}},
        {"score": {"$meta": "textScore"}}  # Add text score
    ).sort([("score", {"$meta": "textScore"})])  # Sort by relevance
    
    # If no results found with text search, try partial matching
    results = list(cursor)
    if not results:
        # Use regex for partial matching if text search returns no results
        regex_pattern = {"$regex": term, "$options": "i"}
        cursor = db_mongodb['posts'].find({
            "$or": [
                {"title": regex_pattern},
                {"content": regex_pattern}
            ]
        })
        results = list(cursor)
    
    return results

@helpers.iterable_handler
def add_comment(post_id: str, author: str, content: str):
    """Add a comment to a post"""
    comment = {
        "postId": ObjectId(post_id),
        "author": author,
        "content": content,
        "createdAt": datetime.now()
    }
    result = db_mongodb['comments'].insert_one(comment)
    return result.inserted_id

@helpers.iterable_handler
def get_comments(post_id: str):
    """Get all comments for a post"""
    cursor = db_mongodb['comments'].find(
        {"postId": ObjectId(post_id)}
    ).sort("createdAt", -1)  # Sort by newest first
    return list(cursor)

@helpers.iterable_handler
def get_comment_count(post_id: str):
    """Get the number of comments for a post"""
    return db_mongodb['comments'].count_documents({"postId": ObjectId(post_id)})

@helpers.iterable_handler
def delete_comment(comment_id: str):
    """Delete a comment"""
    result = db_mongodb['comments'].delete_one({"_id": ObjectId(comment_id)})
    return result.deleted_count

@helpers.iterable_handler
def get_crawled_posts():
    """Get all posts that have a source URL (crawled posts)"""
    cursor = db_mongodb['posts'].find(
        {"source": {"$exists": True}}
    ).sort("createdAt", -1)  # Sort by newest first
    return list(cursor)

@helpers.iterable_handler
def approve_post(post_id):
    """
    Approve a post by removing 'pending' and 'approval' from tags,
    and updating updatedAt. Keeps other tags.
    """
    post = db_mongodb['posts'].find_one({"_id": ObjectId(post_id)})
    if not post:
        return 0

    tags = post.get("tags", [])
    # Remove 'pending' and 'approval' tags, keep others
    tags = [t for t in tags if t not in ("pending", "approval")]
    # Optionally, add 'approved' tag if you want to mark it
    # tags.append("approved")

    # If author is an ID, try to look up the author's name
    author = post.get("author")
    author_name = author
    if ObjectId.is_valid(str(author)):
        user = db_mongodb['users'].find_one({"_id": ObjectId(author)})
        if user and "name" in user:
            author_name = user["name"]

    result = db_mongodb['posts'].update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {
            "tags": tags,
            "author": author_name,
            "updatedAt": datetime.now()
        }}
    )
    return result.modified_count
