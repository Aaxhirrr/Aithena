export default function Sheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40">
      <div className="ml-auto h-full w-80 bg-white p-4 shadow-xl">
        {children}
      </div>
      <button aria-label="Close" onClick={onClose} className="sr-only">Close</button>
    </div>
  )
}

