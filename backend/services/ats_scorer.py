"""
ATS Scoring Service
Calculates a weighted keyword-match score between resume text and JD requirements.
"""

import re
from collections import Counter
from typing import Optional


def extract_jd_keywords(jd_text: str) -> list[str]:
    """
    Extract important keywords from a Job Description.
    Focuses on technical skills, tools, and action verbs.
    """
    # Common filler words to ignore
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
        'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
        'she', 'it', 'they', 'them', 'their', 'its', 'not', 'no', 'nor',
        'as', 'if', 'then', 'than', 'so', 'up', 'out', 'about', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'between',
        'same', 'each', 'every', 'all', 'both', 'few', 'more', 'most',
        'other', 'some', 'such', 'only', 'own', 'also', 'just', 'very',
        'any', 'who', 'which', 'what', 'where', 'when', 'how', 'able',
        'across', 'within', 'including', 'well', 'must', 'role', 'work',
        'working', 'using', 'based', 'etc', 'like', 'new', 'good', 'great',
        'looking', 'join', 'team', 'company', 'position', 'candidate',
        'required', 'preferred', 'years', 'experience', 'strong',
    }

    # Normalize text
    text = jd_text.lower()
    text = re.sub(r'[^a-z0-9\s.#+\-]', ' ', text)

    # Extract words (keep compound tech terms like c++, c#, node.js)
    words = re.findall(r'[a-z][a-z0-9.#+\-]*[a-z0-9+#]|[a-z]', text)

    # Filter out stop words and short words
    keywords = [
        w for w in words
        if w not in stop_words and len(w) > 1
    ]

    # Count frequency — higher frequency = more important
    freq = Counter(keywords)

    # Return unique keywords sorted by frequency (most important first)
    return [word for word, _ in freq.most_common(50)]


def calculate_ats_score(
    resume_text: str,
    jd_keywords: list[str],
    suggested_bullets: Optional[list[str]] = None,
) -> dict:
    """
    Calculate ATS readiness scores.

    Args:
        resume_text: the raw resume text
        jd_keywords: extracted keywords from the JD
        suggested_bullets: optional list of rewritten bullet strings

    Returns:
        dict with before_score, after_score, matched_keywords, missing_keywords
    """
    if not jd_keywords:
        return {
            "before_score": 0,
            "after_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "new_matches_from_bullets": [],
        }

    resume_lower = resume_text.lower()

    # Calculate BEFORE score
    before_matched = [kw for kw in jd_keywords if kw in resume_lower]
    before_score = round((len(before_matched) / len(jd_keywords)) * 100)

    # Calculate AFTER score (with suggested bullets injected)
    if suggested_bullets:
        enhanced_text = resume_lower + " " + " ".join(
            b.lower() for b in suggested_bullets
        )
        after_matched = [kw for kw in jd_keywords if kw in enhanced_text]
        new_matches = [
            kw for kw in after_matched if kw not in before_matched
        ]
    else:
        after_matched = before_matched
        new_matches = []

    after_score = round((len(after_matched) / len(jd_keywords)) * 100)
    missing = [kw for kw in jd_keywords if kw not in (after_matched if suggested_bullets else before_matched)]

    return {
        "before_score": min(before_score, 100),
        "after_score": min(after_score, 100),
        "matched_keywords": before_matched,
        "missing_keywords": missing[:15],  # Top 15 most important missing
        "new_matches_from_bullets": new_matches,
        "total_jd_keywords": len(jd_keywords),
    }
