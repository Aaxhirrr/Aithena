from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests
from server.config.gemini import gemini


router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    text: str


class Persona(BaseModel):
    name: str
    bio: Optional[str] = ""


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    personas: List[Persona]
    model: Optional[str] = None


@router.post("/chat")
def chat(req: ChatRequest):
    if not gemini.api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    personas_text = "\n".join([f"- {p.name}: {p.bio}" for p in req.personas])
    history_text = "\n".join([f"{m.role.upper()}: {m.text}" for m in req.messages])

    prompt = (
        "You are simulating a short group chat for students. Here are the personas.\n"
        f"Personas:\n{personas_text}\n\n"
        "RULES: Reply as exactly one persona each turn. Keep it friendly and concise (<= 2 sentences)."
        " Return strictly JSON: {\"name\": string, \"text\": string}. Do not add extra text.\n\n"
        f"History so far:\n{history_text}\n\n"
        "Now produce the next reply JSON."
    )

    model_name = req.model or gemini.model
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        + model_name
        + ":generateContent?key="
        + gemini.api_key
    )
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    resp = requests.post(url, json=body, timeout=30)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise HTTPException(status_code=500, detail="Gemini response parsing error")

    import json, re

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return {"name": req.personas[0].name if req.personas else "Student", "text": text}
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return {"name": req.personas[0].name if req.personas else "Student", "text": text}

