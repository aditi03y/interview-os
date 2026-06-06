import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { Spinner } from '@/components/ui'
import { useAuth } from '@/hooks/auth'

export function PublicRoute() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth()

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
