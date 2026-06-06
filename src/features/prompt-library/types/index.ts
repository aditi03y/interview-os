export const PROMPT_CATEGORIES = [
  'DSA',
  'OS',
  'DBMS',
  'CN',
  'OOP',
  'LLD',
  'Behavioral',
] as const

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number]

export interface LibraryPrompt {
  id: string
  title: string
  category: PromptCategory
  description: string
  prompt: string
  tags?: string[]
}

export interface PromptLibraryData {
  version: string
  prompts: LibraryPrompt[]
}

export type CategoryFilter = PromptCategory | 'all' | 'favorites'

export interface PromptLibraryFilters {
  search: string
  category: CategoryFilter
}
