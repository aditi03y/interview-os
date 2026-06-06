import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/hooks/auth'

export function ProtectedRoute() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth()
  const location = useLocation()

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.auth.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
