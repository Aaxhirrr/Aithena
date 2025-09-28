import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for performance monitoring and jank detection
 * Monitors frame times and provides insights for optimization
 */
export function usePerformanceMonitor() {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef([])
  const jankThreshold = 16.67 // 60fps threshold
  const isDevMode = import.meta.env.DEV

  // Frame rate monitoring
  const measureFrameRate = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTime.current
    
    frameCount.current++
    
    if (frameCount.current % 60 === 0) { // Measure every 60 frames
      const fps = 1000 / delta
      fpsHistory.current.push(fps)
      
      // Keep only last 100 measurements
      if (fpsHistory.current.length > 100) {
        fpsHistory.current.shift()
      }
      
      // Warn about low FPS in development
      if (isDevMode && fps < 50) {
        console.warn(`🐌 Low FPS detected: ${fps.toFixed(1)}fps`)
      }
    }
    
    // Detect frame drops (jank)
    if (delta > jankThreshold && isDevMode) {
      console.warn(`🔴 Frame drop detected: ${delta.toFixed(2)}ms (${(1000/delta).toFixed(1)}fps)`)
    }
    
    lastTime.current = now
    requestAnimationFrame(measureFrameRate)
  }, [isDevMode, jankThreshold])

  // Memory usage monitoring
  const monitorMemory = useCallback(() => {
    if (!performance.memory || !isDevMode) return

    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
    
    // Warn if memory usage is high
    const memoryUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100
    
    if (memoryUsagePercent > 80) {
      console.warn(`🧠 High memory usage: ${memoryUsagePercent.toFixed(1)}% (${(usedJSHeapSize / 1024 / 1024).toFixed(1)}MB)`)
    }
  }, [isDevMode])

  // Long task detection
  const detectLongTasks = useCallback(() => {
    if (!('PerformanceObserver' in window) || !isDevMode) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`⏱️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['longtask'] })
      return () => observer.disconnect()
    } catch (e) {
      // longtask not supported in all browsers
      return () => {}
    }
  }, [isDevMode])

  // Resource timing monitoring
  const monitorResources = useCallback(() => {
    if (!isDevMode) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Warn about slow loading resources
        if (entry.duration > 1000) {
          console.warn(`📦 Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
        }
        
        // Warn about large resources
        if (entry.transferSize > 1024 * 1024) { // 1MB
          console.warn(`📈 Large resource: ${entry.name} is ${(entry.transferSize / 1024 / 1024).toFixed(2)}MB`)
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    return () => observer.disconnect()
  }, [isDevMode])

  // Layout thrashing detection
  const detectLayoutThrashing = useCallback(() => {
    if (!isDevMode) return

    let layoutCount = 0
    let styleCount = 0
    
    const originalGetComputedStyle = window.getComputedStyle
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect
    
    // Monkey patch to detect excessive style/layout calculations
    window.getComputedStyle = function(...args) {
      styleCount++
      return originalGetComputedStyle.apply(this, args)
    }
    
    Element.prototype.getBoundingClientRect = function(...args) {
      layoutCount++
      return originalGetBoundingClientRect.apply(this, args)
    }
    
    // Check for excessive calculations every second
    const intervalId = setInterval(() => {
      if (styleCount > 1000 || layoutCount > 500) {
        console.warn(`🎨 Potential layout thrashing: ${styleCount} style, ${layoutCount} layout calculations`)
      }
      styleCount = 0
      layoutCount = 0
    }, 1000)
    
    return () => {
      clearInterval(intervalId)
      window.getComputedStyle = originalGetComputedStyle
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
    }
  }, [isDevMode])

  // Component render performance
  const measureRenderTime = useCallback((componentName) => {
    if (!isDevMode) return { start: () => {}, end: () => {} }

    return {
      start: () => performance.mark(`${componentName}-render-start`),
      end: () => {
        performance.mark(`${componentName}-render-end`)
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        )
        
        const measure = performance.getEntriesByName(`${componentName}-render`).pop()
        if (measure && measure.duration > 16) {
          console.warn(`⚛️ Slow component render: ${componentName} took ${measure.duration.toFixed(2)}ms`)
        }
      }
    }
  }, [isDevMode])

  // Get performance metrics
  const getMetrics = useCallback(() => {
    if (!isDevMode) return null

    const avgFps = fpsHistory.current.length > 0 
      ? fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length 
      : 0

    const memory = performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    } : null

    return {
      fps: {
        current: fpsHistory.current[fpsHistory.current.length - 1] || 0,
        average: avgFps,
        history: [...fpsHistory.current]
      },
      memory,
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0
      } : null
    }
  }, [isDevMode])

  useEffect(() => {
    if (!isDevMode) return

    // Start monitoring
    const cleanups = [
      requestAnimationFrame(measureFrameRate),
      detectLongTasks(),
      monitorResources(),
      detectLayoutThrashing()
    ].filter(Boolean)

    // Memory monitoring interval
    const memoryInterval = setInterval(monitorMemory, 5000)

    // Performance logging
    console.log('🚀 Performance monitoring started')

    return () => {
      cleanups.forEach(cleanup => cleanup())
      clearInterval(memoryInterval)
    }
  }, [isDevMode, measureFrameRate, detectLongTasks, monitorResources, detectLayoutThrashing, monitorMemory])

  return {
    getMetrics,
    measureRenderTime,
    // Utility to create performance marks
    mark: (name) => isDevMode && performance.mark(name),
    measure: (name, start, end) => isDevMode && performance.measure(name, start, end)
  }
}