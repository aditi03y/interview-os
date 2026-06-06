import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants/app'

interface FavoritePromptsStore {
  favoriteIds: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

export const useFavoritePromptsStore = create<FavoritePromptsStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (id) => {
        set((state) => {
          const exists = state.favoriteIds.includes(id)
          return {
            favoriteIds: exists
              ? state.favoriteIds.filter((favId) => favId !== id)
              : [...state.favoriteIds, id],
          }
        })
      },

      isFavorite: (id) => get().favoriteIds.includes(id),

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: STORAGE_KEYS.promptFavorites,
    },
  ),
)
