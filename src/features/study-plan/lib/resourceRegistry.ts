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

/** Curated registry — overrides roadmap URLs with validated status and fallbacks */
export const RESOURCE_REGISTRY: Record<string, ValidatedResource> = {
  'd1-t2-r2': {
    id: 'd1-t2-r2',
    title: 'Big-O Complexity (NeetCode)',
    url: 'https://neetcode.io/courses/dsa-for-beginners/0',
    type: 'video',
    provider: 'neetcode',
    category: 'theory',
    status: 'active',
    fallbackUrl: 'https://www.bigocheatsheet.com/',
    fallbackTitle: 'Big-O Cheat Sheet',
  },
  'd1-t1-r1': {
    id: 'd1-t1-r1',
    title: 'GFG: Array Data Structure',
    url: 'https://www.geeksforgeeks.org/array-data-structure/',
    type: 'article',
    provider: 'geeksforgeeks',
    category: 'theory',
    status: 'active',
  },
  'd1-t1-r2': {
    id: 'd1-t1-r2',
    title: 'NeetCode Roadmap',
    url: 'https://neetcode.io/roadmap',
    type: 'docs',
    provider: 'neetcode',
    category: 'theory',
    status: 'active',
  },
  'd1-t2-r1': {
    id: 'd1-t2-r1',
    title: 'Big-O Cheat Sheet',
    url: 'https://www.bigocheatsheet.com/',
    type: 'docs',
    provider: 'other',
    category: 'theory',
    status: 'active',
  },
}

/** Known broken URLs mapped to resource IDs for maintenance */
export const BROKEN_URL_PATTERNS: Array<{ pattern: RegExp; resourceId: string }> = [
  { pattern: /youtube\.com\/watch\?v=Mo4vesautXg/, resourceId: 'd1-t2-r2' },
]

export function resolveResource(link: ResourceLink): ValidatedResource {
  const registry = RESOURCE_REGISTRY[link.id]
  if (registry) return registry

  const isBroken = BROKEN_URL_PATTERNS.some(
    (entry) => entry.resourceId === link.id || entry.pattern.test(link.url),
  )

  const provider = inferProvider(link.url)

  return {
    ...link,
    provider,
    category: link.type ?? 'other',
    status: isBroken ? 'broken' : 'unknown',
    fallbackUrl: isBroken ? 'https://neetcode.io/roadmap' : undefined,
    fallbackTitle: isBroken ? 'NeetCode Roadmap (fallback)' : undefined,
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

/** Client-side HEAD check for resource maintenance scripts */
export async function checkResourceAvailability(url: string): Promise<ResourceStatus> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    if (response.type === 'opaque') return 'unknown'
    if (response.ok) return 'active'
    if (response.status === 404 || response.status === 410) return 'broken'
    return 'unknown'
  } catch {
    return 'broken'
  }
}
