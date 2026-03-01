"""
Assessment Engine Service — Placement Intelligence Agent
Uses the Groq LLM to predict the Aptitude/Online Assessment pattern
based on a target company JD (specifically for Indian campuses).
"""

import json
from openai import OpenAI
from config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL


ASSESSMENT_SYSTEM_PROMPT = """You are the Syrus Placement Intelligence Agent. Your goal is to predict the "Aptitude/Online Assessment" pattern for a company based on its Job Description and historical hiring data for Indian campuses.

### TASK:
1. Identify the company name from the JD.
2. Predict the assessment provider/pattern if it matches major Indian recruiters (e.g., TCS NQT, Infosys InfyTQ, AMCAT, CoCubes, or standard LeetCode-style rounds for Product companies).
3. Break down the likely sections of the test.

### OUTPUT FORMAT (JSON):
{
  "predicted_company": "Company Name",
  "assessment_tier": "e.g., Mass Recruiter / Product-Based / Startup",
  "test_pattern": {
    "provider": "Likely platform (e.g., 'Mettl', 'HackerRank')",
    "sections": [
      {
        "name": "e.g., Quantitative Aptitude",
        "difficulty": "Easy/Medium/Hard",
        "focus_topics": ["Time & Work", "Probability", "etc."]
      },
      {
        "name": "e.g., Coding",
        "difficulty": "e.g., 2 Easy DSA problems",
        "languages": ["C++", "Java", "Python"]
      }
    ]
  },
  "preparation_roadmap": "A 3-step priority list for the next 48 hours to clear the first round."
}

Only return valid JSON. No markdown fences, no extra text."""


def generate_assessment_prep(target_jd: str) -> dict:
    """
    Generate assessment prep pattern and roadmap.

    Args:
        target_jd: The job description text

    Returns:
        dict containing predicted company, sections, and roadmap
    """
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
    )

    user_prompt = f"""## INPUT DATA:
- TARGET_JD:
{target_jd}

Generate the assessment pattern prediction. Return valid JSON only."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=1500,
        response_format={"type": "json_object"},
    )

    result_text = response.choices[0].message.content
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "predicted_company": "Unknown",
            "assessment_tier": "Unknown",
            "test_pattern": {"provider": "Unknown", "sections": []},
            "preparation_roadmap": "Failed to generate roadmap.",
            "error": "Failed to parse LLM response",
            "raw_response": result_text,
        }
