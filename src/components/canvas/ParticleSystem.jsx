import React, { useRef, useEffect, useCallback } from 'react'
import { useDeviceTilt } from '@/hooks/useDeviceTilt'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Particle system for ambient visual effects
 * Creates floating particles that respond to user interactions
 */
const ParticleSystem = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, isActive: false })
  const { tiltX, tiltY } = useDeviceTilt()
  const { settings } = useSettingsStore()

  // Particle system parameters
  const particleCount = 80
  const maxSpeed = 0.5
  const mouseInfluence = 100
  const respawnRate = 0.02

  // Particle class
  class Particle {
    constructor(width, height) {
      this.reset(width, height)
      this.age = Math.random() * 1000 // Random starting age
      this.maxAge = 3000 + Math.random() * 2000
    }

    reset(width, height) {
      this.x = Math.random() * width
      this.y = height + Math.random() * 100 // Start below screen
      this.vx = (Math.random() - 0.5) * maxSpeed
      this.vy = -Math.random() * maxSpeed - 0.5 // Always moving up
      this.size = Math.random() * 3 + 1
      this.alpha = 0
      this.targetAlpha = Math.random() * 0.4 + 0.1
      this.age = 0
      this.hue = 240 + Math.random() * 60 // Blue to purple range
      this.pulse = Math.random() * Math.PI * 2
      this.pulseSpeed = 0.01 + Math.random() * 0.02
    }

    update(width, height, deltaTime, mouse, tiltX, tiltY) {
      this.age += deltaTime

      // Basic movement
      this.x += this.vx
      this.y += this.vy

      // Apply device tilt influence
      if (!settings.reducedMotion) {
        this.vx += tiltX * 0.001
        this.vy += tiltY * 0.001
      }

      // Mouse interaction
      if (mouse.isActive) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouseInfluence) {
          const force = (1 - distance / mouseInfluence) * 0.02
          this.vx += dx * force
          this.vy += dy * force
        }
      }

      // Fade in when spawning
      if (this.alpha < this.targetAlpha) {
        this.alpha += 0.01
      }

      // Age-based fading
      const lifeProgress = this.age / this.maxAge
      if (lifeProgress > 0.8) {
        this.alpha *= 0.98 // Fade out in final 20% of life
      }

      // Update pulse
      this.pulse += this.pulseSpeed

      // Respawn if dead or out of bounds
      if (this.age > this.maxAge || this.y < -50 || this.x < -50 || this.x > width + 50) {
        this.reset(width, height)
      }

      // Velocity damping
      this.vx *= 0.999
      this.vy *= 0.999

      // Speed limit
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed
        this.vy = (this.vy / speed) * maxSpeed
      }
    }

    render(ctx) {
      if (this.alpha < 0.01) return

      const pulseSize = Math.sin(this.pulse) * 0.2 + 1
      const currentSize = this.size * pulseSize
      const currentAlpha = this.alpha * (Math.sin(this.pulse * 0.7) * 0.1 + 0.9)

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, currentSize * 4
      )
      glowGradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${currentAlpha * 0.8})`)
      glowGradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, ${currentAlpha * 0.3})`)
      glowGradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`)

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, currentSize * 4, 0, Math.PI * 2)
      ctx.fill()

      // Core particle
      const coreGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, currentSize
      )
      coreGradient.addColorStop(0, `hsla(${this.hue}, 80%, 80%, ${currentAlpha})`)
      coreGradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, ${currentAlpha * 0.5})`)

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Initialize particles
  const initializeParticles = useCallback((width, height) => {
    particlesRef.current = Array.from(
      { length: particleCount },
      () => new Particle(width, height)
    )
  }, [particleCount])

  // Handle mouse movement
  const handleMouseMove = useCallback((event) => {
    mouseRef.current.x = event.clientX
    mouseRef.current.y = event.clientY
    mouseRef.current.isActive = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.isActive = false
  }, [])

  // Render frame
  const render = useCallback((ctx, width, height, deltaTime) => {
    // Clear canvas with subtle trail
    ctx.fillStyle = 'rgba(15, 15, 35, 0.02)'
    ctx.fillRect(0, 0, width, height)

    // Update and render particles
    particlesRef.current.forEach(particle => {
      particle.update(width, height, deltaTime, mouseRef.current, tiltX, tiltY)
      particle.render(ctx)
    })

    // Occasionally spawn new particles
    if (Math.random() < respawnRate) {
      const randomIndex = Math.floor(Math.random() * particlesRef.current.length)
      particlesRef.current[randomIndex].reset(width, height)
    }
  }, [tiltX, tiltY, respawnRate])

  // Animation loop
  let lastTime = 0
  const animate = useCallback((currentTime) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    render(ctx, width, height, deltaTime)

    if (!settings.reducedMotion) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [render, settings.reducedMotion])

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { innerWidth, innerHeight } = window
    const dpr = window.devicePixelRatio || 1

    canvas.width = innerWidth * dpr
    canvas.height = innerHeight * dpr
    canvas.style.width = `${innerWidth}px`
    canvas.style.height = `${innerHeight}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    initializeParticles(innerWidth, innerHeight)
  }, [initializeParticles])

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    handleResize()

    if (!settings.reducedMotion) {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [handleResize, animate, handleMouseMove, handleMouseLeave, settings.reducedMotion])

  // Handle reduced motion setting changes
  useEffect(() => {
    if (settings.reducedMotion) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    } else {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
  }, [settings.reducedMotion, animate])

  return (
    <canvas
      ref={canvasRef}
      className="canvas-layer fixed inset-0 pointer-events-none z-0"
      style={{
        mixBlendMode: 'soft-light',
        opacity: settings.reducedMotion ? 0.2 : 0.4
      }}
    />
  )
}

export default ParticleSystem