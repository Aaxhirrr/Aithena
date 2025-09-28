import React, { useMemo, useState } from 'react'
import chat from '../services/gemini/chat.js'
import students from '../data/students.json'

const GROUPS = [
  { id: 'cse230', title: 'CSE230 • Data Structures', course: 'CSE 230' },
  { id: 'cse310', title: 'CSE310 • Algorithms', course: 'CSE 310' },
  { id: 'cse365', title: 'CSE365 • CS Ethics', course: 'CSE 365' },
]

function pickPersonas(course, n = 3) {
  const pool = students.filter((s) => (s.courses || []).some((c) => String(c).toLowerCase() === course.toLowerCase()))
  const arr = [...pool]
  arr.sort(() => Math.random() - 0.5)
  return arr.slice(0, n).map((s) => ({ name: s.name, bio: `${s.major || ''} • ${s.availability || ''}` }))
}

export default function GroupsScreen() {
  const [active, setActive] = useState(GROUPS[0].id)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const group = GROUPS.find((g) => g.id === active)
  const personas = useMemo(() => pickPersonas(group.course, 3), [active])

  const send = async () => {
    if (!input.trim()) return
    const next = [...history, { role: 'user', text: input }]
    setHistory(next)
    setInput('')
    setLoading(true)
    try {
      const reply = await chat.chatWithPersonas({ messages: next, personas })
      setHistory((h) => [...h, { role: 'assistant', text: `${reply.name}: ${reply.text}` }])
    } catch (e) {
      setHistory((h) => [...h, { role: 'assistant', text: 'Bot: (error talking right now)' }])
      console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-white/70 text-xs uppercase mb-2">Groups</div>
        <div className="flex flex-col gap-2">
          {GROUPS.map((g) => (
            <button key={g.id} onClick={() => { setActive(g.id); setHistory([]) }}
              className={`text-left rounded-lg px-3 py-2 border ${active === g.id ? 'bg-[#c4ff00]/10 text-[#c4ff00] border-[#c4ff00]/30' : 'bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.06]'}`}
            >{g.title}</button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col">
        <div className="text-white font-medium mb-2">{group.title}</div>
        <div className="text-white/60 text-xs mb-4">Members: {personas.map(p => p.name).join(', ')}</div>
        <div className="flex-1 overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
          {history.length === 0 && (
            <div className="text-white/40 text-sm">Say hi and ask a quick question about this course. Personas: {personas.map(p=>p.name).join(', ')}.</div>
          )}
          {history.map((m, i) => (
            <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-sky-600/30 text-white' : 'bg-white/10 text-white/90'}`}>{m.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()}
                 className="flex-1 rounded-lg bg-white/[0.06] border border-white/10 p-2 text-white" placeholder="Type a message…" />
          <button onClick={send} disabled={loading} className="px-4 py-2 rounded-lg bg-sky-600 text-white disabled:opacity-50">{loading ? 'Sending…' : 'Send'}</button>
        </div>
      </section>
    </div>
  )
}
