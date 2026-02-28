# System Architecture: Resume-Agent

## 1. Tech Stack
* **Frontend:** React.js (with Tailwind CSS for a calm, clean, non-purple UI).
* **Backend:** Python (FastAPI) - Ideal for handling asynchronous LLM requests, document parsing, and data processing.
* **Database:** Firebase - Relational structure is perfect for linking Users to multiple Master Resumes, JDs, and Generated Variants.
* **AI/LLM Layer:** Gemini API (or similar lightweight LLM) for text extraction, semantic matching, and bullet generation.

## 2. Data Models (Firebase)
* **Users:** `id`, `name`, `email`, `role` (student/tpo), `created_at`
* **Resumes:** `id`, `user_id`, `parsed_text` (JSON), `original_file_url`
* **JobDescriptions:** `id`, `url`, `raw_text`, `extracted_keywords` (JSON array)
* **Applications:** `id`, `user_id`, `resume_id`, `jd_id`, `before_score`, `after_score`, `suggested_bullets` (JSON)

## 3. Core System Components
* **Document Parser:** A Python service (using libraries like `PyMuPDF` or `pdfplumber`) to extract structured text from the student's uploaded PDF.
* **JD Scraper/Parser:** A utility to extract clean text from pasted URLs (handling Indian portals like Internshala, Naukri).
* **The Match Engine (LLM):** 1. Prompts the LLM with the Parsed Resume and the JD.
    2. Strict System Prompt: "You may ONLY rephrase existing experiences from the provided resume. Do not invent new skills or histories."
* **Scoring Algorithm:** A weighted keyword-matching function to calculate the "Before" and "After" ATS readiness percentage.

## 4. API Endpoints (REST)
* `POST /api/upload-resume` (Handles file, returns parsed JSON)
* `POST /api/analyze-jd` (Takes URL/Text, returns extracted requirements)
* `POST /api/generate-bullets` (Triggers the Honesty-First LLM flow)
* `GET /api/skill-gaps/{user_id}` (Aggregates missing keywords across user's recent JDs)