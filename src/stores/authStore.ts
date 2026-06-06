import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import type { UserProfile, ApiResult } from '@/types'
import {
  fetchUserProfile,
  getCurrentSession,
  mapAuthUserToProfile,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  updateUserProfile,
} from '@/lib/supabase'
import type { SignUpInput } from '@/lib/supabase'
import type { UserUpdate } from '@/types/database'

interface AuthStore {
  session: Session | null
  user: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<ApiResult<void>>
  signUp: (input: SignUpInput) => Promise<ApiResult<{ needsEmailConfirmation: boolean }>>
  signOut: () => Promise<ApiResult<void>>
  updateProfile: (updates: UserUpdate) => Promise<ApiResult<UserProfile>>
  clearError: () => void
  setSession: (session: Session | null) => Promise<void>
}

async function resolveUserFromSession(session: Session | null): Promise<UserProfile | null> {
  if (!session?.user) return null

  const profileResult = await fetchUserProfile(session.user.id)
  if (profileResult.data) return profileResult.data

  return mapAuthUserToProfile(session.user)
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    let mounted = true

    const bootstrap = async () => {
      set({ isLoading: true, error: null })

      const sessionResult = await getCurrentSession()
      if (!mounted) return

      if (sessionResult.error) {
        set({
          error: sessionResult.error.message,
          session: null,
          user: null,
          isInitialized: true,
          isLoading: false,
        })
        return
      }

      const user = await resolveUserFromSession(sessionResult.data)
      if (!mounted) return

      set({
        session: sessionResult.data,
        user,
        isInitialized: true,
        isLoading: false,
      })
    }

    void bootstrap()

    const subscription = onAuthStateChange((session) => {
      void get().setSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  },

  setSession: async (session) => {
    if (!session) {
      set({ session: null, user: null, isLoading: false })
      return
    }

    set({ isLoading: true })
    const user = await resolveUserFromSession(session)
    set({ session, user, isLoading: false, isInitialized: true })
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    const result = await signInWithEmail(email, password)

    if (result.error) {
      set({ isLoading: false, error: result.error.message })
      return { data: null, error: result.error }
    }

    set({
      session: result.data.session,
      user: result.data.user,
      isLoading: false,
      error: null,
    })

    return { data: undefined, error: null }
  },

  signUp: async (input) => {
    set({ isLoading: true, error: null })
    const result = await signUpWithEmail(input)

    if (result.error) {
      set({ isLoading: false, error: result.error.message })
      return { data: null, error: result.error }
    }

    const needsEmailConfirmation = !result.data.session

    if (result.data.session && result.data.user) {
      set({
        session: result.data.session,
        user: result.data.user,
        isLoading: false,
        error: null,
      })
    } else {
      set({ isLoading: false, error: null })
    }

    return { data: { needsEmailConfirmation }, error: null }
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    const result = await signOutUser()

    if (result.error) {
      set({ isLoading: false, error: result.error.message })
      return { data: null, error: result.error }
    }

    set({ session: null, user: null, isLoading: false, error: null })
    return { data: undefined, error: null }
  },

  updateProfile: async (updates) => {
    const userId = get().user?.id
    if (!userId) {
      return { data: null, error: { message: 'Not authenticated.' } }
    }

    set({ isLoading: true, error: null })
    const result = await updateUserProfile(userId, updates)

    if (result.error) {
      set({ isLoading: false, error: result.error.message })
      return result
    }

    set({ user: result.data, isLoading: false, error: null })
    return result
  },

  clearError: () => set({ error: null }),
}))
