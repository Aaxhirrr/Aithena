import { useCallback, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Custom hook for psychoacoustic audio feedback
 * Provides subtle audio cues for enhanced UX without being intrusive
 */
export function useAudioFeedback() {
  const audioContext = useRef(null)
  const gainNode = useRef(null)
  const audioCache = useRef(new Map())
  const { settings } = useSettingsStore()

  // Initialize Web Audio API
  useEffect(() => {
    if (!settings.audioFeedback) return

    try {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
      gainNode.current = audioContext.current.createGain()
      gainNode.current.connect(audioContext.current.destination)
      gainNode.current.gain.value = 0.15 // Global volume
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [settings.audioFeedback])

  // Preload and cache audio files
  const preloadAudio = useCallback(async (src) => {
    if (!audioContext.current || audioCache.current.has(src)) return

    try {
      const response = await fetch(src)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer)
      audioCache.current.set(src, audioBuffer)
    } catch (error) {
      console.warn(`Failed to preload audio: ${src}`, error)
    }
  }, [])

  // Create synthetic psychoacoustic ticks
  const createTick = useCallback((frequency = 800, duration = 6) => {
    if (!audioContext.current || !settings.audioFeedback) return

    const oscillator = audioContext.current.createOscillator()
    const envelope = audioContext.current.createGain()
    
    oscillator.connect(envelope)
    envelope.connect(gainNode.current)
    
    // Sharp attack, quick decay for crisp tick
    oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime)
    envelope.gain.setValueAtTime(0, audioContext.current.currentTime)
    envelope.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.001)
    envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration / 1000)
    
    oscillator.start(audioContext.current.currentTime)
    oscillator.stop(audioContext.current.currentTime + duration / 1000)
  }, [settings.audioFeedback])

  // Create success chime (two-note harmony)
  const createSuccessChime = useCallback(() => {
    if (!audioContext.current || !settings.audioFeedback) return

    const notes = [523.25, 659.25] // C5, E5
    const startTime = audioContext.current.currentTime
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.current.createOscillator()
      const envelope = audioContext.current.createGain()
      
      oscillator.connect(envelope)
      envelope.connect(gainNode.current)
      
      oscillator.frequency.setValueAtTime(frequency, startTime)
      oscillator.type = 'sine'
      
      envelope.gain.setValueAtTime(0, startTime)
      envelope.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
      envelope.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
      
      oscillator.start(startTime + index * 0.035) // 35ms interval
      oscillator.stop(startTime + 0.4)
    })
  }, [settings.audioFeedback])

  // Create ripple effect sound
  const createRippleSound = useCallback(() => {
    if (!audioContext.current || !settings.audioFeedback) return

    const oscillator = audioContext.current.createOscillator()
    const envelope = audioContext.current.createGain()
    const filter = audioContext.current.createBiquadFilter()
    
    oscillator.connect(filter)
    filter.connect(envelope)
    envelope.connect(gainNode.current)
    
    // Frequency sweep for ripple effect
    oscillator.frequency.setValueAtTime(200, audioContext.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.current.currentTime + 1.2)
    
    // Low-pass filter for water-like sound
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, audioContext.current.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, audioContext.current.currentTime + 1.2)
    
    // Gentle envelope
    envelope.gain.setValueAtTime(0, audioContext.current.currentTime)
    envelope.gain.linearRampToValueAtTime(0.1, audioContext.current.currentTime + 0.1)
    envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 1.2)
    
    oscillator.start(audioContext.current.currentTime)
    oscillator.stop(audioContext.current.currentTime + 1.2)
  }, [settings.audioFeedback])

  // Play cached audio file
  const playCachedAudio = useCallback((src) => {
    if (!audioContext.current || !settings.audioFeedback) return

    const audioBuffer = audioCache.current.get(src)
    if (!audioBuffer) {
      console.warn(`Audio not cached: ${src}`)
      return
    }

    const source = audioContext.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(gainNode.current)
    source.start()
  }, [settings.audioFeedback])

  // Main play audio function
  const playAudio = useCallback((type, options = {}) => {
    if (!settings.audioFeedback) return

    // Resume audio context if suspended (autoplay policy)
    if (audioContext.current?.state === 'suspended') {
      audioContext.current.resume()
    }

    switch (type) {
      case 'tick':
        createTick(options.frequency, options.duration)
        break
      
      case 'swipe-right':
        createTick(880, 8) // Higher pitch for positive action
        break
      
      case 'swipe-left':
        createTick(440, 8) // Lower pitch for negative action
        break
      
      case 'match':
      case 'success-chime':
        createSuccessChime()
        break
      
      case 'check-in':
      case 'check-in-ripple':
        createRippleSound()
        break
      
      case 'error':
        createTick(200, 20) // Low, longer tone for errors
        break
      
      case 'notification':
        createTick(1000, 10) // Bright attention tone
        break
      
      default:
        // Try to play from cache
        playCachedAudio(`/audio/${type}.mp3`)
    }
  }, [settings.audioFeedback, createTick, createSuccessChime, createRippleSound, playCachedAudio])

  // Preload common sounds on mount
  useEffect(() => {
    if (settings.audioFeedback) {
      const soundsToPreload = [
        '/audio/success-chime.mp3',
        '/audio/swipe-tick.mp3',
        '/audio/check-in-ripple.mp3'
      ]
      
      soundsToPreload.forEach(preloadAudio)
    }
  }, [settings.audioFeedback, preloadAudio])

  // Haptic feedback fallback for mobile
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator && settings.audioFeedback) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 50, 10],
        error: [50, 50, 50]
      }
      
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }, [settings.audioFeedback])

  // Combined audio + haptic feedback
  const feedback = useCallback((type, options = {}) => {
    playAudio(type, options)
    
    // Add haptic feedback for key interactions
    const hapticMap = {
      'swipe-right': 'light',
      'swipe-left': 'light',
      'match': 'success',
      'check-in': 'medium',
      'error': 'error'
    }
    
    if (hapticMap[type]) {
      hapticFeedback(hapticMap[type])
    }
  }, [playAudio, hapticFeedback])

  return {
    playAudio,
    feedback,
    hapticFeedback,
    preloadAudio,
    // Utility functions
    isEnabled: settings.audioFeedback,
    setVolume: (volume) => {
      if (gainNode.current) {
        gainNode.current.gain.value = Math.max(0, Math.min(1, volume))
      }
    }
  }
}