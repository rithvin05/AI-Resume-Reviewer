from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from src.utils import get_llm_resume_feedback

from typing import Dict
import uuid

FEEDBACK_QUEUE: Dict[str, dict] = {}

from src.utils import (
    extract_text_from_pdf,
    compute_keyword_match,
    count_action_verbs,
    count_quantified_experience,
    check_section_coverage,
    check_formatting_rules,
    validate_education,
)
# run with unix command: uvicorn src.main:app --reload

# Load environment variables from .env file
load_dotenv()



app = FastAPI()

# Configure CORS
# This allows requests from the specified origins to access our backend
originLink = os.getenv("FRONTEND_URL", "http://localhost:3000"),
origins = [
    originLink # Fallback to localhost if env var not set
]

app.add_middleware(
    CORSMiddleware,
    allow_origins={"*"},
    allow_credentials=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.get("/api/v1/hello")
async def hello():
    return {"message": "Hello, World!"}


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    contents = await file.read()
    resume_text = extract_text_from_pdf(contents)

    keyword_match_score = compute_keyword_match(resume_text, job_description)
    action_verb_count, total_bullet_points = count_action_verbs(resume_text)
    quantified_count, total_experiences = count_quantified_experience(resume_text)
    section_coverage = check_section_coverage(resume_text)
    formatting_score = check_formatting_rules(file.filename)
    education_match = validate_education(resume_text, job_description)

    normalized_action_verb_score = action_verb_count / total_bullet_points if total_bullet_points > 0 else 0
    normalized_quantified_score = quantified_count / total_experiences if total_experiences > 0 else 0

    final_score = (
        0.45 * keyword_match_score +
        0.2 * normalized_action_verb_score +
        0.2 * normalized_quantified_score +
        0.05 * section_coverage +
        0.1 * formatting_score
    )

    # Save inputs for feedback
    request_id = str(uuid.uuid4())
    FEEDBACK_QUEUE[request_id] = {
        "resume_text": resume_text,
        "job_description": job_description,
        "score": final_score,
        "keyword_score": keyword_match_score,
        "action_score": normalized_action_verb_score,
        "quantified_score": normalized_quantified_score,
        "formatting_score": formatting_score,
        "section_coverage": section_coverage
    }
    return {
        "request_id": request_id,
        "score": round(final_score * 100, 2),
        "education_warning": not education_match,
        "keyword_match_score": round(keyword_match_score * 100, 2),
        "action_verb_score": round(normalized_action_verb_score * 100, 2),
        "quantified_score": round(normalized_quantified_score * 100, 2),
        "formatting_score": round(formatting_score * 100, 2),
        "section_coverage": round(section_coverage * 100, 2),
    }

@app.get("/feedback/{request_id}")
async def get_feedback(request_id: str):
    if request_id not in FEEDBACK_QUEUE:
        return {"error": "Invalid or expired request"}

    data = FEEDBACK_QUEUE.pop(request_id)

    feedback = get_llm_resume_feedback(
        resume_text=data["resume_text"],
        job_description=data["job_description"],
        score=data["score"],
        keyword_score=data["keyword_score"],
        action_score=data["action_score"],
        quantified_score=data["quantified_score"],
        formatting_score=data["formatting_score"],
        section_coverage=data["section_coverage"]
    )

    return {"llm_feedback": feedback}
