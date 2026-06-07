import { describe, expect, it } from 'vitest'
import { getEffectiveResource, resolveResource } from '@/features/study-plan/lib/resourceRegistry'

describe('resourceRegistry', () => {
  it('returns fallback for broken youtube resource ids', () => {
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
