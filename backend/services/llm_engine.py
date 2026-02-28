"""
LLM Engine Service — Grok API (xAI)
Uses the OpenAI-compatible endpoint to generate honest bullet rewrites.
"""

from openai import OpenAI
from config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL


SYSTEM_PROMPT = """You are Cyrus, an expert resume consultant for Indian college students preparing for campus placements.

## ABSOLUTE RULES — HONESTY FIRST
1. You may ONLY rephrase, restructure, or reword experiences that ALREADY EXIST in the student's parsed resume.
2. You must NEVER invent new skills, technologies, projects, or job titles.
3. You must NEVER fabricate metrics (revenue, percentages, user counts) unless they appear in the resume.
4. If the student lacks relevant experience for a JD requirement, say so honestly — do NOT make something up.

## YOUR TASK
Given a parsed student resume and a Job Description (JD), produce exactly 3 tailored bullet-point rewrites.

Each bullet should:
- Map a REAL experience from the resume to a SPECIFIC requirement from the JD
- Use the JD's exact keywords/phrases where the student's experience genuinely matches
- Follow the XYZ formula: "Accomplished [X] by doing [Y], resulting in [Z]"
- Be concise (one line, under 25 words)

## OUTPUT FORMAT
Return a JSON object with this structure:
{
  "bullets": [
    {
      "original": "the original bullet from the resume",
      "rewritten": "the tailored rewrite using JD keywords",
      "jd_keywords_used": ["keyword1", "keyword2"],
      "rationale": "brief explanation of what was changed and why"
    }
  ],
  "match_analysis": {
    "strong_matches": ["skills/experiences that directly match the JD"],
    "partial_matches": ["skills that partially relate"],
    "gaps": ["JD requirements the student does NOT have experience in"]
  }
}

Only return valid JSON. No markdown fences, no extra text."""


def generate_bullets(parsed_resume: dict, jd_text: str) -> dict:
    """
    Call the Grok API to generate 3 tailored bullet rewrites.

    Args:
        parsed_resume: dict from pdf_parser with raw_text and sections
        jd_text: the raw job description text

    Returns:
        dict with bullets and match_analysis
    """
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
    )

    # Build context from parsed resume
    resume_context = _build_resume_context(parsed_resume)

    user_prompt = f"""## STUDENT'S PARSED RESUME
{resume_context}

## JOB DESCRIPTION
{jd_text}

Generate exactly 3 honest, tailored bullet-point rewrites. Return valid JSON only."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=1500,
        response_format={"type": "json_object"},
    )

    import json
    result_text = response.choices[0].message.content
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "bullets": [],
            "match_analysis": {"strong_matches": [], "partial_matches": [], "gaps": []},
            "error": "Failed to parse LLM response",
            "raw_response": result_text,
        }


def _build_resume_context(parsed_resume: dict) -> str:
    """Format parsed resume into a readable context string for the LLM."""
    sections = parsed_resume.get("sections", {})
    parts = []

    for heading, content in sections.items():
        if content.strip():
            parts.append(f"### {heading}\n{content}")

    if parts:
        return "\n\n".join(parts)

    # Fallback to raw text if no sections detected
    return parsed_resume.get("raw_text", "No resume content found.")
