export default function PrivacyDial({ level = 0 }) {
  const pct = Math.max(0, Math.min(100, level))
  return (
    <div>
      <div className="h-2 bg-slate-200 rounded">
        <div className="h-2 bg-amber-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-slate-500 mt-1">Privacy: {pct}%</div>
    </div>
  )
}

