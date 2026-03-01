"""
Rewrite Engine Service — Honesty-First Bullet Point Optimizer
Uses the Groq LLM to rewrite a specific resume experience for a target JD,
with strict zero-hallucination constraints.
"""

import json
from openai import OpenAI
from config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL


REWRITE_SYSTEM_PROMPT = """You are the Syrus "Honesty-First" Rewrite Engine. Your goal is to optimize a student's resume bullet point for a specific Job Description (JD) without ever inventing new information.

### STRICT CONSTRAINTS:
- Use keywords from the TARGET_JOB_DESCRIPTION only if they accurately describe the MASTER_RESUME_TEXT.
- DO NOT invent technologies, tools, or metrics not present in the original text.
- If a JD requires "SQL" and the resume only mentions "Excel," you MAY NOT add "SQL."
- You MUST base your rewrite ONLY on information found in the MASTER_RESUME_TEXT.
- The optimized bullet should follow the XYZ formula: "Accomplished [X] by doing [Y], resulting in [Z]"
- Keep it concise, ATS-friendly, and under 30 words.

### OUTPUT FORMAT (JSON):
Return a JSON object with this EXACT structure:
{
  "optimized_bullet": "The new, ATS-friendly bullet point.",
  "original_source_snippet": "The exact sentence or phrase from the Master Resume used as the foundation.",
  "mapping_logic": "A brief explanation of why this rewrite is honest (e.g., 'Translated \"built a website\" to \"developed a responsive web application\" using the same tech stack mentioned').",
  "honesty_check": "Pass or Fail based on zero-hallucination policy."
}

Only return valid JSON. No markdown fences, no extra text."""


def rewrite_bullet(master_resume_text: str, target_jd: str, target_experience: str) -> dict:
    """
    Rewrite a specific experience bullet for a target JD using the Honesty-First engine.

    Args:
        master_resume_text: The FULL text of the student's master resume (for context/verification).
        target_jd: The job description requirements.
        target_experience: The specific project or work experience to be rewritten.

    Returns:
        dict with optimized_bullet, original_source_snippet, mapping_logic, honesty_check
    """
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
    )

    user_prompt = f"""## MASTER_RESUME_TEXT (full student resume for context):
{master_resume_text}

## TARGET_JOB_DESCRIPTION:
{target_jd}

## TARGET_EXPERIENCE (the specific bullet/experience to rewrite):
{target_experience}

Rewrite the TARGET_EXPERIENCE for this JD. Use the full MASTER_RESUME_TEXT as context to verify honesty. Return valid JSON only."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": REWRITE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=800,
        response_format={"type": "json_object"},
    )

    result_text = response.choices[0].message.content
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "optimized_bullet": "",
            "original_source_snippet": "",
            "mapping_logic": "",
            "honesty_check": "Fail",
            "error": "Failed to parse LLM response",
            "raw_response": result_text,
        }
