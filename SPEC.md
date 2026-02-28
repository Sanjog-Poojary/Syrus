# Product Specification: Resume-Agent (Campus Placement Edition)

## 1. Overview
A web application designed specifically for college students navigating campus placements. It bridges the gap between generic student resumes and highly specific Job Descriptions (JDs) by utilizing an "Honesty-First" AI approach. It translates existing student experiences (projects, hackathons, coursework) into the specific language required by applicant tracking systems (ATS).

## 2. Target Audience
* Primary: College students in India applying for internships and entry-level campus placements.
* Secondary: Training & Placement Officers (TPOs) tracking batch readiness.

## 3. Core Problems Solved
* Students use one generic resume for 50 different roles, failing ATS checks.
* Existing tools are built for executives with 5+ years of experience, not students with sparse histories.
* Existing AI tools hallucinate fake experience (resume fraud).

## 4. Key Features & User Flows
* **The "Honesty-First" Engine:** User uploads a Master Resume (PDF/Docx) and pastes a Job Link/JD. The AI parses the resume, analyzes the JD, and suggests 3 specific, honest bullet point rewrites based *only* on the student's actual parsed experience.
* **Batch Mode Application:** Users can paste up to 5 JD links at once. The system generates customized resume variants for each, ranked by baseline match score.
* **Skill Gap Roadmap:** If a user consistently misses keywords across multiple JDs (e.g., targeting "Data Analyst" but missing "SQL"), the system flags the gap and suggests free resources to learn it.
* **TPO Dashboard (B2B2C):** A separate view where TPOs can monitor the aggregate ATS-readiness of the student cohort and push relevant JDs directly to qualified students.
* **Mock ATS Simulator:** Visual "Before vs. After" scoring, simulating how platforms like Naukri or Greenhouse parse the document.

## 5. Design & UX Guidelines
* **Aesthetic:** Clean, minimalist, and calm. Strictly non-purple color palette. High contrast for readability.
* **Focus:** Fast upload-to-result pipeline. The user should get actionable bullet points within 10 seconds of uploading.