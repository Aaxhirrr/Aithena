import React, { useEffect, useRef, useState } from 'react'
import students from '../data/students.json'

const CAMPUS_COORD = { lat: 33.4242, lng: -111.9281 }
const MILE_IN_METERS = 1609.34
const MIN_VISIBLE_MARKERS = 8

function useGoogleMaps() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) return

    if (window.google && window.google.maps && window.google.maps.visualization) {
      setReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=visualization`
    script.async = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)
    return () => script.remove()
  }, [])

  return ready
}

const MapScreen = () => {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const heatmapRef = useRef(null)
  const markersRef = useRef([])
  const haloRef = useRef(null)
  const userMarkerRef = useRef(null)

  const [userCoords, setUserCoords] = useState(null)
  const [selected, setSelected] = useState(null)
  const [radiusMiles, setRadiusMiles] = useState(() => {
    const v = Number(localStorage.getItem('aithena_radius_mi'))
    return Number.isFinite(v) && v > 0 ? v : 1
  })
  const [discoverable, setDiscoverable] = useState(() => localStorage.getItem('aithena_discoverable') === '1')
  const watchIdRef = useRef(null)
  const ready = useGoogleMaps()

  useEffect(() => {
    if (!navigator.geolocation) return
    // Always get one snapshot for center
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [])

  // Live watch when user opts-in to be discoverable
  useEffect(() => {
    if (!navigator.geolocation) return
    if (discoverable && watchIdRef.current == null) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      )
    }
    if (!discoverable && watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [discoverable])

  useEffect(() => {
    localStorage.setItem('aithena_radius_mi', String(radiusMiles))
  }, [radiusMiles])

  useEffect(() => {
    localStorage.setItem('aithena_discoverable', discoverable ? '1' : '0')
  }, [discoverable])

  useEffect(() => {
    if (!ready || !mapContainerRef.current) return

    const center = userCoords || CAMPUS_COORD

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0b0f19' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f19' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      ],
    })

    mapRef.current = map
    map.addListener('click', () => setSelected(null))

    if (heatmapRef.current) heatmapRef.current.setMap(null)
    heatmapRef.current = null

    if (markersRef.current.length) {
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
    }

    if (haloRef.current) { haloRef.current.setMap(null); haloRef.current = null }
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null }

    const radiusMeters = radiusMiles * MILE_IN_METERS
    if (userCoords) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userCoords,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'You are here',
        zIndex: 999,
      })

      haloRef.current = new window.google.maps.Circle({
        center: userCoords,
        radius: radiusMeters,
        map,
        strokeColor: '#38bdf8',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#38bdf833',
        fillOpacity: 0.35,
      })
    }

    const studentsWithDistance = students.map((s) => ({
      ...s,
      distanceKm: haversine(center.lat, center.lng, s.lat, s.lng),
    }))

    const visibleStudents = ensureMinimumStudents(
      studentsWithDistance,
      center,
      radiusMiles * (MILE_IN_METERS / 1000),
      MIN_VISIBLE_MARKERS
    )

    if (window.google.maps.visualization) {
      const gradient = [
        'rgba(2, 132, 199, 0)',
        'rgba(2, 132, 199, 0.3)',
        'rgba(6, 182, 212, 0.5)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(129, 140, 248, 0.8)',
        'rgba(236, 72, 153, 0.85)',
        'rgba(251, 191, 36, 0.9)',
      ]

      const heatData = visibleStudents.map((s) => ({
        location: new window.google.maps.LatLng(s.lat, s.lng),
        weight: Math.max(1.5, s.compatibility / 10),
      }))

      heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
        data: heatData,
        radius: 80,
        opacity: 0.55,
        gradient,
      })
      heatmapRef.current.setMap(map)
    }

    // Force simple photo markers to avoid any library quirks
    visibleStudents.forEach((student) => {
      const marker = new window.google.maps.Marker({
        position: { lat: student.lat, lng: student.lng },
        map,
        icon: {
          url: student.photo,
          scaledSize: new window.google.maps.Size(56, 56),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(28, 28),
        },
        title: student.name,
        zIndex: 3000,
        optimized: false,
      })

      marker.addListener('click', () => {
        setSelected(student)
        const pos = marker.getPosition()
        if (pos) map.panTo(pos)
      })

      markersRef.current.push(marker)
    })
  }, [ready, userCoords, radiusMiles, discoverable])

  return (
    <div className="min-h-screen pt-24 pb-6 px-6 relative">
      <h1 className="text-3xl font-semibold text-white mb-2">Campus Heatmap</h1>
      {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
        <div className="mb-4 text-amber-300 text-sm">Set VITE_GOOGLE_MAPS_API_KEY to enable Google Maps.</div>
      )}
      <p className="text-white/60 text-sm mb-4">Live density of Aithena users around ASU Tempe. Tap avatars within a mile radius to preview profiles.</p>
      <div className="relative">
        <div ref={mapContainerRef} className="w-full h-[70vh] rounded-2xl overflow-hidden border border-white/10" />
        {/* Controls */}
        <div className="absolute top-3 right-3 bg-[#0f172a]/85 border border-white/10 text-white rounded-xl shadow-lg p-3 flex flex-col gap-2">
          <div className="text-xs uppercase tracking-wide text-white/70">Radius</div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.25}
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(parseFloat(e.target.value))}
            />
            <span className="text-sm tabular-nums">{radiusMiles.toFixed(2)} mi</span>
          </div>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={discoverable}
              onChange={(e) => setDiscoverable(e.target.checked)}
            />
            <span>Make me discoverable</span>
          </label>
        </div>
      </div>

      {selected && (
        <div className="absolute bottom-6 right-6 w-full max-w-sm bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <img src={selected.photo} alt={selected.name} className="w-12 h-12 rounded-xl object-cover" />
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{selected.name}</div>
              <div className="text-white/60 text-sm truncate">{selected.major} • {selected.year}</div>
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-white/50 hover:text-white text-sm">Close</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.courses.map((course) => (
              <span key={course} className="px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs border border-white/15">{course}</span>
            ))}
          </div>
          <div className="mt-1 text-xs text-white/60">Match quality {selected.compatibility}%</div>
        </div>
      )}
    </div>
  )
}

export default MapScreen

function buildAvatarIcon(photoUrl) {
  const svg = `
    <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="clip">
          <circle cx="26" cy="26" r="23" />
        </clipPath>
      </defs>
      <circle cx="26" cy="26" r="25" fill="rgba(15,23,42,0.9)" stroke="rgba(56,189,248,0.9)" stroke-width="2" />
      <circle cx="26" cy="26" r="25" fill="rgba(15,23,42,0.85)" />
      <image href="${photoUrl}" x="3" y="3" width="46" height="46" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice" />
    </svg>
  `.trim()

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(52, 52),
    anchor: new window.google.maps.Point(26, 26),
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function ensureMinimumStudents(allStudents, center, maxRadiusKm, minimum) {
  const withinRadius = allStudents.filter((s) => s.distanceKm <= maxRadiusKm)

  if (withinRadius.length >= minimum) return withinRadius

  const seed = withinRadius.length ? withinRadius : [...allStudents].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 1)
  const result = [...withinRadius]

  while (result.length < minimum) {
    const template = seed[result.length % seed.length]
    const jitteredCoords = randomPointWithin(center, maxRadiusKm * 1000 * 0.85)
    result.push({
      ...template,
      lat: jitteredCoords.lat,
      lng: jitteredCoords.lng,
      distanceKm: haversine(center.lat, center.lng, jitteredCoords.lat, jitteredCoords.lng),
      synthetic: true,
      syntheticId: `synthetic-${template.id}-${result.length}`,
    })
  }

  return result
}

function randomPointWithin(center, radiusMeters) {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.random() * radiusMeters
  const dLat = (radius * Math.cos(angle)) / 111320
  const dLng = (radius * Math.sin(angle)) / (111320 * Math.cos((center.lat * Math.PI) / 180))
  return { lat: center.lat + dLat, lng: center.lng + dLng }
}
