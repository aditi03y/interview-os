import { describe, expect, it } from 'vitest'
import {
  getRevisionStudyDays,
  resolveCoveredStudyDays,
  resolveQuestionStudyDayFilter,
} from './scheduler'

describe('getRevisionStudyDays', () => {
  it('returns empty before plan day 2', () => {
    expect(getRevisionStudyDays(1)).toEqual([])
  })

  it('covers study days 1 and 2 on first revision (plan day 2)', () => {
    expect(getRevisionStudyDays(2)).toEqual([1, 2])
  })

  it('covers the current two-day block ending on plan day (never day 0)', () => {
    expect(getRevisionStudyDays(4)).toEqual([3, 4])
    expect(getRevisionStudyDays(6)).toEqual([5, 6])
  })
})

describe('resolveCoveredStudyDays', () => {
  it('uses admin-configured days for manual starts', () => {
    expect(resolveCoveredStudyDays([1, 2])).toEqual([1, 2])
  })

  it('prefers admin days over scheduled days when admin configured them', () => {
    expect(resolveCoveredStudyDays([1, 2], [1, 0])).toEqual([1, 2])
    expect(resolveCoveredStudyDays([1, 2], [3, 4])).toEqual([1, 2])
  })

  it('uses scheduled days when admin left study days empty', () => {
    expect(resolveCoveredStudyDays([], [3, 4])).toEqual([3, 4])
    expect(resolveCoveredStudyDays([], [1, 2])).toEqual([1, 2])
  })
})

describe('resolveQuestionStudyDayFilter', () => {
  it('loads all questions for manual tests without explicit days', () => {
    expect(resolveQuestionStudyDayFilter('manual', [1, 2])).toBeUndefined()
    expect(resolveQuestionStudyDayFilter('manual', [3, 4], [])).toBeUndefined()
  })

  it('filters manual tests when caller passes explicit study days', () => {
    expect(resolveQuestionStudyDayFilter('manual', [], [3, 4])).toEqual([3, 4])
  })

  it('filters scheduled tests using admin or scheduler days', () => {
    expect(resolveQuestionStudyDayFilter('revision_2d', [1, 2], [3, 4])).toEqual([1, 2])
    expect(resolveQuestionStudyDayFilter('revision_2d', [], [3, 4])).toEqual([3, 4])
  })
})
