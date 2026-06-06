export { supabase, isSupabaseConfigured } from './client'
export type { SupabaseClient } from './client'
export {
  fetchUserProfile,
  updateUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getCurrentSession,
  onAuthStateChange,
  mapUserRowToProfile,
  mapAuthUserToProfile,
} from './auth'
export type { SignUpInput } from './auth'
export { mapSupabaseError, mapPostgrestError } from './errors'
