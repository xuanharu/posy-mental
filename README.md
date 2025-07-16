# Posy Mental - Mental Health Support Platform

Posy Mental is a comprehensive platform designed to provide mental health support, resources, and community features. It aims to connect users with mental health professionals, offer AI-powered chatbot assistance, and provide a space for sharing experiences and accessing relevant information.

## Features

*   **AI Chatbot**: Get instant support and guidance through an intelligent chatbot.
*   **Mental Health Resources**: Access articles, advice, and information on various mental health topics.
*   **Community Newsfeed**: Share posts, connect with others, and find support within the community.
*   **Professional Connections**: Discover and connect with mental health professionals.

## Technologies Used

*   **Backend**: Python, FastAPI
*   **Frontend**: HTML, CSS, JavaScript
*   **Database**: (Assuming SQLite or PostgreSQL based on common Python setups, will leave generic for now)
*   **AI/ML**: (Assuming some LLM integration based on `llm_services.py` and `chatbot_handle_message.py`)

## Setup Instructions

To get the project up and running, follow these steps:

### 1. Environment Setup

First, set up your Python virtual environment and install the necessary dependencies.

```bash
uv venv
uv pip install -r requirements.txt
```

### 2. Run Backend

Navigate to the `back-end` directory and start the FastAPI application.

```bash
cd ./back-end
uv run python app.py
```

### 3. Run Frontend

From the project root directory, serve the frontend files using a simple Python HTTP server. Remember to access the application at `http://localhost:3000/posy-mental`.

```bash
uv run python -m http.server 3000
```

### LLM Tracing

For LLM tracing, you can access the LangChain project dashboard here:
[https://smith.langchain.com/o/45824a77-a245-5932-b33e-bae9a3643e88/projects/p/c52c5fbc-8390-42bd-9dbc-de7bde9d5fca?timeModel=%7B%22duration%22%3A%227d%22%7D](https://smith.langchain.com/o/45824a77-a245-5932-b33e-bae9a3643e88/projects/p/c52c5fbc-8390-42bd-9dbc-de7bde9d5fca?timeModel=%7B%22duration%22%3A%227d%22%7D)

Once both the backend and frontend services are running, you can access the application in your web browser at `http://localhost:3000/posy-mental`.
