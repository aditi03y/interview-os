import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { useAuth } from '@/hooks/auth'

export function AdminRoute() {
  const { isAuthenticated, isAdmin, isInitialized, isLoading } = useAuth()

  if (!isInitialized || isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.auth.login} replace />
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
