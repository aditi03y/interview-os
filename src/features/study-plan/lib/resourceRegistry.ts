import { supabase } from '@/lib/supabase'
import type { ResourceLink } from '../types'

export type ResourceStatus = 'active' | 'deprecated' | 'broken' | 'unknown'
export type ResourceProvider = 'youtube' | 'leetcode' | 'geeksforgeeks' | 'neetcode' | 'other'

export interface ValidatedResource extends ResourceLink {
  provider: ResourceProvider
  category: string
  status: ResourceStatus
  fallbackUrl?: string
  fallbackTitle?: string
  lastCheckedAt?: string
}

let catalogMap: Record<string, ValidatedResource> = {}
let catalogLoaded = false

export async function loadResourceCatalog(): Promise<void> {
  const { data, error } = await supabase.from('resource_catalog').select('*')
  if (error) return

  catalogMap = Object.fromEntries(
    (data ?? []).map((row) => [
      row.id,
      {
        id: row.id,
        title: row.title,
        url: row.url,
        type: undefined,
        provider: (row.provider as ResourceProvider) ?? 'other',
        category: row.category,
        status: row.status as ResourceStatus,
        fallbackUrl: row.fallback_url ?? undefined,
        fallbackTitle: row.fallback_title ?? undefined,
        lastCheckedAt: row.last_checked_at ?? undefined,
      },
    ]),
  )
  catalogLoaded = true
}

export function isResourceCatalogLoaded(): boolean {
  return catalogLoaded
}

export function setResourceCatalogForTests(entries: Record<string, ValidatedResource>): void {
  catalogMap = entries
  catalogLoaded = true
}

export function resolveResource(link: ResourceLink): ValidatedResource {
  const registry = catalogMap[link.id]
  if (registry) {
    return {
      ...registry,
      type: link.type ?? registry.type,
      title: registry.title || link.title,
      url: registry.url || link.url,
    }
  }

  const provider = inferProvider(link.url)

  return {
    ...link,
    provider,
    category: link.type ?? 'other',
    status: 'unknown',
  }
}

export function getEffectiveResource(link: ResourceLink): {
  title: string
  url: string
  isFallback: boolean
  status: ResourceStatus
} {
  const resolved = resolveResource(link)

  if (resolved.status === 'broken' || resolved.status === 'deprecated') {
    if (resolved.fallbackUrl) {
      return {
        title: resolved.fallbackTitle ?? `${resolved.title} (alternative)`,
        url: resolved.fallbackUrl,
        isFallback: true,
        status: resolved.status,
      }
    }
  }

  return {
    title: resolved.title,
    url: resolved.url,
    isFallback: false,
    status: resolved.status,
  }
}

function inferProvider(url: string): ResourceProvider {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('leetcode.com')) return 'leetcode'
  if (url.includes('geeksforgeeks.org')) return 'geeksforgeeks'
  if (url.includes('neetcode.io')) return 'neetcode'
  return 'other'
}

export function enrichResources(resources?: ResourceLink[]): ValidatedResource[] {
  return (resources ?? []).map(resolveResource)
}
