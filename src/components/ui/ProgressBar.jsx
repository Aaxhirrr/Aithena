export default function ProgressBar({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full bg-gray-200 rounded ${className}`}>
      <div className="h-2 bg-sky-600 rounded" style={{ width: `${clamped}%` }} />
    </div>
  )
}

