import { beforeAll, describe, expect, it } from 'vitest'
import {
  getEffectiveResource,
  resolveResource,
  setResourceCatalogForTests,
} from '@/features/study-plan/lib/resourceRegistry'

beforeAll(() => {
  setResourceCatalogForTests({
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
    'unknown-broken': {
      id: 'unknown-broken',
      title: 'Old Video',
      url: 'https://www.youtube.com/watch?v=Mo4vesautXg',
      type: 'video',
      provider: 'youtube',
      category: 'theory',
      status: 'broken',
      fallbackUrl: 'https://neetcode.io/roadmap',
      fallbackTitle: 'NeetCode Roadmap (fallback)',
    },
  })
})

describe('resourceRegistry', () => {
  it('returns catalog entry when resource id is registered', () => {
    const resolved = resolveResource({
      id: 'd1-t2-r2',
      title: 'Complexity Video',
      url: 'https://www.youtube.com/watch?v=Mo4vesautXg',
      type: 'video',
    })

    expect(resolved.status).toBe('active')
    expect(resolved.url).toContain('neetcode.io')
  })

  it('serves effective fallback url when resource is broken', () => {
    const effective = getEffectiveResource({
      id: 'unknown-broken',
      title: 'Old Video',
      url: 'https://www.youtube.com/watch?v=Mo4vesautXg',
      type: 'video',
    })

    expect(effective.isFallback).toBe(true)
    expect(effective.url).toContain('neetcode.io')
  })
})
