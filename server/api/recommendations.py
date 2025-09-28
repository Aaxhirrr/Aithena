from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests
from server.config.gemini import gemini


router = APIRouter()


class Profile(BaseModel):
    name: Optional[str] = None
    major: Optional[str] = None
    courses: List[str] = []
    availability: Optional[str] = None
    bio: Optional[str] = None


class RecommendationRequest(BaseModel):
    profile: Profile
    model: Optional[str] = None


@router.post("/recommendations")
def recommend(req: RecommendationRequest):
    if not gemini.api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server")

    courses = [c.strip() for c in (req.profile.courses or []) if c.strip()]
    if not courses:
        return {"courses": [], "notes": "No courses found in profile"}

    prompt = (
        "You are a study-planning assistant. Given a list of course codes and a short profile, "
        "return only targeted study recommendations for each course. Respond strictly in JSON with this schema: "
        "{\"courses\":[{\"course\":string,\"recommendations\":[string]}]} without extra text.\n\n"
        f"Profile: name={req.profile.name or ''}, major={req.profile.major or ''}, "
        f"availability={req.profile.availability or ''}, bio={req.profile.bio or ''}.\n"
        f"Courses: {', '.join(courses)}."
    )

    def call_model(model_name: str):
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            + model_name
            + ":generateContent?key="
            + gemini.api_key
        )
        body = {"contents": [{"parts": [{"text": prompt}]}]}
        return requests.post(url, json=body, timeout=30)

    tried = []
    best_error = None
    for model_name in [req.model or gemini.model, "gemini-2.0-flash", "gemini-1.5-flash"]:
        if model_name in tried:
            continue
        tried.append(model_name)
        resp = call_model(model_name)
        if resp.status_code == 200:
            data = resp.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception:
                continue
            import json, re
            match = re.search(r"\{[\s\S]*\}", text)
            if not match:
                return {"raw": text, "model_used": model_name}
            try:
                parsed = json.loads(match.group(0))
                parsed["model_used"] = model_name
                return parsed
            except json.JSONDecodeError:
                return {"raw": text, "model_used": model_name}
        else:
            best_error = resp

    # If all attempts failed, bubble up last error
    if best_error is not None:
        raise HTTPException(status_code=best_error.status_code, detail=best_error.text)
    raise HTTPException(status_code=500, detail="Gemini request failed for all models tried")

