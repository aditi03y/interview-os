import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ROUTE_TITLES, type AppRoute } from '@/app/router'
import { ALL_NAV_ITEMS } from '@/lib/constants/navigation'
import { useAuth } from '@/hooks/auth'
import { useSidebar } from '@/hooks'
import { Button, ThemeToggle } from '@/components/ui'
import { cn, getInitials } from '@/lib/utils'

export function Header() {
  const location = useLocation()
  const { toggleMobileNav } = useSidebar()
  const { user } = useAuth()

  const matchedItem = ALL_NAV_ITEMS.find((item) => item.path === location.pathname)
  const title =
    matchedItem?.label ??
    ROUTE_TITLES[location.pathname as AppRoute] ??
    'InterviewOS'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4',
        'border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6',
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {matchedItem?.description ? (
            <p className="hidden text-xs text-muted-foreground sm:block">
              {matchedItem.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(user.fullName ?? user.email)}
            </div>
            <span className="max-w-[140px] truncate text-sm text-muted-foreground">
              {user.fullName ?? user.email}
            </span>
          </div>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
