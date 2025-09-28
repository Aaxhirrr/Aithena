export default function ProximityThreads({ connections = [] }) {
  return (
    <div className="text-sm text-slate-600">
      {connections.length ? `${connections.length} proximity connections` : 'No proximity data'}
    </div>
  )
}

