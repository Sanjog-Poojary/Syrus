from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS
from routes.resume import router as resume_router

app = FastAPI(
    title="Cyrus — Resume Agent API",
    description="Honesty-First AI resume tailoring for campus placements",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(resume_router, prefix="/api")


@app.get("/")
async def health():
    return {"status": "ok", "service": "cyrus-resume-agent"}
