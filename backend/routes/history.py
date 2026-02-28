"""
History API Routes
Endpoints for saving and retrieving user session history.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.firestore import save_session, get_sessions, get_session_by_id

router = APIRouter(tags=["History"])


class SaveSessionRequest(BaseModel):
    user_id: str
    jd_text: str
    bullets: list
    match_analysis: dict = {}
    ats_scores: dict = {}
    jd_keywords: list = []


@router.post("/history")
async def create_session(request: SaveSessionRequest):
    """
    Save a resume analysis session to history.
    """
    if not request.user_id.strip():
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        session_id = save_session(request.user_id, request.dict())
        return {
            "status": "success",
            "session_id": session_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save session: {str(e)}")


@router.get("/history")
async def list_sessions(user_id: str, limit: int = 20):
    """
    Get all sessions for a user.
    """
    if not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        sessions = get_sessions(user_id, limit)
        return {
            "status": "success",
            "sessions": sessions,
            "count": len(sessions),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.get("/history/{session_id}")
async def get_session(session_id: str, user_id: str):
    """
    Get a single session by ID.
    """
    if not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        session = get_session_by_id(user_id, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return {
            "status": "success",
            "session": session,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session: {str(e)}")
