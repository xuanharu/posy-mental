from typing import Literal
from pydantic import BaseModel
from database import db_mongodb
from bson.objectid import ObjectId
from utils import (
    constants,
    helpers
)
from datetime import datetime

@helpers.iterable_handler
def get_posts():
    cursor = db_mongodb['posts'].find()
    return list(cursor)

@helpers.iterable_handler
def get_post(post_id):
    return db_mongodb['posts'].find_one({"_id": ObjectId(post_id)})

@helpers.iterable_handler
def create_post(title, content, image_url, author):
    result = db_mongodb['posts'].insert_one(
        {
            "title": title,
            "content": content,
            "imageUrl": image_url,
            "author":author,
            "createdAt": datetime.now()
        }
    )
    return result.inserted_id

@helpers.iterable_handler
def update_post(post_id, title, content, image_url, author):
    result = db_mongodb['posts'].update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {
            "title": title,
            "content": content,
            "imageUrl": image_url,
            "author":author,
            "updatedAt": datetime.now()
        }
        }
    )
    return result.modified_count

@helpers.iterable_handler
def delete_post(post_id):
    result = db_mongodb['posts'].delete_one({"_id": ObjectId(post_id)})
    return result.deleted_count