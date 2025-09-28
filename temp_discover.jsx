import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useDragControls } from 'framer-motion'
import studentsJson from '../data/students.json'

const CAMPUS_COORD = { lat: 33.4242, lng: -111.9281 }

const DiscoverScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(null)

  const students = studentsJson
  const [userCoords, setUserCoords] = useState(null)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserCoords(null),
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [])

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-250, 250], [-20, 20])
  const opacity = useTransform(x, [-250, -80, 0, 80, 250], [0, 1, 1, 1, 0])
  const likeOpacity = useTransform(x, [0, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0])
  const dragControls = useDragControls()

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(offset) > 120 || Math.abs(velocity) > 800) {
      const toX = offset > 0 ? window.innerWidth : -window.innerWidth
      setDirection(offset > 0 ? 'right' : 'left')
      animate(x, toX, { type: 'spring', stiffness: 300, damping: 35 }).then(() => {
        setCurrentIndex((prev) => (prev + 1) % (pool.length || students.length))
        setDirection(null)
        x.set(0)
      })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const swipeRight = () => {
    setDirection('right')
    animate(x, 300, { type: 'spring', stiffness: 300, damping: 25 })
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (pool.length || students.length))
      setDirection(null)
      x.set(0)
    }, 250)
  }

  const swipeLeft = () => {
    setDirection('left')
    animate(x, -300, { type: 'spring', stiffness: 300, damping: 25 })
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (pool.length || students.length))
      setDirection(null)
      x.set(0)
    }, 250)
  }

  // Session questionnaire state
  const PREFS_KEY = 'aithena_session_prefs'
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null') } catch { return null }
  })
  const [useProfile, setUseProfile] = useState(false)

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('aithena_profile') || 'null') } catch { return null }
  })()

  const [questionnaireOpen, setQuestionnaireOpen] = useState(!prefs && !useProfile)
  const activeCoords = userCoords || CAMPUS_COORD

  if (questionnaireOpen) {
    return (
      <Questionnaire
        students={students}
        onSubmit={(p) => {
          localStorage.setItem(PREFS_KEY, JSON.stringify(p))
          setPrefs(p)
          setUseProfile(false)
          setCurrentIndex(0)
          setQuestionnaireOpen(false)
        }}
        onExploreAnyway={() => {
          setUseProfile(true)
          setCurrentIndex(0)
          setQuestionnaireOpen(false)
        }}
      />
    )
  }

  const pool = filterStudents(students, prefs, profile, activeCoords, useProfile)

  if (!pool.length) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-6 flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-2xl text-white font-semibold">No matches found</h2>
        <p className="text-white/60 max-w-md">Try widening your search radius or selecting a different course.</p>
        <button
          className="px-5 py-2 rounded-lg bg-white/10 text-white border border-white/20"
          onClick={() => {
            localStorage.removeItem(PREFS_KEY)
            setPrefs(null)
            setUseProfile(false)
            setCurrentIndex(0)
          }}
        >
          Adjust preferences
        </button>
      </div>
    )
  }

  const current = pool[currentIndex % pool.length]
  const currentStudent = current

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center select-none">
      {/* Header */}
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
          Discover Study Partners
        </h1>
        <p className="text-white/60 font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Swipe right to connect, left to pass
        </p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => { setUseProfile(false); setQuestionnaireOpen(true) }}
            className="px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 text-xs uppercase tracking-wide hover:bg-white/10"
          >
            Adjust matching preferences
          </button>
        </div>
      </motion.div>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-[680px]">
        {/* Background cards */}
        {pool.slice(currentIndex + 1, currentIndex + 3).map((student, index) => (
          <motion.div
            key={student.id}
            className="absolute inset-0 rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08]"
            style={{ zIndex: -index - 1, scale: 1 - (index + 1) * 0.05, y: (index + 1) * 10 }}
          />
        ))}

        {/* Active top card */}
        <motion.div
          key={currentStudent.id}
          className="absolute inset-0 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ x, rotate, opacity, touchAction: 'none' }}
          drag="x"
          dragListener={false}
          dragControls={dragControls}
          dragElastic={0.35}
          dragMomentum
          dragTransition={{ bounceStiffness: 350, bounceDamping: 22 }}
          onPointerDown={(e) => {
            // start drag immediately on single pointer down
            dragControls.start(e)
          }}
          onDragEnd={handleDragEnd}
        >
          {/* Color tint overlays */}
          <motion.div className="absolute inset-0 bg-emerald-500/20 pointer-events-none" style={{ opacity: likeOpacity }} />
          <motion.div className="absolute inset-0 bg-rose-500/20 pointer-events-none" style={{ opacity: nopeOpacity }} />
          {/* Photo header */}
          <div className="h-[45%] w-full overflow-hidden">
            <img src={currentStudent.photo} alt={currentStudent.name} className="w-full h-full object-cover" />
          </div>

          {/* LIKE / NOPE badges */}
          <motion.div className="absolute top-4 left-4 px-3 py-1 rounded-md border-2 border-emerald-400/60 text-emerald-300 text-sm font-semibold" style={{ opacity: likeOpacity }}>
            LIKE
          </motion.div>
          <motion.div className="absolute top-4 right-4 px-3 py-1 rounded-md border-2 border-rose-400/60 text-rose-300 text-sm font-semibold" style={{ opacity: nopeOpacity }}>
            NOPE
          </motion.div>

          {/* Card content */}
          <div className="h-full flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-[56px_1fr_auto] gap-4 items-center mb-5">
                <img src={currentStudent.photo} alt={currentStudent.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="text-white font-semibold text-lg truncate">{currentStudent.name}</div>
                  <div className="text-white/70 text-sm truncate">{currentStudent.major} {'\u2022'} {currentStudent.year}</div>
                </div>
                <div className="text-emerald-300 text-sm font-semibold whitespace-nowrap">{currentStudent.compatibility}% match</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {currentStudent.courses.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-xs tracking-wide">
                    {c}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs text-white/80">
                <div>
                  <div className="text-white/50 mb-1">Primary Course</div>
                  <div className="text-white/90 text-sm">{currentStudent.courses[0]}</div>
                </div>
                <div>
                  <div className="text-white/50 mb-1">Currently</div>
                  <div className="text-white/90 text-sm">{currentStudent.location}</div>
                </div>
                <div>
                  <div className="text-white/50 mb-1">Distance</div>
                  <div className="text-white/90 text-sm">{formatDistance(activeCoords, currentStudent)}</div>
                </div>
                <div>
                  <div className="text-white/50 mb-1">Match</div>
                  <div className="text-white/90 text-sm">{currentStudent.compatibility}%</div>
                </div>
              </div>

              <div className="mt-5 text-white/70 text-xs">
                Availability: <span className="text-white/90">{currentStudent.availability}</span> {'\u2022'} Location: <span className="text-white/90">{currentStudent.location}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-6 pt-0 grid grid-cols-2 gap-4">
              <button onClick={swipeLeft} className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-300 font-medium hover:bg-rose-500/20 transition-colors">
                {'\u274C'} Pass
              </button>
              <button onClick={swipeRight} className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-medium hover:bg-emerald-500/20 transition-colors">
                {'\u2764'} Like
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DiscoverScreen

// Helpers
function formatDistance(user, s) {
  if (!user || !Number.isFinite(s.lat) || !Number.isFinite(s.lng)) return '\u2014'
  const d = haversine(user.lat, user.lng, s.lat, s.lng)
  if (d < 1) return `${Math.round(d * 1000)} m`
  return `${d.toFixed(1)} km`
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function filterStudents(all, prefs, profile, coords, useProfile) {
  let base = [...all]
  const P = useProfile ? normalizeProfile(profile) : prefs
  if (!P) return base

  // Filter by course
  if (P.course) {
    const matchCourse = P.course.toLowerCase()
    base = base.filter((s) => s.courses.some((c) => c.toLowerCase() === matchCourse))
  }

  // Gender
  if (P.gender && P.gender !== 'any') {
    const targetGender = P.gender.toLowerCase()
    base = base.filter((s) => (s.gender || '').toLowerCase() === targetGender)
  }

  // Distance
  if (coords && P.radiusKm) {
    base = base.filter((s) => haversine(coords.lat, coords.lng, s.lat, s.lng) <= P.radiusKm)
  }

  return base
}
function normalizeProfile(profile) {
  if (!profile) return null
  const firstCourse = (profile.courses || '').split(',').map((s) => s.trim()).filter(Boolean)[0]
  return { course: firstCourse || '', gender: 'any', radiusKm: 5 }
}

function uniqueCourses(students) {
  const set = new Set()
  students.forEach((s) => s.courses.forEach((c) => set.add(c)))
  return Array.from(set)
}

function Questionnaire({ students, onSubmit, onExploreAnyway }) {
  const [course, setCourse] = React.useState('')
  const [gender, setGender] = React.useState('any')
  const [radiusKm, setRadiusKm] = React.useState(5)
  const options = uniqueCourses(students)

  return (
    <div className="min-h-screen pt-24 pb-10 px-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Set Your Matching Preferences</h2>
        <p className="text-white/60 mb-6">Weâ€™ll show partners that match these preferences. You can also explore using your profile instead.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/[0.06] border border-white/10 text-white"
              style={{ backgroundColor: 'rgba(15,15,20,0.9)', color: '#f8fafc' }}
            >
              <option value="">Any</option>
              {options.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/[0.06] border border-white/10 text-white"
              style={{ backgroundColor: 'rgba(15,15,20,0.9)', color: '#f8fafc' }}
            >
              <option value="any">Any</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-white/70 mb-1">Distance radius: {radiusKm} km</label>
            <input type="range" min="1" max="10" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => onSubmit({ course, gender, radiusKm })} className="px-5 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Save & Continue</button>
          <button onClick={onExploreAnyway} className="px-5 py-2 rounded-lg bg-white/10 text-white border border-white/20">I want to explore anyway</button>
        </div>
      </div>
    </div>
  )
}
