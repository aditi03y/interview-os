import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui'
import { appRoutes } from '@/app/router'
import { useThemeSync } from '@/stores'
import { useAuthStore } from '@/stores'

function AppRoutes() {
  return useRoutes(appRoutes)
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  useThemeSync()
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  return <>{children}</>
}

export function AppProviders() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <AppRoutes />
          <Toaster />
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
