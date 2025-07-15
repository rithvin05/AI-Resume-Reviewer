import fitz  # PyMuPDF
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

from dotenv import load_dotenv
import os


load_dotenv()
# print("✅ DEBUG: Loaded OPENAI_API_KEY =", os.getenv("OPENAI_API_KEY"))


ACTION_VERBS = set([
    "accept", "accepted", "accomplish", "accomplished", "account", "accounted", "accumulate", "accumulated",
    "achieve", "achieved", "acknowledge", "acknowledged", "acquire", "acquired", "activate", "activated",
    "act", "acted", "adapt", "adapted", "add", "added", "adhere", "adhered", "adjust", "adjusted", "administer",
    "administered", "admit", "admitted", "adopt", "adopted", "advance", "advanced", "advise", "advised",
    "advocate", "advocated", "affirm", "affirmed", "affix", "affixed", "aid", "aided", "align", "aligned",
    "allocate", "allocated", "allot", "allotted", "alter", "altered", "amend", "amended", "analyze", "analyzed",
    "anticipate", "anticipated", "answer", "answered", "apply", "applied", "appoint", "appointed", "appraise",
    "appraised", "appropriate", "appropriated", "approve", "approved", "arbitrate", "arbitrated", "arrange",
    "arranged", "articulate", "articulated", "ascertain", "ascertained", "assemble", "assembled", "assert",
    "asserted", "assess", "assessed", "assign", "assigned", "assume", "assumed", "assure", "assured", "attach",
    "attached", "attain", "attained", "attend", "attended", "audit", "audited", "authorize", "authorized",
    "avert", "averted", "award", "awarded", "balance", "balanced", "batch", "batched", "budget", "budgeted",
    "build", "built", "calculate", "calculated", "calibrate", "calibrated", "call", "called", "cancel", "cancelled",
    "capitalize", "capitalized", "carry", "carried", "categorize", "categorized", "certify", "certified",
    "chart", "charted", "check", "checked", "circulate", "circulated", "clarify", "clarified", "classify",
    "classified", "clean", "cleaned", "climb", "climbed", "close", "closed", "coach", "coached", "code",
    "coded", "collaborate", "collaborated", "collate", "collated", "collect", "collected", "command",
    "commanded", "communicate", "communicated", "compare", "compared", "compile", "compiled", "complete",
    "completed", "comply", "complied", "compose", "composed", "comprehend", "comprehended", "compute",
    "computed", "conduct", "conducted", "confirm", "confirmed", "consolidate", "consolidated", "construct",
    "constructed", "consult", "consulted", "contribute", "contributed", "control", "controlled", "convert",
    "converted", "coordinate", "coordinated", "copy", "copied", "correct", "corrected", "counsel", "counseled",
    "create", "created", "debug", "debugged", "decide", "decided", "delegate", "delegated", "delete", "deleted",
    "deliver", "delivered", "demonstrate", "demonstrated", "design", "designed", "determine", "determined",
    "develop", "developed", "devise", "devised", "direct", "directed", "document", "documented", "draft",
    "drafted", "edit", "edited", "effect", "effected", "eliminate", "eliminated", "emphasize", "emphasized",
    "employ", "employed", "enable", "enabled", "encourage", "encouraged", "engineer", "engineered", "enhance",
    "enhanced", "evaluate", "evaluated", "examine", "examined", "execute", "executed", "expand", "expanded",
    "facilitate", "facilitated", "forecast", "forecasted", "formulate", "formulated", "generate", "generated",
    "implement", "implemented", "improve", "improved", "increase", "increased", "integrate", "integrated",
    "lead", "led", "launch", "launched", "manage", "managed", "optimize", "optimized", "organize", "organized",
    "oversee", "oversaw", "present", "presented", "resolve", "resolved", "streamline", "streamlined",
    "supervise", "supervised", "train", "trained", "write", "wrote"
])

def extract_text_from_pdf(contents: bytes) -> str:
    with fitz.open(stream=io.BytesIO(contents), filetype="pdf") as doc:
        return "\n".join(page.get_text() for page in doc)

def compute_keyword_match(resume: str, job: str) -> float:
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([resume, job])
    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return round(score, 3)

def count_action_verbs(resume: str) -> tuple[int, int]:
    bullets = [line.strip() for line in resume.splitlines() if line.strip().startswith(("-", "•", "*"))]
    count = 0
    for bullet in bullets:
        normalized = bullet.lstrip("•-* ").strip()
        first_word = normalized.split()[0].lower() if normalized else ""
        if first_word in ACTION_VERBS:
            count += 1
    return count, len(bullets)

def count_quantified_experience(resume: str) -> tuple[int, int]:
    bullets = [line.strip() for line in resume.splitlines() if line.strip().startswith(("-", "•", "*"))]
    quantified = sum(1 for bullet in bullets if re.search(r"\b[\d%$]+\b", bullet))
    return quantified, len(bullets)

def check_section_coverage(resume: str) -> float:
    required_sections = ["education", "experience", "skills"]
    found = sum(1 for section in required_sections if section in resume.lower())
    return found / len(required_sections)

def check_formatting_rules(resume_text: str) -> float:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]

    capitalized = sum(1 for line in lines if line[0].isupper())
    cap_score = capitalized / len(lines) if lines else 1

    long_lines = sum(1 for line in lines if len(line) > 120)
    length_score = 1 - (long_lines / len(lines)) if lines else 1

    final_score = (0.6 * cap_score + 0.4 * length_score)
    return round(final_score, 3)

def validate_education(resume: str, job: str) -> bool:
    job_lower = job.lower()

    resume_lower = resume.lower()

    if "bachelor" in job_lower or "b.s." in job_lower:
        return "bachelor" in resume_lower or "b.s." in resume_lower
    if "master" in job_lower or "m.s." in job_lower:
        return "master" in resume_lower or "m.s." in resume_lower
    if "ph.d" in job_lower or "phd" in job_lower:
        return "ph.d" in resume_lower or "phd" in resume_lower or "doctor" in resume_lower

    return True  


from openai import OpenAI
import os

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    # api_key=os.getenv("OPENAI_API_KEY"),
)

def get_llm_resume_feedback(resume_text: str, job_description: str, score: float, keyword_score: float,
                            action_score: float, quantified_score: float, formatting_score: float,
                            section_coverage: float) -> str:
    messages = [
        {
            "role": "system",
            "content": "You are a professional resume reviewer. Based on the user's resume, job description, and evaluation scores, give tailored, constructive feedback to help improve the resume."
        },
        {
            "role": "user",
            "content": f"""
Here is a resume and job description, along with its automated evaluation scores.

------------------------
📄 Resume Text:
\"\"\"
{resume_text[:3000]}
\"\"\"

📝 Job Description:
\"\"\"
{job_description[:3000]}
\"\"\"

📊 Evaluation Scores:
- Final Score: {round(score * 100, 2)} / 100
- Keyword Match Score: {round(keyword_score * 100, 2)}%
- Action Verb Score: {round(action_score * 100, 2)}%
- Quantified Experience Score: {round(quantified_score * 100, 2)}%
- Formatting Score: {round(formatting_score * 100, 2)}%
- Section Coverage Score: {round(section_coverage * 100, 2)}%

🎯 Instructions:
Please give:
1. A short summary of how well this resume fits the job.
2. 3 clear improvement suggestions (bullet points).
3. Optionally, a suggested new resume title.
"""
        }
    ]

    response = client.chat.completions.create(
        model="qwen/qwen3-32b:free",
        messages=messages,
    )

    return response.choices[0].message.content
