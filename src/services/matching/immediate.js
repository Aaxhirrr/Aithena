import { auth, db } from '../firebase/config.js'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const CAMPUS_COORD = { lat: 33.4242, lng: -111.9281 }

function toKm(meters) { return meters / 1000 }
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function score(me, other, distanceKm) {
  let s = 0
  const myCourses = new Set((me.courses || []).map((c) => (c || '').toLowerCase()))
  const theirCourses = new Set((other.courses || []).map((c) => (c || '').toLowerCase()))
  let overlap = 0
  for (const c of myCourses) if (theirCourses.has(c)) overlap++
  s += overlap * 40
  if ((me.major || '').toLowerCase() === (other.major || '').toLowerCase()) s += 20
  if (Number.isFinite(distanceKm)) s += Math.max(0, 30 - Math.min(30, distanceKm * 6))
  return s
}

export async function getImmediateRecommendations({ radiusKm = 2, onlineWindowMins = 5 } = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')

  // Load my profile
  const meSnap = await getDoc(doc(db, 'profiles', user.uid))
  const me = meSnap.exists() ? meSnap.data() : { courses: [], major: '' }

  // Get my coordinates
  const coords = await new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(CAMPUS_COORD)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(CAMPUS_COORD),
      { enableHighAccuracy: true, timeout: 4000 }
    )
  })

  // Read presence and filter
  const presSnap = await getDocs(query(collection(db, 'presence'), where('discoverable', '==', true)))
  const now = Date.now()
  const present = presSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => {
      const t = p.updatedAt?.toMillis?.() ?? 0
      return now - t <= onlineWindowMins * 60 * 1000
    })

  // Fetch profiles for those users
  const results = []
  for (const p of present) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue
    const dist = haversine(coords.lat, coords.lng, p.lat, p.lng)
    if (dist > radiusKm) continue
    const profSnap = await getDoc(doc(db, 'profiles', p.id))
    if (!profSnap.exists()) continue
    const prof = { id: p.id, ...profSnap.data() }
    const sc = score(me, prof, dist)
    results.push({ profile: prof, distanceKm: dist, score: sc })
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

export default { getImmediateRecommendations }

