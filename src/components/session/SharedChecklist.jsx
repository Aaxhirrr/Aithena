import { useState } from 'react'

export default function SharedChecklist() {
  const [items, setItems] = useState([{ text: 'Example task', done: false }])
  return (
    <div>
      <ul className="space-y-2 mb-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={it.done} onChange={() => {
              const next = [...items]; next[i] = { ...it, done: !it.done }; setItems(next)
            }} />
            <span className={it.done ? 'line-through text-slate-400' : ''}>{it.text}</span>
          </li>
        ))}
      </ul>
      <button className="text-sm text-sky-600" onClick={() => setItems([...items, { text: `Task ${items.length + 1}`, done: false }])}>Add item</button>
    </div>
  )
}

