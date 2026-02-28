"""
Resume API Routes
Endpoints for uploading resumes, analyzing JDs, and generating tailored bullets.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.pdf_parser import extract_text_from_pdf
from services.llm_engine import generate_bullets
from services.ats_scorer import extract_jd_keywords, calculate_ats_score

router = APIRouter(tags=["Resume Agent"])


# ────────────────────────────────────────────
# Request / Response Models
# ────────────────────────────────────────────

class JDAnalyzeRequest(BaseModel):
    jd_text: str


class GenerateBulletsRequest(BaseModel):
    parsed_resume: dict
    jd_text: str


# ────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF resume and get structured parsed output.
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted."
        )

    # Validate file size (10MB max)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit."
        )

    try:
        parsed = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse PDF: {str(e)}"
        )

    return {
        "status": "success",
        "filename": file.filename,
        "parsed_resume": parsed,
    }


@router.post("/analyze-jd")
async def analyze_jd(request: JDAnalyzeRequest):
    """
    Analyze a Job Description and extract keywords.
    """
    if not request.jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description text cannot be empty."
        )

    keywords = extract_jd_keywords(request.jd_text)

    return {
        "status": "success",
        "keywords": keywords,
        "keyword_count": len(keywords),
    }


@router.post("/generate-bullets")
async def generate_tailored_bullets(request: GenerateBulletsRequest):
    """
    Generate 3 tailored bullet rewrites + ATS scores.
    The core endpoint of the Resume Agent.
    """
    if not request.jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description text cannot be empty."
        )

    if not request.parsed_resume.get("raw_text", "").strip():
        raise HTTPException(
            status_code=400,
            detail="Parsed resume is empty. Upload a resume first."
        )

    # Step 1: Extract JD keywords
    jd_keywords = extract_jd_keywords(request.jd_text)

    # Step 2: Generate bullets via Grok LLM
    llm_result = generate_bullets(request.parsed_resume, request.jd_text)

    # Step 3: Calculate ATS scores
    suggested_texts = [
        b.get("rewritten", "") for b in llm_result.get("bullets", [])
    ]

    scores = calculate_ats_score(
        resume_text=request.parsed_resume["raw_text"],
        jd_keywords=jd_keywords,
        suggested_bullets=suggested_texts,
    )

    return {
        "status": "success",
        "bullets": llm_result.get("bullets", []),
        "match_analysis": llm_result.get("match_analysis", {}),
        "ats_scores": scores,
        "jd_keywords": jd_keywords,
    }
