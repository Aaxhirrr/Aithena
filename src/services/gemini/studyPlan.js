const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function requestStudyPlan({ you, partner, course, duration = 45 }) {
  const body = { you, partner, course, duration }
  const model = import.meta.env.VITE_GEMINI_MODEL
  if (model) body.model = model
  const resp = await fetch(`${API_BASE}/ai/study-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}

export default { requestStudyPlan }

