from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import json, random, re, requests
from server.config.gemini import gemini


router = APIRouter()


class InviteProfile(BaseModel):
  courses: Optional[List[str] | str] = None
  bio: Optional[str] = None
  major: Optional[str] = None


class InviteRequest(BaseModel):
  profile: Optional[InviteProfile] = None
  count: int = 5
  model: Optional[str] = None


def _fallback_tokens(text: str) -> List[str]:
  if not text:
    return []
  t = text.upper()
  tokens = set()
  for m in re.findall(r"\b([A-Z]{2,4})\s?-?\s?(\d{2,3})\b", t):
    tokens.add(f"{m[0]} {m[1]}")
    tokens.add(f"{m[0]}{m[1]}")
    tokens.add(m[0])
  for m in re.findall(r"\b(BIO|BIOL|ECN|ECON|CSE|CS|EE|EEE|MAT|MATH|PSY|PSYCH)\b", t):
    tokens.add(m)
  return list(sorted(tokens))


def load_students() -> List[dict]:
  root = Path(__file__).resolve().parents[2]
  fpath = root / 'src' / 'data' / 'students.json'
  if not fpath.exists():
    return []
  with fpath.open('r', encoding='utf-8') as f:
    return json.load(f)


@router.post('/invites')
def invites(req: InviteRequest):
  students = load_students()
  if not students:
    raise HTTPException(status_code=500, detail='students.json not found')

  # Collect text
  text_parts = []
  if req.profile:
    if req.profile.major:
      text_parts.append(str(req.profile.major))
    if req.profile.bio:
      text_parts.append(str(req.profile.bio))
    if req.profile.courses:
      text_parts.append(','.join(req.profile.courses) if isinstance(req.profile.courses, list) else str(req.profile.courses))
  all_text = '\n'.join(text_parts)

  # Extract tokens locally (keeps it robust even if model fails)
  tokens = _fallback_tokens(all_text)

  # Filter by tokens if any
  pool = students
  if tokens:
    up = [t.replace(' ', '') for t in tokens]
    def match(s):
      cs = [(c or '').upper().replace(' ', '') for c in (s.get('courses') or [])]
      return any(any(u in c or c.startswith(u) for c in cs) for u in up)
    pool = [s for s in students if match(s)] or students

  random.shuffle(pool)
  selected = pool[: max(1, min(req.count, 6))]

  # Ask Gemini to craft short one-liner invites for the selected students
  messages = {}
  if gemini.api_key:
    model_name = req.model or gemini.model
    names_blob = '\n'.join([f"- {s['name']} (courses: {', '.join(s.get('courses', []))})" for s in selected])
    prompt = (
      'Write a short, friendly one-line invite for each student below to study together. '
      'Do NOT include anyone\'s name in the message — keep it generic. '
      "Start with 'Hey' (no name), then the invite. Keep it casual (<= 12 words). "
      'Return strictly JSON array of {"name": string, "text": string}.\n\n'
      f'Students:\n{names_blob}'
    )
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
        m = re.search(r"\[[\s\S]*\]", text)
        if m:
          arr = json.loads(m.group(0))
          for it in arr:
            n = str(it.get('name','')).strip()
            t = str(it.get('text','')).strip()
            if n and t:
              def _sanitize(msg: str) -> str:
                s = msg.strip()
                # Collapse greeting with name like "Hey Oscar," -> "Hey, "
                s = re.sub(r'^(hey|hi|hello)\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*[,!]?\s*', lambda m: m.group(1).capitalize() + ', ', s, flags=re.I)
                # Remove starting bare name like "Oscar," or "Oscar Butler,"
                s = re.sub(r'^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*[,!]?\s*', '', s)
                # Ensure generic Hey at start
                if not re.match(r'^(Hey|Hi|Hello)\b', s):
                  s = 'Hey, ' + s
                s = re.sub(r'^(hey|hi|hello)[^a-zA-Z0-9]*', 'Hey, ', s, flags=re.I)
                return s.strip()
              messages[n] = _sanitize(t)
    except Exception:
      pass

  invites = []
  for s in selected:
    invites.append({
      'id': s.get('id'),
      'name': s.get('name'),
      'photo': s.get('photo'),
      'major': s.get('major'),
      'courses': s.get('courses', []),
      'message': messages.get(s.get('name'), 'Hey, want to study together later today?'),
    })

  return { 'invites': invites }
