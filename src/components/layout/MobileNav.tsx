import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks'

export function MobileNav() {
  const { mobileNavOpen, closeMobileNav } = useSidebar()

  if (!mobileNavOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={closeMobileNav}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 lg:hidden',
          'animate-in slide-in-from-left duration-200',
        )}
      >
        <Sidebar />
      </div>
    </>
  )
}
