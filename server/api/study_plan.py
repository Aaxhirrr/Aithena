from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json, re, requests
from server.config.gemini import gemini


router = APIRouter()


class Student(BaseModel):
    name: Optional[str] = None
    major: Optional[str] = None
    availability: Optional[str] = None
    courses: Optional[List[str] | str] = None
    bio: Optional[str] = None


class StudyPlanRequest(BaseModel):
    you: Optional[Student] = None
    partner: Optional[Student] = None
    course: Optional[str] = None
    duration: int = 45
    model: Optional[str] = None


@router.post('/study-plan')
def study_plan(req: StudyPlanRequest):
    # Fallback plan in case model is not configured or fails
    def fallback_plan():
        dur = max(30, min(90, req.duration or 45))
        blocks = [
            {"start": 0, "end": 5, "title": "Set goals", "desc": "Define 2–3 outcomes and pick topics."},
            {"start": 5, "end": 20, "title": "Focus block 1", "desc": "Work problems and compare approaches."},
            {"start": 20, "end": 25, "title": "Break", "desc": "Rest, stretch, hydrate."},
            {"start": 25, "end": 40, "title": "Focus block 2", "desc": "Discuss tricky concepts and summarize."},
            {"start": 40, "end": 45, "title": "Wrap-up", "desc": "Agree on next steps and resources."},
        ]
        # Scale slightly if duration differs from 45
        if dur != 45:
            scale = dur / 45.0
            blocks = [
                {**b, "start": int(round(b["start"] * scale)), "end": int(round(b["end"] * scale))}
                for b in blocks
            ]
        return {
            "course": req.course or "your course",
            "duration": dur,
            "blocks": blocks,
            "notes": "This is a suggested structure. Adjust as needed.",
            "status": "draft",
        }

    if not gemini.api_key:
        return {"plan": fallback_plan(), "model_used": None}

    # Construct prompt
    def fmt_student(prefix: str, s: Optional[Student]):
        if not s:
            return f"{prefix}: (unknown)"
        courses = s.courses if isinstance(s.courses, list) else (str(s.courses).split(',') if s.courses else [])
        courses = ", ".join([str(c).strip() for c in courses if str(c).strip()])
        return (
            f"{prefix}: name={s.name or '-'}; major={s.major or '-'}; availability={s.availability or '-'};"
            f" courses={courses or '-'}; bio={s.bio or '-'}"
        )

    course = req.course or "the selected course"
    duration = max(30, min(90, req.duration or 45))
    context = "\n".join([
        fmt_student("YOU", req.you),
        fmt_student("PARTNER", req.partner),
        f"COURSE: {course}",
        f"DURATION_MIN: {duration}",
    ])

    prompt = (
        "Design a collaborative study session plan we can propose for approval. "
        "Use short, clear blocks with minute ranges. Include a quick break and a wrap-up. "
        "Return STRICT JSON with shape: {\"course\": string, \"duration\": number, \"blocks\": [ {\"start\": number, \"end\": number, \"title\": string, \"desc\": string } ], \"notes\": string, \"status\": \"draft\" }.\n\n"
        + context
    )

    model_name = req.model or gemini.model
    url = (
        'https://generativelanguage.googleapis.com/v1beta/models/'
        + model_name + ':generateContent?key=' + gemini.api_key
    )
    body = { 'contents': [{ 'parts': [{ 'text': prompt }] }] }

    try:
        resp = requests.post(url, json=body, timeout=20)
        if resp.status_code == 200:
            data = resp.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            m = re.search(r"\{[\s\S]*\}", text)
            if m:
                parsed = json.loads(m.group(0))
                # Basic validation
                if isinstance(parsed.get('blocks'), list):
                    return {"plan": parsed, "model_used": model_name}
    except Exception:
        pass

    return {"plan": fallback_plan(), "model_used": None}

