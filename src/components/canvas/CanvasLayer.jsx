import React, { useRef, useEffect, useCallback } from 'react'
import { useDeviceTilt } from '@/hooks/useDeviceTilt'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Canvas layer for background visual effects
 * Renders neural networks, heat hazes, and ambient particles
 */
const CanvasLayer = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const nodesRef = useRef([])
  const connectionsRef = useRef([])
  const { tiltX, tiltY } = useDeviceTilt()
  const { settings } = useSettingsStore()

  // Neural network parameters
  const nodeCount = 50
  const maxConnections = 3
  const connectionDistance = 150
  const pulseSpeed = 0.02
  const driftSpeed = 0.001

  // Initialize neural nodes
  const initializeNodes = useCallback((width, height) => {
    nodesRef.current = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      originalX: 0,
      originalY: 0,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.3 + 0.1,
      color: `hsl(${240 + Math.random() * 60}, 70%, ${50 + Math.random() * 30}%)`
    }))

    // Store original positions for tilt effects
    nodesRef.current.forEach(node => {
      node.originalX = node.x
      node.originalY = node.y
    })
  }, [nodeCount])

  // Update node connections
  const updateConnections = useCallback(() => {
    connectionsRef.current = []
    
    for (let i = 0; i < nodesRef.current.length; i++) {
      const node = nodesRef.current[i]
      let connectionCount = 0
      
      for (let j = i + 1; j < nodesRef.current.length && connectionCount < maxConnections; j++) {
        const other = nodesRef.current[j]
        const distance = Math.sqrt(
          Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
        )
        
        if (distance < connectionDistance) {
          connectionsRef.current.push({
            from: node,
            to: other,
            distance,
            alpha: (1 - distance / connectionDistance) * 0.3,
            pulse: Math.random() * Math.PI * 2
          })
          connectionCount++
        }
      }
    }
  }, [connectionDistance, maxConnections])

  // Render frame
  const render = useCallback((ctx, width, height, time) => {
    // Clear with slight trail effect for motion blur
    ctx.fillStyle = 'rgba(15, 15, 35, 0.05)'
    ctx.fillRect(0, 0, width, height)

    // Update nodes
    nodesRef.current.forEach(node => {
      // Drift movement
      node.x += node.vx
      node.y += node.vy
      
      // Apply device tilt parallax
      if (!settings.reducedMotion) {
        node.x = node.originalX + (node.x - node.originalX) + tiltX * 0.3
        node.y = node.originalY + (node.y - node.originalY) + tiltY * 0.3
      }
      
      // Boundary reflection
      if (node.x <= 0 || node.x >= width) node.vx *= -1
      if (node.y <= 0 || node.y >= height) node.vy *= -1
      
      // Keep in bounds
      node.x = Math.max(0, Math.min(width, node.x))
      node.y = Math.max(0, Math.min(height, node.y))
      
      // Update pulse
      node.pulse += pulseSpeed
      
      // Update original position for next tilt calculation
      if (Math.abs(node.vx) > 0.01 || Math.abs(node.vy) > 0.01) {
        node.originalX += node.vx * driftSpeed
        node.originalY += node.vy * driftSpeed
      }
    })

    // Update connections
    updateConnections()

    // Render connections first (behind nodes)
    connectionsRef.current.forEach(connection => {
      const pulseAlpha = Math.sin(connection.pulse + time * 0.001) * 0.1 + 0.9
      const alpha = connection.alpha * pulseAlpha
      
      if (alpha > 0.01) {
        const gradient = ctx.createLinearGradient(
          connection.from.x, connection.from.y,
          connection.to.x, connection.to.y
        )
        
        gradient.addColorStop(0, `rgba(99, 102, 241, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.8})`)
        gradient.addColorStop(1, `rgba(217, 70, 239, ${alpha * 0.6})`)
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.lineCap = 'round'
        
        ctx.beginPath()
        ctx.moveTo(connection.from.x, connection.from.y)
        ctx.lineTo(connection.to.x, connection.to.y)
        ctx.stroke()
      }
      
      connection.pulse += pulseSpeed * 0.5
    })

    // Render nodes
    nodesRef.current.forEach(node => {
      const pulseSize = Math.sin(node.pulse) * 0.3 + 1
      const currentRadius = node.radius * pulseSize
      const currentAlpha = node.alpha * (Math.sin(node.pulse * 0.7) * 0.2 + 0.8)
      
      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, currentRadius * 3
      )
      glowGradient.addColorStop(0, node.color.replace(')', `, ${currentAlpha})`))
      glowGradient.addColorStop(1, node.color.replace(')', ', 0)'))
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, currentRadius * 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Core node
      ctx.fillStyle = node.color.replace(')', `, ${currentAlpha * 2})`)
      ctx.beginPath()
      ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [tiltX, tiltY, settings.reducedMotion, updateConnections, pulseSpeed, driftSpeed])

  // Animation loop
  const animate = useCallback((time) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    render(ctx, width, height, time)
    
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

    // Set canvas size
    canvas.width = innerWidth * dpr
    canvas.height = innerHeight * dpr
    canvas.style.width = `${innerWidth}px`
    canvas.style.height = `${innerHeight}px`

    // Scale context for high DPI
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Reinitialize nodes for new dimensions
    initializeNodes(innerWidth, innerHeight)
  }, [initializeNodes])

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initial setup
    handleResize()
    
    // Start animation loop
    if (!settings.reducedMotion) {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Add resize listener
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [handleResize, animate, settings.reducedMotion])

  // Pause/resume animation based on settings
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
        mixBlendMode: 'screen',
        opacity: settings.reducedMotion ? 0.3 : 0.6
      }}
    />
  )
}

export default CanvasLayer