import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'

const LoginScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Brain className="w-16 h-16 text-primary-500" />
          <h1 className="text-5xl font-bold text-gradient">Aithena</h1>
        </motion.div>
        
        <p className="text-white/80 mb-8">
          AI-powered study partner matching
        </p>
        
        <div className="glass-card rounded-2xl p-8">
          <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Welcome!</h2>
          <p className="text-white/70 text-sm">
            Authentication system coming soon. For now, enjoy the insane background effects!
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginScreen