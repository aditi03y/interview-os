import { describe, expect, it } from 'vitest'
import { getRevisionStudyDays, resolveCoveredStudyDays } from './scheduler'

describe('getRevisionStudyDays', () => {
  it('returns empty before plan day 2', () => {
    expect(getRevisionStudyDays(1)).toEqual([])
  })

  it('excludes invalid day 0 on plan day 2', () => {
    expect(getRevisionStudyDays(2)).toEqual([1])
  })

  it('returns the previous two study days from plan day 3 onward', () => {
    expect(getRevisionStudyDays(3)).toEqual([2, 1])
    expect(getRevisionStudyDays(4)).toEqual([3, 2])
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
    expect(resolveCoveredStudyDays([], [2, 1])).toEqual([2, 1])
    expect(resolveCoveredStudyDays([], [1, 0])).toEqual([1])
  })
})
