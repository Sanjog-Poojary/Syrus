"""
Roadmap Engine Service — Career Roadmap Architect
Uses the Groq LLM to identify critical skill gaps and suggest
high-quality, free learning resources (prioritizing Indian platforms).
"""

import json
from openai import OpenAI
from config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL


ROADMAP_SYSTEM_PROMPT = """You are the Syrus Career Roadmap Architect. Your task is to identify critical skill gaps between a student's Master Resume and a set of Target Job Descriptions.

### TASK:
1. Identify "Hard Skills" (languages, tools, frameworks) frequently mentioned in the JDs but missing from the resume.
2. For each major gap, suggest 2-3 high-quality, free learning resources. 
3. Prioritize resources recognized in India: NPTEL, Coursera (Financial Aid), and specific high-authority YouTube playlists (e.g., "CodeWithHarry" for Python, "Striver" for DSA).

### OUTPUT FORMAT (JSON):
{
  "identified_gaps": [
    {
      "skill": "Name of the missing skill (e.g., 'SQL')",
      "frequency": "How many JDs required this (e.g., '3/5')",
      "impact_score": "Scale 1-10 on how critical this is for the target roles.",
      "learning_path": [
        {
          "resource_name": "Name of course/playlist",
          "provider": "e.g., NPTEL / YouTube",
          "link_placeholder": "Direct link or search query for the resource",
          "estimated_time": "Time to gain basic proficiency"
        }
      ]
    }
  ],
  "overall_readiness_summary": "A brief encouraging note on the student's current standing."
}

Only return valid JSON. No markdown fences, no extra text."""


def generate_career_roadmap(master_resume_text: str, target_jds: str) -> dict:
    """
    Generate a career roadmap indicating skill gaps and learning resources.

    Args:
        master_resume_text: The full parsed text of the student's resume
        target_jds: The target job description(s)

    Returns:
        dict containing identified_gaps and overall_readiness_summary
    """
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
    )

    user_prompt = f"""## INPUT DATA:
1. MASTER_RESUME_TEXT:
{master_resume_text}

2. TARGET_JDS:
{target_jds}

Generate the career roadmap and skill gap analysis. Return valid JSON only."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": ROADMAP_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    result_text = response.choices[0].message.content
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "identified_gaps": [],
            "overall_readiness_summary": "Failed to parse analysis results.",
            "error": "Failed to parse LLM response",
            "raw_response": result_text,
        }
