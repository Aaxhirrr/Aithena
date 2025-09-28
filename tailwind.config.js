/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // OKLCH color tokens for perceptual scaling
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Base indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75'
        },
        accent: {
          50: '#f0fdf9',
          100: '#ccfdf7',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        glass: {
          // Soft glass surfaces with backdrop blur
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)'
        },
        neural: {
          // Neural network inspired colors
          synapse: '#00f5ff',
          pulse: '#ff006e',
          dendrite: '#8338ec',
          axon: '#3a86ff'
        }
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'monospace']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px'
      },
      animation: {
        // FLIP animations
        'flip-in': 'flipIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        'flip-out': 'flipOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        // Spring physics
        'spring-bounce': 'springBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring-gentle': 'springGentle 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // Presence orbs
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Ink ripples
        'ripple': 'ripple 1.2s cubic-bezier(0, 0, 0.2, 1)',
        'ripple-large': 'rippleLarge 2s cubic-bezier(0, 0, 0.2, 1)',
        // Rationale tickers
        'ticker-slide': 'tickerSlide 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // Heat haze
        'haze': 'haze 8s ease-in-out infinite',
        // Proximity threads
        'breathe': 'breathe 3s ease-in-out infinite',
        // Check-in effects
        'check-in-glow': 'checkInGlow 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        // Neural activity
        'neural-pulse': 'neuralPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'synapse-fire': 'synapseFire 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)'
      },
      keyframes: {
        flipIn: {
          '0%': { 
            transform: 'perspective(400px) rotateY(-90deg)',
            opacity: '0'
          },
          '100%': { 
            transform: 'perspective(400px) rotateY(0deg)',
            opacity: '1'
          }
        },
        flipOut: {
          '0%': { 
            transform: 'perspective(400px) rotateY(0deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'perspective(400px) rotateY(90deg)',
            opacity: '0'
          }
        },
        springBounce: {
          '0%': { 
            transform: 'scale(0.3) rotate(-5deg)',
            opacity: '0'
          },
          '50%': { 
            transform: 'scale(1.1) rotate(2deg)'
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '1'
          }
        },
        springGentle: {
          '0%': { 
            transform: 'scale(0.8)',
            opacity: '0'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.8'
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0'
          }
        },
        rippleLarge: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.6'
          },
          '100%': {
            transform: 'scale(8)',
            opacity: '0'
          }
        },
        tickerSlide: {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0'
          },
          '20%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '80%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          }
        },
        haze: {
          '0%, 100%': { 
            transform: 'translateX(0) scale(1)',
            opacity: '0.02'
          },
          '50%': { 
            transform: 'translateX(2px) scale(1.05)',
            opacity: '0.06'
          }
        },
        breathe: {
          '0%, 100%': { 
            opacity: '0.4',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)'
          }
        },
        checkInGlow: {
          '0%': {
            boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.7)',
            transform: 'scale(0.95)'
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(99, 102, 241, 0)',
            transform: 'scale(1.05)'
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)',
            transform: 'scale(1)'
          }
        },
        neuralPulse: {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)'
          }
        },
        synapseFire: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.5)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)'
          },
          '100%': {
            opacity: '0.8',
            transform: 'scale(1)'
          }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'neural': '0 0 30px rgba(131, 56, 236, 0.5)',
        'synapse': '0 0 25px rgba(0, 245, 255, 0.6)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-grid': 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%%" height="100%%" filter="url(%23noiseFilter)" opacity="0.02"/%3E%3C/svg%3E")'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for glass morphism
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-light': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-medium': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(15px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-heavy': {
          'background': 'rgba(255, 255, 255, 0.2)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.4)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(0, 0, 0, 0.2)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}