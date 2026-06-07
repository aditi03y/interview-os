import { describe, expect, it } from 'vitest'
import { sectionTotalMaxScore } from '@/features/admin/lib/testSections'
import type { TestSectionConfig } from '@/features/tests/types'

describe('sectionTotalMaxScore', () => {
  it('sums question count × points per section', () => {
    const sections: TestSectionConfig[] = [
      {
        id: 'mcq',
        label: 'MCQ',
        questionType: 'mcq',
        questionCount: 10,
        difficulty: 'Medium',
        durationMinutes: 15,
        pointsPerQuestion: 1,
        negativeMarking: { enabled: false, penaltyPerWrong: 0.25 },
      },
      {
        id: 'dsa',
        label: 'DSA',
        questionType: 'coding',
        questionCount: 2,
        difficulty: 'Hard',
        durationMinutes: 45,
        pointsPerQuestion: 5,
        negativeMarking: { enabled: false, penaltyPerWrong: 0 },
      },
    ]

    expect(sectionTotalMaxScore(sections)).toBe(20)
  })
})
