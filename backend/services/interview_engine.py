"""
Interview Engine Service — Deep-Dive Interview Prep Generator
Uses the Groq LLM to generate contextual ownership questions
that test whether a student actually built their project.
"""

import json
from openai import OpenAI
from config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL


INTERVIEW_SYSTEM_PROMPT = """You are a Senior Technical Interviewer specializing in entry-level engineering roles. You are reviewing a student's project to determine if they actually built it or just followed a tutorial.

### TASK:
Generate 5 "Deep-Dive" interview questions. These must NOT be general theory (e.g., "What is React?"). Instead, they must be "Contextual Ownership" questions that require the student to explain their specific implementation choices.

### QUESTION CATEGORIES (one question per category):
1. **Architectural Choice**: Why did they choose [Tech A] over [Tech B] for this specific project?
2. **Edge Case Handling**: How did they manage [Specific potential failure point related to the project]?
3. **Data/State Management**: Ask about the flow of data within their specific app structure.
4. **Optimization**: What would they change if the user base scaled by 100x?
5. **Conflict/Challenge**: A question about the hardest bug they faced in *this* specific tech stack.

### OUTPUT FORMAT (JSON):
Return a JSON object with this EXACT structure:
{
  "project_summary": "A 2-sentence technical summary of what was built.",
  "interview_prep": [
    {
      "category": "Architectural Choice | Edge Case Handling | Data/State Management | Optimization | Conflict/Challenge",
      "question": "The specific question text.",
      "intent": "What the interviewer is trying to uncover (e.g., 'Testing knowledge of asynchronous state management').",
      "hint_for_student": "A tip on how to frame their answer based on their resume facts."
    }
  ]
}

Only return valid JSON. No markdown fences, no extra text."""


def generate_interview_prep(project_title: str, project_description: str, tech_stack: list[str], github_url: str = None) -> dict:
    """
    Generate 5 deep-dive interview questions for a student's project.

    Args:
        project_title: Title of the project
        project_description: Full text description from the resume
        tech_stack: List of technologies used

    Returns:
        dict with project_summary and interview_prep array
    """
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
    )

    tech_stack_str = ", ".join(tech_stack) if tech_stack else "Not specified"
    github_str = f"\n- GITHUB_URL: {github_url}" if github_url else ""

    user_prompt = f"""## PROJECT DATA:
- PROJECT_TITLE: {project_title}
- PROJECT_DESCRIPTION: {project_description}
- TECH_STACK: {tech_stack_str}{github_str}

Generate 5 deep-dive "Contextual Ownership" interview questions for this project. Return valid JSON only."""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": INTERVIEW_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
        max_tokens=1500,
        response_format={"type": "json_object"},
    )

    result_text = response.choices[0].message.content
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "project_summary": "",
            "interview_prep": [],
            "error": "Failed to parse LLM response",
            "raw_response": result_text,
        }
