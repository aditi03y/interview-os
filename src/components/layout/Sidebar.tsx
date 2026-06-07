import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { getNavigationGroups } from '@/lib/constants/navigation'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/app'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/auth'
import { useSidebar } from '@/hooks'
import { Button } from '@/components/ui'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebarCollapsed, closeMobileNav } = useSidebar()
  const { user, isAdmin } = useAuth()
  const navGroups = getNavigationGroups(isAdmin)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
        'transition-[width] duration-200 ease-in-out',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-sidebar-foreground">{APP_NAME}</p>
              <p className="truncate text-xs text-muted-foreground">{APP_TAGLINE}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn('hidden shrink-0 lg:flex', sidebarCollapsed && 'absolute right-2')}
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-6 last:mb-0">
            {!sidebarCollapsed ? (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      onClick={closeMobileNav}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/80',
                          sidebarCollapsed && 'justify-center px-2',
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!sidebarCollapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user && !sidebarCollapsed ? (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(user.fullName ?? user.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.fullName ?? 'User'}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
