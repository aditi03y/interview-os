import { useCallback, useMemo, useState } from 'react'
import { PROMPT_LIBRARY, filterPrompts, getCategoryCounts } from '../lib/promptLibrary'
import { useFavoritePromptsStore } from '../stores/favoritePromptsStore'
import type { CategoryFilter, LibraryPrompt } from '../types'

export function usePromptLibrary() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const favoriteIds = useFavoritePromptsStore((s) => s.favoriteIds)
  const toggleFavorite = useFavoritePromptsStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritePromptsStore((s) => s.isFavorite)

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const filteredPrompts = useMemo(
    () =>
      filterPrompts(PROMPT_LIBRARY.prompts, {
        search,
        category,
        favoriteIds: favoriteSet,
      }),
    [search, category, favoriteSet],
  )

  const categoryCounts = useMemo(
    () => getCategoryCounts(PROMPT_LIBRARY.prompts),
    [],
  )

  const stats = useMemo(
    () => ({
      total: PROMPT_LIBRARY.prompts.length,
      filtered: filteredPrompts.length,
      favorites: favoriteIds.length,
      version: PROMPT_LIBRARY.version,
    }),
    [filteredPrompts.length, favoriteIds.length],
  )

  const clearFilters = useCallback(() => {
    setSearch('')
    setCategory('all')
  }, [])

  return {
    prompts: filteredPrompts as LibraryPrompt[],
    allPrompts: PROMPT_LIBRARY.prompts,
    search,
    setSearch,
    category,
    setCategory,
    categoryCounts,
    stats,
    toggleFavorite,
    isFavorite,
    clearFilters,
  }
}
