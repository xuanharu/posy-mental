import dotenv
dotenv.load_dotenv()

from fastapi import FastAPI
from typing import Optional
from routers import (
    chatbot_endpoints
)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

app.include_router(chatbot_endpoints.router, prefix="/chatbot", tags=["chatbot"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)