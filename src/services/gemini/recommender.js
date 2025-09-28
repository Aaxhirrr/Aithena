import { auth, db } from '../firebase/config.js'
import { doc, getDoc } from 'firebase/firestore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function fetchCourseRecommendationsForCurrentUser() {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')
  const ref = doc(db, 'profiles', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { courses: [], notes: 'No profile found' }
  const profile = snap.data()
  const courses = Array.isArray(profile.courses) ? profile.courses : String(profile.courses || '').split(',').map(s=>s.trim()).filter(Boolean)
  const body = { profile: { name: profile.name || '', major: profile.major || '', availability: profile.availability || '', bio: profile.bio || '', courses } }
  const model = import.meta.env.VITE_GEMINI_MODEL
  if (model) body.model = model
  const resp = await fetch(`${API_BASE}/ai/recommendations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}

export default { fetchCourseRecommendationsForCurrentUser }
