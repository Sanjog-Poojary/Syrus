"""
Resume API Routes
Endpoints for uploading resumes, analyzing JDs, generating tailored bullets,
rewriting bullets (Honesty-First), and interview prep.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.pdf_parser import extract_text_from_pdf
from services.llm_engine import generate_bullets
from services.ats_scorer import extract_jd_keywords, calculate_ats_score
from services.rewrite_engine import rewrite_bullet
from services.interview_engine import generate_interview_prep
from services.roadmap_engine import generate_career_roadmap
from services.assessment_engine import generate_assessment_prep

router = APIRouter(tags=["Resume Agent"])


# ────────────────────────────────────────────
# Request / Response Models
# ────────────────────────────────────────────

class JDAnalyzeRequest(BaseModel):
    jd_text: str


class GenerateBulletsRequest(BaseModel):
    parsed_resume: dict
    jd_text: str


class RewriteBulletRequest(BaseModel):
    master_resume_text: str  # Full resume text for honesty verification
    target_jd: str
    target_experience: str   # The specific bullet/experience to rewrite


class InterviewPrepRequest(BaseModel):
    project_title: str
    project_description: str
    tech_stack: list[str] = []
    github_url: Optional[str] = None


class CareerRoadmapRequest(BaseModel):
    master_resume_text: str
    target_jd: str


class AssessmentPrepRequest(BaseModel):
    target_jd: str


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


# ────────────────────────────────────────────
# Honesty-First Rewrite Engine
# ────────────────────────────────────────────

@router.post("/rewrite-bullet")
async def rewrite_bullet_endpoint(request: RewriteBulletRequest):
    """
    Rewrite a specific resume experience for a target JD.
    Passes the FULL master_resume_text so the LLM can verify
    honesty against the student's complete history.
    """
    if not request.master_resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Master resume text is required for honesty verification."
        )

    if not request.target_jd.strip():
        raise HTTPException(
            status_code=400,
            detail="Target job description cannot be empty."
        )

    if not request.target_experience.strip():
        raise HTTPException(
            status_code=400,
            detail="Target experience to rewrite cannot be empty."
        )

    try:
        result = rewrite_bullet(
            master_resume_text=request.master_resume_text,
            target_jd=request.target_jd,
            target_experience=request.target_experience,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Rewrite engine failed: {str(e)}"
        )

    return {
        "status": "success",
        **result,
    }


# ────────────────────────────────────────────
# Deep-Dive Interview Prep
# ────────────────────────────────────────────

@router.post("/interview-prep")
async def interview_prep_endpoint(request: InterviewPrepRequest):
    """
    Generate 5 contextual interview questions for a student's project.
    """
    if not request.project_title.strip():
        raise HTTPException(
            status_code=400,
            detail="Project title is required."
        )

    if not request.project_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Project description is required."
        )

    try:
        result = generate_interview_prep(
            project_title=request.project_title,
            project_description=request.project_description,
            tech_stack=request.tech_stack,
            github_url=request.github_url,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Interview prep engine failed: {str(e)}"
        )

    return {
        "status": "success",
        **result,
    }


# ────────────────────────────────────────────
# Career Roadmap Architect (Skill Gaps)
# ────────────────────────────────────────────

@router.post("/career-roadmap")
async def career_roadmap_endpoint(request: CareerRoadmapRequest):
    """
    Generate a career roadmap identifying skill gaps and learning resources.
    """
    if not request.master_resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Master resume text is required."
        )

    if not request.target_jd.strip():
        raise HTTPException(
            status_code=400,
            detail="Target job description is required."
        )

    try:
        result = generate_career_roadmap(
            master_resume_text=request.master_resume_text,
            target_jds=request.target_jd,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Career roadmap engine failed: {str(e)}"
        )

    return {
        "status": "success",
        **result,
    }


# ────────────────────────────────────────────
# Placement Intelligence Agent (Assessments)
# ────────────────────────────────────────────

@router.post("/assessment-prep")
async def assessment_prep_endpoint(request: AssessmentPrepRequest):
    """
    Predict the assessment pattern based on the target company JD.
    """
    if not request.target_jd.strip():
        raise HTTPException(
            status_code=400,
            detail="Target job description is required."
        )

    try:
        result = generate_assessment_prep(
            target_jd=request.target_jd,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Assessment Prep engine failed: {str(e)}"
        )

    return {
        "status": "success",
        **result,
    }
