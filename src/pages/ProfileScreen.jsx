import React, { useEffect, useState } from 'react'
import { auth, db } from '../services/firebase/config.js'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import CourseRecommendations from '../components/profile/CourseRecommendations.jsx'

const STORAGE_KEY = 'aithena_profile'

export default function ProfileScreen() {
const [profile, setProfile] = useState({
name: '',
major: '',
courses: '',
availability: 'Evenings',
bio: '',
photo: '',
})
const [uid, setUid] = useState(null)
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [message, setMessage] = useState('')

useEffect(() => {
const unsub = onAuthStateChanged(auth, async (user) => {
try {
if (!user) {
await signInAnonymously(auth)
return
}
setUid(user.uid)
const ref = doc(db, 'profiles', user.uid)
const snap = await getDoc(ref)
if (snap.exists()) {
const data = snap.data()
setProfile({
name: data.name || '',
major: data.major || '',
courses: Array.isArray(data.courses) ? data.courses.join(', ') : (data.courses || ''),
availability: data.availability || 'Evenings',
bio: data.bio || '',
photo: data.photo || '',
})
} else {
try {
const raw = localStorage.getItem(STORAGE_KEY)
if (raw) setProfile(JSON.parse(raw))
} catch {}
}
} finally {
setLoading(false)
}
})
return () => unsub()
}, [])

const update = (k, v) => {
const next = { ...profile, [k]: v }
setProfile(next)
try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
}

const saveToFirestore = async () => {
if (!uid) {
setMessage('Not signed in. Try again in a second…')
return
}
setSaving(true); setMessage('')
try {
const normalized = {
name: profile.name.trim(),
major: profile.major.trim(),
courses: profile.courses.split(',').map(s => s.trim()).filter(Boolean),
availability: profile.availability,
bio: profile.bio.trim(),
photo: profile.photo.trim(),
updatedAt: serverTimestamp(),
}
await setDoc(doc(db, 'profiles', uid), normalized, { merge: true })
setMessage('Saved to Firebase')
} catch (e) {
console.error('Profile save error', e)
setMessage('Save failed. Check console')
} finally {
setSaving(false)
}
}

return (
<div className="min-h-screen pt-24 pb-10 px-6">
<h1 className="text-3xl font-semibold text-white mb-6">Your Profile</h1>
{loading && <div className="text-white/70 mb-4">Loading profile…</div>}
  {/* Two-column layout: profile editor/preview + instant matches */}
  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    {/* Left column: editor + preview */}
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Name</label>
            <input className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                   value={profile.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Major</label>
            <input className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                   value={profile.major} onChange={(e) => update('major', e.target.value)} />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Courses (comma-separated)</label>
            <input className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                   value={profile.courses} onChange={(e) => update('courses', e.target.value)} />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">Availability</label>
            <select className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                    value={profile.availability} onChange={(e) => update('availability', e.target.value)}>
              {['Mornings', 'Afternoons', 'Evenings', 'Flexible'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Photo URL</label>
            <input className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                   value={profile.photo} onChange={(e) => update('photo', e.target.value)} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-1">Bio</label>
            <textarea className="w-full rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white"
                      rows={4} value={profile.bio} onChange={(e) => update('bio', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4">
          <img src={profile.photo || 'https://i.pravatar.cc/150'} alt="avatar" className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <div className="text-white font-medium">{profile.name || 'Student'}</div>
            <div className="text-white/70 text-sm">{profile.major || 'Major'}</div>
          </div>
        </div>
        <div className="mt-4 text-white/70 text-sm">
          {profile.bio || 'Tell others about your study style and goals.'}
        </div>
        <div className="mt-2 text-white/50 text-xs">Courses: {profile.courses || '—'}</div>
        <div className="text-white/50 text-xs">Availability: {profile.availability}</div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveToFirestore} disabled={saving || loading || !uid}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save to Firebase'}
          </button>
          {message && <span className="text-white/60 text-sm">{message}</span>}
        </div>
      </div>
    </div>

    {/* Right column: Instant Match */}
    <div>
      <CourseRecommendations />
    </div>
  </div>
</div>
)
}
