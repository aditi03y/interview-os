import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants/app'

interface UiStore {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
  closeMobileNav: () => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      mobileNavOpen: false,

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
      closeMobileNav: () => set({ mobileNavOpen: false }),
    }),
    {
      name: STORAGE_KEYS.sidebarCollapsed,
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)
