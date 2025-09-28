import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Heart, 
  Map, 
  MessageCircle, 
  User,
  Sparkles
} from 'lucide-react'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'

const TabBar = () => {
  const location = useLocation()
  const { feedback } = useAudioFeedback()

  const tabs = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      path: '/discover', 
      icon: Sparkles, 
      label: 'Discover',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      path: '/map', 
      icon: Map, 
      label: 'Map',
      color: 'from-green-500 to-teal-600'
    },
    { 
      path: '/matches', 
      icon: MessageCircle, 
      label: 'Matches',
      color: 'from-orange-500 to-red-600'
    },
    { 
      path: '/profile', 
      icon: User, 
      label: 'Profile',
      color: 'from-indigo-500 to-purple-600'
    }
  ]

  const handleTabClick = (tab) => {
    feedback('tick', { frequency: 800, duration: 8 })
  }

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2
      }}
    >
      {/* Background with glass morphism */}
      <div className="absolute inset-0 glass-heavy rounded-t-3xl border-t border-white/20">
        {/* Neural grid overlay */}
        <div 
          className="absolute inset-0 opacity-10 rounded-t-3xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Tab content */}
      <div className="relative flex items-center justify-around px-6 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => handleTabClick(tab)}
              className="relative flex flex-col items-center space-y-1 group touchable"
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute -inset-3 rounded-2xl bg-gradient-to-br ${tab.color} opacity-20`}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              {/* Icon container */}
              <motion.div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/60 group-hover:text-white/80'
                }`}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotateY: isActive ? [0, 360] : 0
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 400, damping: 25 },
                  rotateY: { duration: 0.6, ease: 'easeInOut' }
                }}
              >
                {/* Icon glow */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tab.color} blur-lg opacity-50`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                <Icon 
                  size={20} 
                  className={`relative z-10 transition-all duration-200 ${
                    isActive ? 'drop-shadow-lg' : ''
                  }`}
                />

                {/* Neural sparks for active tab */}
                {isActive && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white"
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: [0, Math.cos(i * 120 * Math.PI / 180) * 20],
                          y: [0, Math.sin(i * 120 * Math.PI / 180) * 20]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: 'easeOut'
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className={`text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-white text-gradient' 
                    : 'text-white/60 group-hover:text-white/80'
                }`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  fontWeight: isActive ? 600 : 500
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
              >
                {tab.label}
              </motion.span>

              {/* Interaction ripple */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                whileTap={{
                  background: [
                    'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
                    'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)'
                  ]
                }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          )
        })}
      </div>

      {/* Home indicator for iOS devices */}
      <div className="h-safe-area-inset-bottom w-full" />
    </motion.nav>
  )
}

export default TabBar