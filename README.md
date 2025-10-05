<<<<<<< HEAD
# Posy - Mental Health Consultant

![Posy Logo](posy-mental/images/logo.png)

## 🌟 Overview

Posy is a comprehensive mental health web application designed to provide personalized mental healthcare support. The platform combines AI-powered chatbot assistance, informative news feeds, and professional mental health services to create a safe and supportive online space for mental well-being.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: OpenAI GPT
- **Authentication**: JWT (JSON Web Tokens)
- **Server**: Uvicorn ASGI server

### Frontend
- **Languages**: HTML5, CSS3, JavaScript
- **Styling**: Bootstrap, Custom CSS
- **UI Components**: Font Awesome icons, Owl Carousel
- **Responsive Design**: Mobile-first approach

### Dependencies
```
pymongo          # MongoDB driver
fastapi          # Web framework
openai           # AI chatbot integration
python-dotenv    # Environment variables
markdown         # Content formatting
uvicorn          # ASGI server
passlib          # Password hashing
PyJWT            # JWT authentication
markdownify      # HTML to Markdown conversion
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- MongoDB database
- OpenAI API key (for chatbot functionality)

### Step 1: Clone the Repository
```bash
git clone https://github.com/xuanharu/posy-mental.git
cd posy-mental
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Environment Configuration
Create a `.env` file in the `back-end` directory with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
```

### Step 4: Run the Application
```bash
# Navigate to the back-end directory
cd back-end

# Start the server
python app.py
```

The application will be available at: `http://localhost:8000`

## 📁 Project Structure

```
posy-mental/
├── back-end/                    # Backend API server
│   ├── routers/                 # API route handlers
│   │   ├── auth_endpoints.py    # Authentication routes
│   │   ├── chatbot_endpoints.py # AI chatbot routes
│   │   ├── mental_health_endpoints.py # Assessment routes
│   │   ├── post_endpoints.py    # News feed routes
│   │   └── crawl_endpoint.py    # Content crawling routes
│   ├── services/                # Business logic layer
│   │   ├── auth_services.py     # Authentication services
│   │   ├── llm_services.py      # AI/LLM integration
│   │   ├── mental_health_services.py # Assessment services
│   │   ├── post_services.py     # Content management
│   │   └── chatbot_services/    # Chatbot logic
│   ├── utils/                   # Utility functions
│   │   ├── constants.py         # Application constants
│   │   ├── helpers.py           # Helper functions
│   │   └── logger.py            # Logging configuration
│   ├── app.py                   # Main application entry point
│   └── database.py              # Database configuration
├── posy-mental/                 # Frontend web application
│   ├── css/                     # Stylesheets
│   ├── js/                      # JavaScript files
│   ├── images/                  # Image assets
│   ├── index.html               # Homepage
│   ├── chat.html                # AI chatbot interface
│   ├── newsfeed.html            # News feed page
│   ├── login.html               # User authentication
│   └── ...                      # Other HTML pages
├── requirements.txt             # Python dependencies
└── README.md                    # Project documentation
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Chatbot
- `POST /chatbot/chat` - Send message to AI chatbot
- `GET /chatbot/history` - Get chat history

### Mental Health
- `POST /mental-health/assessment` - Submit mental health assessment
- `GET /mental-health/results` - Get assessment results

### Posts/News Feed
- `GET /post/feed` - Get news feed posts
- `POST /post/create` - Create new post
- `POST /post/comment` - Add comment to post

### Content Crawling
- `POST /crawl/articles` - Crawl external mental health articles

## 🎯 Usage Guide

### For Users
1. **Registration**: Create an account on the registration page
2. **Explore News Feed**: Browse mental health tips and articles
3. **Chat with Posy**: Access the AI chatbot for immediate support
4. **Take Assessments**: Complete mental health evaluations
5. **Get Help**: Access emergency resources when needed

### For Healthcare Providers
1. **Professional Dashboard**: Access specialized interface
2. **Patient Management**: Monitor and support patients
3. **Content Creation**: Publish professional articles and tips
4. **Assessment Review**: Analyze patient assessment results

### For Administrators
1. **Content Management**: Moderate posts and articles
2. **User Administration**: Manage user accounts and permissions
3. **System Monitoring**: Track application performance and usage

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **Environment Variables**: Secure configuration management

## 🤝 Contributing

We welcome contributions to improve Posy! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- OpenAI for GPT integration
- FastAPI community for the excellent framework
- Bootstrap team for responsive design components
- Mental health professionals who provided guidance

**© Copyright 2024 | All Rights Reserved by Xuan Nguyen**
=======
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

Once both the backend and frontend services are running, you can access the application in your web browser at `http://localhost:3000/posy-mental`.
>>>>>>> 711988db4779512e29ad30d02dc3d27de2889aff


# Performance Testing
Download locust by the link
Then use terminal 
cmd /c "cd back-end & locust -f locustfile.py --host http://localhost:8000"
http://localhost:8089