export default function CheckInRipple({ active = false }) {
  return (
    <div className={`w-24 h-24 rounded-full border-2 border-sky-500 ${active ? 'animate-ping' : ''}`} />
  )
}

