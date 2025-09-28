import { useEffect, useState } from 'react'

export default function PomodoroTimer({ duration = 25 * 60 }) {
  const [seconds, setSeconds] = useState(duration)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return <div className="font-mono text-xl">{mm}:{ss}</div>
}

