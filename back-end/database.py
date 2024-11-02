import dotenv
dotenv.load_dotenv()

import os
from pymongo import MongoClient

try:
    # Create MongoDB client
    client = MongoClient(os.getenv("MONGODB_CONNECTION_STRING"))
    db_mongodb = client['posy_mental']
    
    # Test connection by listing database names
    print("Connected successfully. Available databases:", client.list_database_names())
    
except Exception as e:
    print("Connection error:", e)