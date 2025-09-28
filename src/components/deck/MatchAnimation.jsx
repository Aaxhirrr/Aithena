export default function MatchAnimation({ visible = false }) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40">
      <div className="text-white text-3xl font-bold animate-pulse">It’s a match!</div>
    </div>
  )
}

