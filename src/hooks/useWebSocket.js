import { useEffect, useRef, useState } from 'react'

export default function useWebSocket(url) {
  const ref = useRef(null)
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (!url) return
    const ws = new WebSocket(url)
    ref.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    return () => ws.close()
  }, [url])
  const send = (data) => ref.current?.send(JSON.stringify(data))
  return { connected, send }
}

