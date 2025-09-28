const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function chatWithPersonas({ messages, personas, model }) {
  const body = { messages, personas }
  if (model) body.model = model
  const resp = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}

export default { chatWithPersonas }

