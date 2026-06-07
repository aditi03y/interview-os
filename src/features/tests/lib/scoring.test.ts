import { describe, expect, it } from 'vitest'
import { gradeAttempt } from '@/features/tests/lib/scoring'
import type { TestQuestion, TestSectionConfig } from '@/features/tests/types'

const mcqQuestion: TestQuestion = {
  id: 'q1',
  testDefinitionId: 't1',
  questionType: 'mcq',
  title: 'Sample',
  body: 'Pick one',
  options: [{ id: 'a', label: 'A' }],
  correctAnswer: 'a',
  rubric: null,
  starterCode: null,
  metadata: { sectionId: 'mcq-section' },
  points: 2,
  orderIndex: 0,
  studyDay: null,
  topic: null,
}

const mcqSection: TestSectionConfig = {
  id: 'mcq-section',
  label: 'MCQ',
  questionType: 'mcq',
  questionCount: 1,
  difficulty: 'Medium',
  durationMinutes: 10,
  pointsPerQuestion: 2,
  negativeMarking: { enabled: true, penaltyPerWrong: 0.5 },
}

describe('gradeAttempt negative marking', () => {
  it('deducts penalty for wrong MCQ when section negative marking is enabled', () => {
    const result = gradeAttempt(
      [mcqQuestion],
      { q1: { value: 'b' } },
      { sections: [mcqSection] },
    )

    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(2)
  })

  it('applies penalty and does not go below zero', () => {
    const result = gradeAttempt(
      [mcqQuestion],
      { q1: { value: 'b' } },
      { sections: [{ ...mcqSection, negativeMarking: { enabled: true, penaltyPerWrong: 5 } }] },
    )

    expect(result.score).toBe(0)
  })

  it('awards full points for correct MCQ', () => {
    const result = gradeAttempt(
      [mcqQuestion],
      { q1: { value: 'a' } },
      { sections: [mcqSection] },
    )

    expect(result.score).toBe(2)
  })
})
