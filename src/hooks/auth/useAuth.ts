import { useAuthStore } from '@/stores'

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const isAuthenticated = Boolean(session && user)

  return {
    session,
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    error,
    clearError,
  }
}
