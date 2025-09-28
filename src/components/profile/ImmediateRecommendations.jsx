import React, { useState } from 'react'
import { auth, db } from '../../services/firebase/config.js'
import { doc, getDoc } from 'firebase/firestore'
import students from '../../data/students.json'
import extractor from '../../services/gemini/extract.js'

export default function ImmediateRecommendations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [radius, setRadius] = useState(2)
  const [invited, setInvited] = useState({})

  const run = async () => {
    setLoading(true); setError('')
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not signed in')
      const snap = await getDoc(doc(db, 'profiles', user.uid))
      const prof = snap.exists() ? snap.data() : {}

      // Ask Gemini to extract tokens (course codes / subjects) from profile
      let tokens = []
      try {
        const ex = await extractor.extractTokensFromProfile({
          courses: prof.courses || '',
          bio: prof.bio || '',
          major: prof.major || '',
        })
        tokens = (ex.tokens || []).map((t) => String(t).toUpperCase())
      } catch {}

      const myAvail = String(prof.availability || '').toLowerCase()

      let results = students.map((s) => {
        const normalized = (s.courses || []).map((c) => String(c).toUpperCase().replace(/\s+/g, ''))
        let score = 0
        for (const T of tokens) {
          const t = T.replace(/\s+/g, '')
          if (!t) continue
          if (normalized.some((c) => c.includes(t))) score += 40
          if (t.length >= 3 && normalized.some((c) => c.startsWith(t))) score += 20
        }
        if (myAvail && String(s.availability || '').toLowerCase() === myAvail) score += 10
        return { profile: s, distanceKm: 0.5, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

      if (!results.length) {
        // Demo fallback: take top by compatibility/major so you always see something
        results = students
          .map((s) => {
            let score = (s.compatibility || 80) / 5
            if ((prof.major || '').toLowerCase() === String(s.major || '').toLowerCase()) score += 20
            return { profile: s, distanceKm: 0.7, score }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
      }

      setItems(results)
      if (!results.length) setError('No strong matches in demo dataset.')
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Failed to fetch recommendations')
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-white font-medium">Instant Match</h3>
        <div className="flex items-center gap-3">
          <label className="text-white/70 text-sm">Radius</label>
          <input type="range" min={0.25} max={2} step={0.25} value={radius} onChange={(e)=>setRadius(parseFloat(e.target.value))} />
          <span className="text-white/70 text-sm tabular-nums">{radius.toFixed(2)} mi</span>
          <button onClick={run} disabled={loading} className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50">
            {loading ? 'Finding…' : 'Find instant matches'}
          </button>
        </div>
      </div>
      {error && <div className="text-rose-300 text-sm mb-2">{error}</div>}
      {!!items.length && (
        <div className="space-y-3">
          {items.map((x, i) => (
            <div key={`${x.profile.id}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.05] border border-white/10">
              <img src={x.profile.photo || 'https://i.pravatar.cc/80'} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{x.profile.name || 'Student'}</div>
                <div className="text-white/60 text-sm truncate">{x.profile.major || '-'} - {x.profile.availability || '-'}</div>
                <div className="text-white/50 text-xs truncate">{(x.profile.courses || []).join(', ')}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-300 text-sm font-semibold">Score {Math.round(x.score)}</div>
                <button
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm disabled:opacity-60"
                  disabled={!!invited[x.profile.id]}
                  onClick={() => setInvited((m) => ({ ...m, [x.profile.id]: true }))}
                >
                  {invited[x.profile.id] ? 'Invited' : 'Invite to study'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!items.length && !error && <div className="text-white/60 text-sm">Click the button to see who's available right now.</div>}
    </div>
  )
}

