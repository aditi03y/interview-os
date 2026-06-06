import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants/app'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved

  const meta = document.getElementById('theme-color-meta')
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0a0a0a' : '#fafafa')
  }
}

interface ThemeStore {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),

      setMode: (mode) => {
        const resolvedTheme = resolveTheme(mode)
        applyTheme(resolvedTheme)
        set({ mode, resolvedTheme })
      },

      toggleTheme: () => {
        const current = get().resolvedTheme
        const next = current === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ mode: next, resolvedTheme: next })
      },
    }),
    {
      name: STORAGE_KEYS.theme,
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedTheme = resolveTheme(state.mode)
          applyTheme(resolvedTheme)
          state.resolvedTheme = resolvedTheme
        }
      },
    },
  ),
)

export function useThemeSync() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  useEffect(() => {
    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolvedTheme = getSystemTheme()
      applyTheme(resolvedTheme)
      useThemeStore.setState({ resolvedTheme })
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode, setMode])
}
