import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    white: 'text-white'
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer ring */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${colorClasses[color]}`}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Middle ring */}
      <motion.div
        className={`absolute inset-1 rounded-full border-2 border-transparent ${colorClasses[color]} opacity-60`}
        style={{
          borderBottomColor: 'currentColor',
          borderLeftColor: 'currentColor'
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className={`absolute inset-2 rounded-full border border-transparent ${colorClasses[color]} opacity-30`}
        style={{
          borderTopColor: 'currentColor'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Center pulse */}
      <motion.div
        className={`absolute inset-3 rounded-full ${colorClasses[color]} opacity-40`}
        style={{ backgroundColor: 'currentColor' }}
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Neural sparks */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${colorClasses[color]}`}
          style={{
            backgroundColor: 'currentColor',
            top: '50%',
            left: '50%',
            transformOrigin: '0 0'
          }}
          animate={{
            rotate: [0, 360],
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
          style={{
            transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-${size === 'large' ? '12px' : size === 'medium' ? '8px' : '6px'})`
          }}
        />
      ))}
    </div>
  )
}

export default LoadingSpinner