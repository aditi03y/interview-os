import { describe, expect, it } from 'vitest'
import { mergeCompletedItems, mergeDayProgress } from '@/features/study-plan/lib/progressMerge'
import { EMPTY_COMPLETED_ITEMS } from '@/features/study-plan/lib/progress'
import type { DayProgress } from '@/features/study-plan/types'
import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'

describe('progressMerge', () => {
  it('unions completed items without losing progress', () => {
    const merged = mergeCompletedItems(
      { theory: ['d1-t1'], dsa: [], assignment: [] },
      { theory: [], dsa: ['d1-d1'], assignment: [] },
    )

    expect(merged.theory).toContain('d1-t1')
    expect(merged.dsa).toContain('d1-d1')
  })

  it('never drops remote progress when merging day records', () => {
    const day = SDE_ROADMAP_15_DAYS[0]!
    const local: DayProgress = {
      id: '1',
      userId: 'u1',
      dayNumber: 1,
      notes: 'local notes',
      timeSpentMinutes: 10,
      completedItems: { theory: ['d1-t1'], dsa: [], assignment: [] },
      status: 'in_progress',
      progressPercent: 20,
      completedAt: null,
      updatedAt: '2026-01-01T10:00:00.000Z',
    }
    const remote: DayProgress = {
      ...local,
      id: '2',
      completedItems: { theory: [], dsa: ['d1-d1'], assignment: [] },
      updatedAt: '2026-01-01T09:00:00.000Z',
    }

    const merged = mergeDayProgress(local, remote, day)
    expect(merged.completedItems.theory).toContain('d1-t1')
    expect(merged.completedItems.dsa).toContain('d1-d1')
  })
})

describe('EMPTY_COMPLETED_ITEMS', () => {
  it('starts empty for all sections', () => {
    expect(EMPTY_COMPLETED_ITEMS).toEqual({ theory: [], dsa: [], assignment: [] })
  })
})
