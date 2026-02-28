import os
from dotenv import load_dotenv

load_dotenv()

# Groq API — OpenAI-compatible endpoint
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Firebase
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "cyrus-732cc")

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Upload limits
MAX_FILE_SIZE_MB = 10
