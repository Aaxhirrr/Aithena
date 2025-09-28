import { useEffect, useState } from 'react'

export default function useLocation() {
  const [coords, setCoords] = useState(null)
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition((p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }))
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  return { coords }
}

