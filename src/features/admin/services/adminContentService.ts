import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'

export interface ContentPrompt {
  id: string
  category: string
  title: string
  description: string | null
  promptText: string
  updatedAt: string
}

export interface PromptLibraryItem {
  id: string
  title: string
  category: string
  description: string
  prompt: string
  tags: string[]
  isPublished: boolean
  sortOrder: number
  updatedAt: string
}

export interface ContentPromptInput {
  id: string
  category: string
  title: string
  description?: string | null
  promptText: string
}

export interface PromptLibraryItemInput {
  id: string
  title: string
  category: string
  description?: string
  prompt: string
  tags?: string[]
  isPublished?: boolean
  sortOrder?: number
}

function mapContentPrompt(row: {
  id: string
  category: string
  title: string
  description: string | null
  prompt_text: string
  updated_at: string
}): ContentPrompt {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    promptText: row.prompt_text,
    updatedAt: row.updated_at,
  }
}

function mapLibraryItem(row: {
  id: string
  title: string
  category: string
  description: string
  prompt: string
  tags: string[]
  is_published: boolean
  sort_order: number
  updated_at: string
}): PromptLibraryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    prompt: row.prompt,
    tags: row.tags ?? [],
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  }
}

export async function fetchContentPrompts(): Promise<ApiResult<ContentPrompt[]>> {
  const { data, error } = await supabase
    .from('content_prompts')
    .select('id, category, title, description, prompt_text, updated_at')
    .order('category')
    .order('id')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapContentPrompt), error: null }
}

export async function upsertContentPrompt(
  userId: string,
  input: ContentPromptInput,
): Promise<ApiResult<ContentPrompt>> {
  const { data, error } = await supabase
    .from('content_prompts')
    .upsert({
      id: input.id.trim(),
      category: input.category.trim(),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      prompt_text: input.promptText,
      updated_by: userId,
    })
    .select('id, category, title, description, prompt_text, updated_at')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapContentPrompt(data), error: null }
}

export async function deleteContentPrompt(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('content_prompts').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function fetchPromptLibraryItemsAdmin(): Promise<ApiResult<PromptLibraryItem[]>> {
  const { data, error } = await supabase
    .from('prompt_library_items')
    .select('*')
    .order('sort_order')
    .order('title')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapLibraryItem), error: null }
}

export async function fetchPublishedPromptLibraryItems(): Promise<ApiResult<PromptLibraryItem[]>> {
  const { data, error } = await supabase
    .from('prompt_library_items')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
    .order('title')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapLibraryItem), error: null }
}

export async function upsertPromptLibraryItem(
  input: PromptLibraryItemInput,
): Promise<ApiResult<PromptLibraryItem>> {
  const { data, error } = await supabase
    .from('prompt_library_items')
    .upsert({
      id: input.id.trim(),
      title: input.title.trim(),
      category: input.category.trim(),
      description: input.description?.trim() ?? '',
      prompt: input.prompt,
      tags: input.tags ?? [],
      is_published: input.isPublished ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapLibraryItem(data), error: null }
}

export async function deletePromptLibraryItem(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('prompt_library_items').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function buildTestGenerationContext(): Promise<string> {
  const result = await fetchContentPrompts()
  if (!result.data?.length) return ''

  return result.data.map((p) => `## ${p.title}\n${p.promptText}`).join('\n\n')
}
