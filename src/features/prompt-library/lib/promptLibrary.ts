import promptsJson from '../data/prompts.json'
import { PROMPT_CATEGORIES } from '../types'
import type { LibraryPrompt, PromptCategory, PromptLibraryData } from '../types'

function isPromptCategory(value: string): value is PromptCategory {
  return (PROMPT_CATEGORIES as readonly string[]).includes(value)
}

function validatePrompt(raw: unknown): LibraryPrompt | null {
  if (!raw || typeof raw !== 'object') return null

  const obj = raw as Record<string, unknown>
  if (
    typeof obj.id !== 'string' ||
    typeof obj.title !== 'string' ||
    typeof obj.category !== 'string' ||
    typeof obj.description !== 'string' ||
    typeof obj.prompt !== 'string'
  ) {
    return null
  }

  if (!isPromptCategory(obj.category)) return null

  const tags = Array.isArray(obj.tags)
    ? obj.tags.filter((t): t is string => typeof t === 'string')
    : undefined

  return {
    id: obj.id,
    title: obj.title,
    category: obj.category,
    description: obj.description,
    prompt: obj.prompt,
    tags,
  }
}

export function loadPromptLibrary(): PromptLibraryData {
  const data = promptsJson as PromptLibraryData
  const prompts = (data.prompts ?? [])
    .map(validatePrompt)
    .filter((p): p is LibraryPrompt => p !== null)

  return {
    version: typeof data.version === 'string' ? data.version : '1.0.0',
    prompts,
  }
}

export const PROMPT_LIBRARY = loadPromptLibrary()

export function filterPrompts(
  prompts: LibraryPrompt[],
  options: {
    search: string
    category: PromptCategory | 'all' | 'favorites'
    favoriteIds: Set<string>
  },
): LibraryPrompt[] {
  const query = options.search.trim().toLowerCase()

  return prompts.filter((prompt) => {
    if (options.category === 'favorites' && !options.favoriteIds.has(prompt.id)) {
      return false
    }

    if (options.category !== 'all' && options.category !== 'favorites') {
      if (prompt.category !== options.category) return false
    }

    if (!query) return true

    const haystack = [
      prompt.title,
      prompt.description,
      prompt.prompt,
      prompt.category,
      ...(prompt.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function getCategoryCounts(prompts: LibraryPrompt[]): Record<PromptCategory, number> {
  const counts = Object.fromEntries(
    PROMPT_CATEGORIES.map((c) => [c, 0]),
  ) as Record<PromptCategory, number>

  for (const prompt of prompts) {
    counts[prompt.category] += 1
  }

  return counts
}
