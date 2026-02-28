# Syrus - Honest AI Resume Agent

An AI-powered web application designed specifically for college students navigating campus placements. Syrus translates existing student experiences into the specific language required by applicant tracking systems (ATS) using an "Honesty-First" AI approach.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Python, FastAPI
- **AI**: Groq API (Llama-3.3-70b-versatile)
- **Document Processing**: PyMuPDF

## Running Locally

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Groq API key to .env
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application.
