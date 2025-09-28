import React, { Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Loader
const PremiumLoader = () => (
  <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="text-6xl font-bold tracking-tight text-[#c4ff00] mb-4"
        style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
      >
        AITHENA
      </motion.div>
      <motion.div
        className="w-32 h-0.5 bg-[#c4ff00] mx-auto"
        initial={{ width: 0 }}
        animate={{ width: 128 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </motion.div>
  </div>
)

// Top navigation
const PremiumNav = () => {
  const location = useLocation()
  const tabs = [
    { path: '/', label: 'Overview' },
    { path: '/discover', label: 'Discover' },
    { path: '/campus', label: 'Campus' },
    { path: '/connections', label: 'Connections' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center backdrop-blur-xl bg-[#0a0a0a]/80"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="text-2xl font-bold text-[#c4ff00] tracking-tight"
        style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
        whileHover={{ scale: 1.05 }}
      >
        AITHENA
      </motion.div>

      <div className="hidden md:flex gap-8">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <motion.a
              key={tab.path}
              href={tab.path}
              className={`relative font-medium transition-colors duration-300 ${
                isActive ? 'text-[#c4ff00]' : 'text-white/70 hover:text-white'
              }`}
              style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              whileHover={{ y: -2 }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#c4ff00]"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.a>
          )
        })}
      </div>
    </motion.nav>
  )
}

// Mobile bottom nav
const MobileNav = () => {
  const location = useLocation()
  const tabs = [
    { path: '/', label: 'Home', icon: '\uD83C\uDFE0' },
    { path: '/discover', label: 'Discover', icon: '\u2728' },
    { path: '/campus', label: 'Campus', icon: '\uD83D\uDDFA\uFE0F' },
    { path: '/connections', label: 'Chat', icon: '\uD83D\uDCAC' },
    { path: '/profile', label: 'Profile', icon: '\uD83D\uDC64' },
  ]

  return (
    <motion.nav
      className="md:hidden fixed bottom-6 left-4 right-4 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-[#0a0a0a]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-around p-4">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <motion.a
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-[#c4ff00] bg-[#c4ff00]/10' : 'text-white/50 hover:text-white/80'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg font-light" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
                  {tab.icon}
                </span>
                <span className="text-xs font-medium tracking-wide" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
                  {tab.label}
                </span>
              </motion.a>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

// Lazy load pages
const HomeScreen = React.lazy(() => import('./pages/HomeScreen'))
const DiscoverScreen = React.lazy(() => import('./pages/DiscoverScreen'))
const MapScreen = React.lazy(() => import('./pages/MapScreen'))
const SessionScreen = React.lazy(() => import('./pages/SessionScreen'))
const MatchesScreen = React.lazy(() => import('./pages/MatchesScreen'))
const ProfileScreen = React.lazy(() => import('./pages/ProfileScreen'))
const SettingsScreen = React.lazy(() => import('./pages/SettingsScreen'))

function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <PremiumLoader />

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0f0a] to-[#0a0a0a]" />
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, #c4ff00 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, #ff6b35 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, #c4ff00 0%, transparent 50%)',
              'radial-gradient(circle at 60% 40%, #ff6b35 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, #c4ff00 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <PremiumNav />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen"
          >
            <Suspense fallback={<PremiumLoader />}>
              <Routes location={location}>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/discover" element={<DiscoverScreen />} />
                <Route path="/campus" element={<MapScreen />} />
                <Route path="/session/:sessionId" element={<SessionScreen />} />
                <Route path="/connections" element={<MatchesScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <MobileNav />
    </div>
  )
}

export default App

