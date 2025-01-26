import dotenv
dotenv.load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from routers import (
    chatbot_endpoints,
    post_endpoints,
    auth_endpoints,
    crawl_endpoint
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

app.include_router(chatbot_endpoints.router, prefix="/chatbot", tags=["chatbot"])
app.include_router(post_endpoints.router, prefix="/post", tags=["post on newfeed"])
app.include_router(auth_endpoints.router, prefix="/auth", tags=["authentication"])
app.include_router(crawl_endpoint.router, prefix="/crawl", tags=["crawl article from other website"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
