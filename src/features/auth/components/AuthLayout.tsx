import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/app'
import { ThemeToggle } from '@/components/ui'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{APP_NAME}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">{APP_TAGLINE}</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
