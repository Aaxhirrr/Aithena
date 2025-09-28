from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re, json
import requests
from server.config.gemini import gemini


router = APIRouter()


class ExtractProfile(BaseModel):
    courses: Optional[List[str] | str] = None
    bio: Optional[str] = None
    major: Optional[str] = None


class ExtractRequest(BaseModel):
    profile: Optional[ExtractProfile] = None
    text: Optional[str] = None
    model: Optional[str] = None


def _fallback_tokens(text: str) -> List[str]:
    if not text:
        return []
    t = text.upper()
    tokens = set()
    # course codes like CSE230, CSE 230, BIO 340
    for m in re.findall(r"\b([A-Z]{2,4})\s?-?\s?(\d{2,3})\b", t):
        tokens.add(f"{m[0]} {m[1]}")
        tokens.add(f"{m[0]}{m[1]}")
        tokens.add(m[0])
    # subjects like BIO, ECN, CSE
    for m in re.findall(r"\b(BIO|BIOL|BIOLOGY|ECN|ECON|ECONOMICS|CSE|CS|EE|EEE|MAT|MATH|PSY|PSYCH)\b", t):
        tokens.add(m)
    return list(sorted(tokens))


@router.post("/extract")
def extract(req: ExtractRequest):
    text_parts = []
    if req.text:
        text_parts.append(req.text)
    if req.profile:
        if req.profile.major:
            text_parts.append(f"MAJOR: {req.profile.major}")
        if req.profile.bio:
            text_parts.append(f"BIO: {req.profile.bio}")
        if req.profile.courses:
            if isinstance(req.profile.courses, list):
                text_parts.append("COURSES: " + ", ".join(req.profile.courses))
            else:
                text_parts.append("COURSES: " + str(req.profile.courses))
    all_text = "\n".join(text_parts)

    # Try Gemini if configured
    if gemini.api_key:
        model_name = req.model or gemini.model
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            + model_name
            + ":generateContent?key="
            + gemini.api_key
        )
        prompt = (
            "Extract normalized course/subject tokens from the user text. "
            "Prefer uppercase abbreviations like CSE, BIO, ECN and explicit codes like 'CSE 230'. "
            "Return strictly JSON: {\"tokens\": [string]}.\n\nTEXT:\n" + all_text
        )
        body = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(url, json=body, timeout=20)
        if resp.status_code == 200:
            data = resp.json()
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                m = re.search(r"\{[\s\S]*\}", text)
                if m:
                    parsed = json.loads(m.group(0))
                    toks = parsed.get("tokens", [])
                    if isinstance(toks, list) and toks:
                        # Normalize
                        uniq = []
                        seen = set()
                        for t in toks:
                            u = str(t).strip().upper()
                            if u and u not in seen:
                                seen.add(u)
                                uniq.append(u)
                        return {"tokens": uniq, "model_used": model_name}
            except Exception:
                pass

    # Fallback regex
    toks = _fallback_tokens(all_text)
    return {"tokens": toks}

