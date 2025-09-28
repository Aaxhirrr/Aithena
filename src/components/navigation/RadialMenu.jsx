export default function RadialMenu({ open = false, items = [] }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute bottom-20 right-6">
        {items.map((it, i) => (
          <button key={i} className="pointer-events-auto block mb-2 bg-white border rounded-full px-3 py-2 shadow">
            {it.label || 'Item'}
          </button>
        ))}
      </div>
    </div>
  )
}

