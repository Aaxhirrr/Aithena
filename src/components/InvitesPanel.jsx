import React, { useEffect, useState } from 'react'
import { auth, db } from '../services/firebase/config.js'
import { doc, getDoc } from 'firebase/firestore'
import invitesApi from '../services/gemini/invites.js'

export default function InvitesPanel({ onAccept }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invites, setInvites] = useState([])
  const [accepted, setAccepted] = useState({})

  const load = async () => {
    setLoading(true); setError('')
    try {
      const user = auth.currentUser
      let profile = {}
      if (user) {
        const snap = await getDoc(doc(db, 'profiles', user.uid))
        if (snap.exists()) profile = snap.data()
      }
      const res = await invitesApi.fetchInvites(profile, 5)
      const clean = (txt) => {
        if (!txt) return ''
        let s = String(txt).trim()
        s = s.replace(/^(hey|hi|hello)\s+[A-Za-z][\w\s-]*[,!]?\s*/i, (m, g1) => `${g1.charAt(0).toUpperCase()+g1.slice(1).toLowerCase()}, `)
        s = s.replace(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*[,!]?\s*/, '')
        if (!/^\s*(Hey|Hi|Hello)\b/.test(s)) s = 'Hey, ' + s
        return s
      }
      setInvites((res.invites || []).map(i => ({ ...i, message: clean(i.message) })))
    } catch (e) {
      console.error(e)
      setError('Could not load invites right now.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Invites to study</h3>
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      {error && <div className="text-rose-300 text-sm mb-2">{error}</div>}
      {!invites.length && !loading && <div className="text-white/60 text-sm">No invites right now. Try refreshing.</div>}
      <div className="space-y-3">
        {invites.map((i) => (
          <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.05] border border-white/10">
            <img src={i.photo || 'https://i.pravatar.cc/80'} alt="" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{i.name}</div>
              <div className="text-white/60 text-sm truncate">{i.major || '—'}</div>
              <div className="text-white/50 text-xs truncate">{(i.courses || []).join(', ')}</div>
              <div className="text-white/80 text-sm mt-1">{i.message}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm"
                onClick={() => {
                  setAccepted((m)=>({ ...m, [i.id]: 'accepted' }))
                  setInvites((list) => list.filter((x) => x.id !== i.id))
                  onAccept && onAccept(i)
                }}
              >
                Accept
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm"
                onClick={() => {
                  setAccepted((m)=>({ ...m, [i.id]: 'declined' }))
                  setInvites((list) => list.filter((x) => x.id !== i.id))
                }}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
