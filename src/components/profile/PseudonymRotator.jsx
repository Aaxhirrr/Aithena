import { useState } from 'react'

const NAMES = ['Sage Otter', 'Quantum Owl', 'Silent Comet']

export default function PseudonymRotator() {
  const [index, setIndex] = useState(0)
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{NAMES[index]}</span>
      <button className="text-sm text-sky-600" onClick={() => setIndex((index + 1) % NAMES.length)}>Rotate</button>
    </div>
  )
}

