import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'

export interface ResourceCatalogItem {
  id: string
  title: string
  url: string
  provider: string
  category: string
  status: 'active' | 'deprecated' | 'broken' | 'unknown'
  fallbackUrl: string | null
  fallbackTitle: string | null
  updatedAt: string
}

export interface ResourceCatalogInput {
  id: string
  title: string
  url: string
  provider?: string
  category?: string
  status?: ResourceCatalogItem['status']
  fallbackUrl?: string | null
  fallbackTitle?: string | null
}

function mapRow(row: {
  id: string
  title: string
  url: string
  provider: string
  category: string
  status: string
  fallback_url: string | null
  fallback_title: string | null
  updated_at: string
}): ResourceCatalogItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    provider: row.provider,
    category: row.category,
    status: row.status as ResourceCatalogItem['status'],
    fallbackUrl: row.fallback_url,
    fallbackTitle: row.fallback_title,
    updatedAt: row.updated_at,
  }
}

export async function fetchResourceCatalogAdmin(): Promise<ApiResult<ResourceCatalogItem[]>> {
  const { data, error } = await supabase
    .from('resource_catalog')
    .select('*')
    .order('category')
    .order('title')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapRow), error: null }
}

export async function upsertResourceCatalogItem(
  input: ResourceCatalogInput,
): Promise<ApiResult<ResourceCatalogItem>> {
  const { data, error } = await supabase
    .from('resource_catalog')
    .upsert({
      id: input.id.trim(),
      title: input.title.trim(),
      url: input.url.trim(),
      provider: input.provider?.trim() || 'other',
      category: input.category?.trim() || 'general',
      status: input.status ?? 'active',
      fallback_url: input.fallbackUrl?.trim() || null,
      fallback_title: input.fallbackTitle?.trim() || null,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapRow(data), error: null }
}

export async function deleteResourceCatalogItem(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('resource_catalog').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}
