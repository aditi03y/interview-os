import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPublishedPromptLibraryItems } from '@/features/admin/services/adminContentService'
import { PROMPT_LIBRARY, filterPrompts, getCategoryCounts } from '../lib/promptLibrary'
import { useFavoritePromptsStore } from '../stores/favoritePromptsStore'
import type { CategoryFilter, LibraryPrompt, PromptCategory } from '../types'
import { PROMPT_CATEGORIES } from '../types'

function isPromptCategory(value: string): value is PromptCategory {
  return (PROMPT_CATEGORIES as readonly string[]).includes(value)
}

export function usePromptLibrary() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [dbPrompts, setDbPrompts] = useState<LibraryPrompt[]>([])

  useEffect(() => {
    void fetchPublishedPromptLibraryItems().then((result) => {
      if (!result.data?.length) return
      setDbPrompts(
        result.data.map((item) => ({
          id: item.id,
          title: item.title,
          category: isPromptCategory(item.category) ? item.category : 'Behavioral',
          description: item.description,
          prompt: item.prompt,
          tags: item.tags,
        })),
      )
    })
  }, [])

  const favoriteIds = useFavoritePromptsStore((s) => s.favoriteIds)
  const toggleFavorite = useFavoritePromptsStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritePromptsStore((s) => s.isFavorite)

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const allPrompts = useMemo(() => {
    const merged = new Map(PROMPT_LIBRARY.prompts.map((prompt) => [prompt.id, prompt]))
    for (const prompt of dbPrompts) {
      merged.set(prompt.id, prompt)
    }
    return [...merged.values()]
  }, [dbPrompts])

  const filteredPrompts = useMemo(
    () =>
      filterPrompts(allPrompts, {
        search,
        category,
        favoriteIds: favoriteSet,
      }),
    [allPrompts, search, category, favoriteSet],
  )

  const categoryCounts = useMemo(() => getCategoryCounts(allPrompts), [allPrompts])

  const stats = useMemo(
    () => ({
      total: allPrompts.length,
      filtered: filteredPrompts.length,
      favorites: favoriteIds.length,
      version: PROMPT_LIBRARY.version,
    }),
    [allPrompts.length, filteredPrompts.length, favoriteIds.length],
  )

  const clearFilters = useCallback(() => {
    setSearch('')
    setCategory('all')
  }, [])

  return {
    prompts: filteredPrompts as LibraryPrompt[],
    allPrompts,
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
