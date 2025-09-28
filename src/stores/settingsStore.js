import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Settings state
      settings: {
        theme: 'dark',
        audioFeedback: true,
        reducedMotion: false,
        notifications: true,
        privacyLevel: 'campus', // campus, library, building, room
        autoCheckIn: false,
        showPresence: true,
        soundVolume: 0.3,
        hapticFeedback: true
      },

      // Actions
      updateSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value
          }
        }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        }))
      },

      resetSettings: () => {
        set({
          settings: {
            theme: 'dark',
            audioFeedback: true,
            reducedMotion: false,
            notifications: true,
            privacyLevel: 'campus',
            autoCheckIn: false,
            showPresence: true,
            soundVolume: 0.3,
            hapticFeedback: true
          }
        })
      },

      // Detect system preferences
      detectSystemPreferences: () => {
        const settings = {}

        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          settings.reducedMotion = true
        }

        // Detect color scheme preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          settings.theme = 'light'
        }

        if (Object.keys(settings).length > 0) {
          get().updateSettings(settings)
        }
      }
    }),
    {
      name: 'aithena-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
)

export { useSettingsStore }