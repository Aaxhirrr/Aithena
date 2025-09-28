export default function ProfileCard({ user = {} }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="font-semibold">{user.name || 'Student'}</div>
      <div className="text-sm text-slate-600">{user.bio || 'Bio goes here.'}</div>
    </div>
  )
}

