import React from 'react'
import { motion } from 'framer-motion'

const HomeScreen = () => {
  const features = [
    {
      title: 'Neural Matching',
      description: 'Advanced AI finds your ideal study companion',
      symbol: '\u2728',
    },
    {
      title: 'Live Sync',
      description: 'Synchronized sessions and real-time collaboration',
      symbol: '\u23F1',
    },
    {
      title: 'Spatial Awareness',
      description: 'Location-based matching down to the table',
      symbol: '\uD83D\uDCCD',
    },
  ]

  return (
    <div className="min-h-screen p-8 flex flex-col justify-center items-center relative">
      <motion.div
        className="text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-6 mb-8"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              className="w-16 h-16 relative"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl" />
              <div className="absolute inset-2 bg-white/5 backdrop-blur-xl rounded-xl" />
              <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-lg" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-extralight text-white tracking-tight">Aithena</h1>
              <div className="w-24 h-px bg-gradient-to-r from-white/40 to-transparent mt-2" />
            </div>
          </motion.div>
          <motion.p
            className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            A neural student network with <span className="text-white/90 font-normal">stellar design</span>
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <div className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] shadow-2xl hover:bg-white/[0.04] transition-all duration-500">
                <div className="absolute inset-0 rounded-3xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-4xl text-white/70 font-extralight mb-6 group-hover:text-white/90 transition-colors duration-500">
                    {feature.symbol}
                  </div>
                  <h3 className="text-xl font-light text-white/90 mb-4 tracking-wide">{feature.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed text-sm">{feature.description}</p>
                </div>
                <motion.div className="absolute inset-0 rounded-3xl border border-white/20 opacity-0 group-hover:opacity-100" transition={{ duration: 0.5 }} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
          <motion.button
            className="group relative px-12 py-4 bg-white/[0.08] backdrop-blur-3xl rounded-full border border-white/[0.12] text-white/90 font-light tracking-wide hover:bg-white/[0.12] transition-all duration-500"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Begin Matching</span>
            <motion.div className="absolute inset-0 rounded-full bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
          <motion.div className="text-white/30 text-sm font-light tracking-wider" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            NOTE to judges: Since we do NOT have an actual student database, yet :/... We will be using Gemini as different personas in our groups section, and would be using a json database for the entire application! Also,
            
            
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HomeScreen

