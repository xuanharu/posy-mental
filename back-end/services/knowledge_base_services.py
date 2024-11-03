from database import db_mongodb
from typing import List
from services import llm_services
from utils.logger import logger

collection = db_mongodb['questionAnswerPairs']

def create(question: str, answers: List[str]):
    result = collection.insert_one({
        "sampleQuestion": question,
        "sampleAnswers": answers,
        "vector": llm_services.get_word_embeddings(question)
    })
    
    logger.info(f"Inserted new question-answer pair with id: {result.inserted_id}")

def retrive_by_question(question: str, min_score = 0.5):
    # define pipeline
    pipeline = [
    {
        '$vectorSearch': {
        'index': 'default', 
        'path': 'vector',
        'queryVector': llm_services.get_word_embeddings(question),
        'numCandidates': 50, 
        'limit': 5
        }
    }, 
    {
        '$project': { 
        'sampleQuestion':1,
        'sampleAnswers':1,
        'score': {
            '$meta': 'vectorSearchScore'
        }
        }
    },
    {
        '$match': {
            'score': {'$gte': min_score}
        }
    }
    ]

    # run pipeline
    result = collection.aggregate(pipeline)
    
    return list(result)