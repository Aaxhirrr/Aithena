export default function PresenceOrbs({ users = [] }) {
  return (
    <div className="flex -space-x-2">
      {users.map((u, i) => (
        <span key={i} className="w-6 h-6 rounded-full bg-sky-500 ring-2 ring-white inline-block" title={u.name || 'User'} />
      ))}
    </div>
  )
}

