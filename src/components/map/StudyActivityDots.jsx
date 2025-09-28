export default function StudyActivityDots({ count = 0 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
      ))}
    </div>
  )
}

