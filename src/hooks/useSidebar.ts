import { useEffect } from 'react'
import { useIsMobile } from './useMediaQuery'
import { useUiStore } from '@/stores'

export function useSidebar() {
  const isMobile = useIsMobile()
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav)
  const closeMobileNav = useUiStore((s) => s.closeMobileNav)

  useEffect(() => {
    if (!isMobile) {
      closeMobileNav()
    }
  }, [isMobile, closeMobileNav])

  return {
    isMobile,
    sidebarCollapsed,
    mobileNavOpen,
    toggleSidebarCollapsed,
    toggleMobileNav,
    closeMobileNav,
  }
}
