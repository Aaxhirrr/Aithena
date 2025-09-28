import { db } from '../services/firebase/config.js'
import { collection, getDocs } from 'firebase/firestore'

function scoreMatch(me, other, presenceById) {
  let score = 0
  const myCourses = new Set((me.courses || []).map((c) => c.toLowerCase()))
  const otherCourses = new Set((other.courses || []).map((c) => c.toLowerCase()))
  let overlap = 0
  for (const c of myCourses) if (otherCourses.has(c)) overlap++
  score += overlap * 30
  if (me.major && other.major && me.major.toLowerCase() === other.major.toLowerCase()) score += 20
  const p = presenceById?.[other.id]
  if (p && p.distanceKm != null) {
    // closer is better
    score += Math.max(0, 30 - Math.min(30, p.distanceKm * 10))
  }
  return score
}

export default function useMatching() {
  const findMatches = async ({ me, coords, radiusKm = 5 } = {}) => {
    try {
      const snap = await getDocs(collection(db, 'profiles'))
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const candidates = all.filter((p) => !me || p.id !== me.id)
      const presenceById = {} // Placeholder: wire to presence collection later
      const withScore = candidates.map((c) => ({ profile: c, score: scoreMatch(me || {}, c, presenceById) }))
      withScore.sort((a, b) => b.score - a.score)
      return withScore.map((x) => x.profile)
    } catch (e) {
      console.warn('Matching fallback (no Firestore)', e)
      return []
    }
  }
  return { findMatches }
}
