import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { auth, db } from '@/services/firebase/config'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'

// Google Auth provider configuration
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly')

const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    userProfile: null,
    isLoading: true,
    isAuthenticated: false,
    authError: null,

    // Actions
    initialize: async () => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          performance.mark('auth-check-start')
          
          if (user) {
            try {
              // Get or create user profile
              const profile = await get().getUserProfile(user.uid)
              
              set({
                user,
                userProfile: profile,
                isAuthenticated: true,
                isLoading: false,
                authError: null
              })
              
              // Update last seen
              await get().updateLastSeen()
              
              performance.mark('auth-check-end')
              performance.measure('auth-check', 'auth-check-start', 'auth-check-end')
            } catch (error) {
              console.error('Error getting user profile:', error)
              set({
                user: null,
                userProfile: null,
                isAuthenticated: false,
                isLoading: false,
                authError: error.message
              })
            }
          } else {
            set({
              user: null,
              userProfile: null,
              isAuthenticated: false,
              isLoading: false,
              authError: null
            })
          }
          
          unsubscribe()
          resolve()
        })
      })
    },

    signInWithGoogle: async () => {
      set({ isLoading: true, authError: null })
      
      try {
        performance.mark('google-signin-start')
        
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        // Create or update user profile
        const profile = await get().createUserProfile(user)
        
        set({
          user,
          userProfile: profile,
          isAuthenticated: true,
          isLoading: false,
          authError: null
        })
        
        performance.mark('google-signin-end')
        performance.measure('google-signin', 'google-signin-start', 'google-signin-end')
        
        return { success: true, user, profile }
      } catch (error) {
        console.error('Google sign-in error:', error)
        
        set({
          isLoading: false,
          authError: error.message
        })
        
        return { success: false, error: error.message }
      }
    },

    signOut: async () => {
      set({ isLoading: true })
      
      try {
        await signOut(auth)
        
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          authError: null
        })
        
        return { success: true }
      } catch (error) {
        console.error('Sign out error:', error)
        
        set({
          isLoading: false,
          authError: error.message
        })
        
        return { success: false, error: error.message }
      }
    },

    getUserProfile: async (userId) => {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (userDoc.exists()) {
        return userDoc.data()
      }
      
      return null
    },

    createUserProfile: async (user) => {
      const userRef = doc(db, 'users', user.uid)
      const existingDoc = await getDoc(userRef)
      
      const baseProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        // Aithena-specific fields
        isProfileComplete: false,
        pseudonym: generatePseudonym(),
        privacyLevel: 'campus', // campus, library, building, room
        studyPreferences: {
          preferredTimes: [],
          studyMethods: [],
          maxGroupSize: 2,
          noiseLevel: 'quiet'
        },
        currentCourses: [],
        academicInfo: {
          major: '',
          year: '',
          gpa: null
        },
        location: {
          campus: '',
          building: '',
          room: '',
          coordinates: null,
          lastUpdated: null
        },
        availability: {
          schedule: {},
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        matchingPreferences: {
          sameLevel: false,
          complementarySkills: true,
          proximityWeight: 0.7,
          scheduleWeight: 0.8,
          courseWeight: 0.9
        },
        stats: {
          totalSessions: 0,
          totalHours: 0,
          averageRating: 0,
          completedGoals: 0
        },
        settings: {
          notifications: true,
          audioFeedback: true,
          reducedMotion: false,
          theme: 'dark'
        }
      }
      
      if (existingDoc.exists()) {
        // Update existing profile
        const updates = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          updatedAt: serverTimestamp(),
          lastSeen: serverTimestamp()
        }
        
        await updateDoc(userRef, updates)
        return { ...existingDoc.data(), ...updates }
      } else {
        // Create new profile
        const newProfile = {
          ...baseProfile,
          createdAt: serverTimestamp()
        }
        
        await setDoc(userRef, newProfile)
        return newProfile
      }
    },

    updateProfile: async (updates) => {
      const { user } = get()
      if (!user) return { success: false, error: 'Not authenticated' }
      
      try {
        const userRef = doc(db, 'users', user.uid)
        const updateData = {
          ...updates,
          updatedAt: serverTimestamp()
        }
        
        await updateDoc(userRef, updateData)
        
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            ...updateData
          }
        }))
        
        return { success: true }
      } catch (error) {
        console.error('Profile update error:', error)
        return { success: false, error: error.message }
      }
    },

    updateLastSeen: async () => {
      const { user } = get()
      if (!user) return
      
      try {
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          lastSeen: serverTimestamp()
        })
      } catch (error) {
        console.error('Last seen update error:', error)
      }
    },

    // Pseudonym management for privacy
    rotatePseudonym: async () => {
      const newPseudonym = generatePseudonym()
      const result = await get().updateProfile({ pseudonym: newPseudonym })
      
      if (result.success) {
        // Play audio feedback
        const audio = new Audio('/audio/success-chime.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ignore autoplay restrictions
      }
      
      return result
    },

    // Clear auth error
    clearError: () => set({ authError: null })
  }))
)

// Helper function to generate fun pseudonyms
function generatePseudonym() {
  const adjectives = [
    'Quantum', 'Neural', 'Cosmic', 'Digital', 'Stellar', 'Crypto', 'Cyber', 'Atomic',
    'Photon', 'Binary', 'Matrix', 'Vector', 'Plasma', 'Holographic', 'Synthetic', 'Neon'
  ]
  
  const nouns = [
    'Scholar', 'Thinker', 'Learner', 'Mind', 'Brain', 'Genius', 'Student', 'Researcher',
    'Solver', 'Explorer', 'Discoverer', 'Innovator', 'Creator', 'Builder', 'Hacker', 'Wizard'
  ]
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999) + 1
  
  return `${adj}${noun}${num}`
}

// Subscribe to auth state changes for analytics
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Track sign in
      performance.mark('user-authenticated')
    }
  }
)

export { useAuthStore }