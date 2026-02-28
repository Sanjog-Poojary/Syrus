"""
Firestore Service
Handles saving and retrieving user sessions from Firebase Firestore.
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # Check for credentials JSON string in env var (for Render/production)
    creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
    if creds_json:
        creds_dict = json.loads(creds_json)
        cred = credentials.Certificate(creds_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Falls back to GOOGLE_APPLICATION_CREDENTIALS file path or ADC
        firebase_admin.initialize_app()

db = firestore.client()


def save_session(user_id: str, data: dict) -> str:
    """
    Save a resume analysis session to Firestore.
    Returns the session document ID.
    """
    session_data = {
        "user_id": user_id,
        "jd_text": data.get("jd_text", ""),
        "jd_snippet": data.get("jd_text", "")[:120],
        "bullets": data.get("bullets", []),
        "match_analysis": data.get("match_analysis", {}),
        "ats_scores": data.get("ats_scores", {}),
        "jd_keywords": data.get("jd_keywords", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    doc_ref = db.collection("users").document(user_id).collection("sessions").add(session_data)
    return doc_ref[1].id


def get_sessions(user_id: str, limit: int = 20) -> list:
    """
    Retrieve recent sessions for a user, newest first.
    """
    sessions_ref = (
        db.collection("users")
        .document(user_id)
        .collection("sessions")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )

    sessions = []
    for doc in sessions_ref.stream():
        session = doc.to_dict()
        session["id"] = doc.id
        sessions.append(session)

    return sessions


def get_session_by_id(user_id: str, session_id: str) -> dict | None:
    """
    Retrieve a single session by ID.
    """
    doc = (
        db.collection("users")
        .document(user_id)
        .collection("sessions")
        .document(session_id)
        .get()
    )

    if doc.exists:
        session = doc.to_dict()
        session["id"] = doc.id
        return session
    return None
