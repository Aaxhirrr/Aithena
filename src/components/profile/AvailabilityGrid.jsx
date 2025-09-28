export default function AvailabilityGrid({ rows = 5, cols = 7 }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="aspect-square rounded bg-slate-200" />
      ))}
    </div>
  )
}

