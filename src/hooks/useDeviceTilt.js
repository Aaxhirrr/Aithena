import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Custom hook for device tilt parallax effects
 * Creates subtle 3D effects based on device orientation
 */
export function useDeviceTilt() {
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [isSupported, setIsSupported] = useState(false)
  const { settings } = useSettingsStore()

  // Smoothing and clamping parameters
  const maxTilt = 12 // Maximum tilt in degrees
  const smoothing = 0.1 // Smoothing factor for movement

  const handleDeviceOrientation = useCallback((event) => {
    if (settings.reducedMotion) return

    const { beta, gamma } = event
    
    if (beta !== null && gamma !== null) {
      // Clamp values to prevent extreme tilting
      const clampedBeta = Math.max(-maxTilt, Math.min(maxTilt, beta))
      const clampedGamma = Math.max(-maxTilt, Math.min(maxTilt, gamma))
      
      // Apply smoothing
      setTiltX(prev => prev + (clampedGamma - prev) * smoothing)
      setTiltY(prev => prev + (clampedBeta - prev) * smoothing)
    }
  }, [settings.reducedMotion, maxTilt, smoothing])

  // Mouse movement fallback for desktop
  const handleMouseMove = useCallback((event) => {
    if (settings.reducedMotion || isSupported) return

    const { clientX, clientY } = event
    const { innerWidth, innerHeight } = window
    
    // Convert mouse position to tilt values (-maxTilt to +maxTilt)
    const mouseX = (clientX / innerWidth - 0.5) * 2 * maxTilt
    const mouseY = (clientY / innerHeight - 0.5) * 2 * maxTilt
    
    // Apply smoothing
    setTiltX(prev => prev + (mouseX - prev) * smoothing * 0.3) // Reduced for mouse
    setTiltY(prev => prev + (mouseY - prev) * smoothing * 0.3)
  }, [settings.reducedMotion, isSupported, maxTilt, smoothing])

  useEffect(() => {
    // Check for device orientation support
    if ('DeviceOrientationEvent' in window) {
      // Request permission on iOS 13+
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              setIsSupported(true)
              window.addEventListener('deviceorientation', handleDeviceOrientation)
            } else {
              // Fallback to mouse for desktop-like experience
              window.addEventListener('mousemove', handleMouseMove)
            }
          })
          .catch(() => {
            window.addEventListener('mousemove', handleMouseMove)
          })
      } else {
        // Non-iOS devices
        setIsSupported(true)
        window.addEventListener('deviceorientation', handleDeviceOrientation)
      }
    } else {
      // Fallback to mouse movement
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleDeviceOrientation, handleMouseMove])

  // Reset on reduced motion preference change
  useEffect(() => {
    if (settings.reducedMotion) {
      setTiltX(0)
      setTiltY(0)
    }
  }, [settings.reducedMotion])

  return {
    tiltX,
    tiltY,
    isSupported,
    // Utility functions for applying tilt effects
    getTiltStyle: (intensity = 1, perspective = 1000) => ({
      transform: `perspective(${perspective}px) rotateX(${tiltY * intensity * 0.5}deg) rotateY(${tiltX * intensity * 0.5}deg)`,
      transition: settings.reducedMotion ? 'none' : 'transform 0.1s ease-out'
    }),
    getParallaxStyle: (depth = 1) => ({
      transform: `translate3d(${tiltX * depth * 0.5}px, ${tiltY * depth * 0.5}px, 0)`,
      transition: settings.reducedMotion ? 'none' : 'transform 0.1s ease-out'
    })
  }
}