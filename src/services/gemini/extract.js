const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function extractTokensFromProfile(profile) {
  const body = { profile }
  const model = import.meta.env.VITE_GEMINI_MODEL
  if (model) body.model = model
  const resp = await fetch(`${API_BASE}/ai/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}

export default { extractTokensFromProfile }

