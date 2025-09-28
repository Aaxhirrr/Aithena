import React, { useEffect, useState } from 'react'
import students from '../data/students.js'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const MatchesScreen = () => {
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition((p) => setUser({ lat: p.coords.latitude, lng: p.coords.longitude }))
  }, [])

  const list = [...students]
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 20)

  return (
    <div className="min-h-screen pt-24 pb-10 px-6">
      <h1 className="text-3xl font-semibold text-white mb-6">Connections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((s) => (
          <div key={s.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
            <div className="h-40 w-full overflow-hidden">
              <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-white font-medium">{s.name}</div>
                <div className="text-emerald-300 text-sm font-semibold">{s.compatibility}%</div>
              </div>
              <div className="text-white/70 text-sm">{s.courses[0]} • {s.location}</div>
              {user && (
                <div className="text-white/50 text-xs mt-1">{haversine(user.lat, user.lng, s.lat, s.lng).toFixed(1)} km away</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchesScreen
