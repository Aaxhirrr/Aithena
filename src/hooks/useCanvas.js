import { useEffect, useRef } from 'react'

export default function useCanvas(draw = () => {}) {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (ctx) draw(ctx)
  }, [draw])
  return { ref }
}

