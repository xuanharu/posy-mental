from typing import Literal
from pydantic import BaseModel
from database import db_mongodb
from bson.objectid import ObjectId
from utils import (
    constants,
    helpers
)
from datetime import datetime

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
def create_post(title, content, image_url, author, tags=None):
    result = db_mongodb['posts'].insert_one(
        {
            "title": title,
            "content": content,
            "imageUrl": image_url,
            "author": author,
            "tags": tags or [],
            "createdAt": datetime.now()
        }
    )
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
