import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageLoader } from '@/components/ui/PageSkeletons'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks'

function LayoutOutlet() {
  const location = useLocation()

  return (
    <ErrorBoundary resetKeys={[location.pathname]}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  )
}

export function AppLayout() {
  const { sidebarCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <div className="relative hidden lg:block">
        <Sidebar />
      </div>

      <MobileNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8',
            sidebarCollapsed && 'lg:pl-8',
          )}
        >
          <LayoutOutlet />
        </main>
      </div>
    </div>
  )
}
