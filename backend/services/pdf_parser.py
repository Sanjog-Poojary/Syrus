"""
PDF Parser Service
Extracts structured text from uploaded PDF resumes using PyMuPDF.
"""

import fitz  # PyMuPDF
import re
from typing import Optional


def extract_text_from_pdf(file_bytes: bytes) -> dict:
    """
    Parse a PDF file and return structured resume sections.

    Returns:
        dict with keys: raw_text, sections (dict of heading -> content),
        contact_info, word_count
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    raw_text = ""

    for page in doc:
        text = page.get_text("text")
        pages.append(text)
        raw_text += text + "\n"

    doc.close()

    # Clean up whitespace
    raw_text = re.sub(r'\n{3,}', '\n\n', raw_text).strip()

    # Attempt to extract sections by common resume headings
    sections = _extract_sections(raw_text)

    # Extract contact info (basic heuristic)
    contact_info = _extract_contact_info(raw_text)

    return {
        "raw_text": raw_text,
        "sections": sections,
        "contact_info": contact_info,
        "word_count": len(raw_text.split()),
        "page_count": len(pages),
    }


def _extract_sections(text: str) -> dict:
    """
    Heuristically split resume text into named sections.
    Looks for common headings like Education, Experience, Projects, Skills.
    """
    heading_patterns = [
        r'(?i)\b(education)\b',
        r'(?i)\b(experience|work\s*experience|professional\s*experience)\b',
        r'(?i)\b(projects|personal\s*projects|academic\s*projects)\b',
        r'(?i)\b(skills|technical\s*skills|core\s*competencies)\b',
        r'(?i)\b(certifications?|certificates?)\b',
        r'(?i)\b(achievements?|awards?|honors?)\b',
        r'(?i)\b(summary|objective|profile)\b',
        r'(?i)\b(extracurricular|activities|volunteering)\b',
    ]

    # Normalize heading names
    heading_map = {
        'education': 'Education',
        'experience': 'Experience',
        'work experience': 'Experience',
        'professional experience': 'Experience',
        'projects': 'Projects',
        'personal projects': 'Projects',
        'academic projects': 'Projects',
        'skills': 'Skills',
        'technical skills': 'Skills',
        'core competencies': 'Skills',
        'certifications': 'Certifications',
        'certificates': 'Certifications',
        'certification': 'Certifications',
        'certificate': 'Certifications',
        'achievements': 'Achievements',
        'awards': 'Achievements',
        'honors': 'Achievements',
        'achievement': 'Achievements',
        'award': 'Achievements',
        'honor': 'Achievements',
        'summary': 'Summary',
        'objective': 'Summary',
        'profile': 'Summary',
        'extracurricular': 'Activities',
        'activities': 'Activities',
        'volunteering': 'Activities',
    }

    lines = text.split('\n')
    sections = {}
    current_section = "Header"
    current_content = []

    for line in lines:
        matched = False
        for pattern in heading_patterns:
            match = re.search(pattern, line.strip())
            if match and len(line.strip().split()) <= 5:
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                # Start new section
                raw_heading = match.group(1).lower().strip()
                current_section = heading_map.get(raw_heading, raw_heading.title())
                current_content = []
                matched = True
                break

        if not matched:
            current_content.append(line)

    # Save last section
    if current_content:
        sections[current_section] = '\n'.join(current_content).strip()

    return sections


def _extract_contact_info(text: str) -> dict:
    """Extract email, phone, and LinkedIn from resume text."""
    info: dict = {}

    # Email
    email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
    if email_match:
        info['email'] = email_match.group()

    # Phone (Indian/International formats)
    phone_match = re.search(
        r'(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}',
        text
    )
    if phone_match:
        info['phone'] = phone_match.group().strip()

    # LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text, re.IGNORECASE)
    if linkedin_match:
        info['linkedin'] = linkedin_match.group()

    # GitHub
    github_match = re.search(r'github\.com/[\w-]+', text, re.IGNORECASE)
    if github_match:
        info['github'] = github_match.group()

    return info
