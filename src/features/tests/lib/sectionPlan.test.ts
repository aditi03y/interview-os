import { describe, expect, it } from 'vitest'
import {
  buildSectionPlan,
  clampQuestionIndexToSection,
  getSectionBounds,
  reconcileSectionTimerState,
  shouldUseSectionTimers,
} from '@/features/tests/lib/sectionPlan'
import type { TestQuestion, TestSectionConfig } from '@/features/tests/types'

const mcqSection: TestSectionConfig = {
  id: 'mcq',
  label: 'MCQ',
  questionType: 'mcq',
  questionCount: 2,
  difficulty: 'Easy',
  durationMinutes: 15,
  pointsPerQuestion: 1,
  negativeMarking: { enabled: false, penaltyPerWrong: 0 },
}

const codingSection: TestSectionConfig = {
  id: 'coding',
  label: 'Coding',
  questionType: 'coding',
  questionCount: 1,
  difficulty: 'Hard',
  durationMinutes: 45,
  pointsPerQuestion: 10,
  negativeMarking: { enabled: false, penaltyPerWrong: 0 },
}

function makeQuestion(
  id: string,
  questionType: TestQuestion['questionType'],
  sectionId?: string,
): TestQuestion {
  return {
    id,
    testDefinitionId: 't1',
    questionType,
    title: id,
    body: '',
    options: questionType === 'mcq' ? [{ id: 'a', label: 'A' }] : null,
    correctAnswer: null,
    rubric: null,
    starterCode: null,
    metadata: sectionId ? { sectionId } : {},
    points: 1,
    orderIndex: 0,
    studyDay: null,
    topic: null,
  }
}

describe('buildSectionPlan', () => {
  it('groups questions by metadata.sectionId', () => {
    const questions = [
      makeQuestion('q1', 'mcq', 'mcq'),
      makeQuestion('q2', 'mcq', 'mcq'),
      makeQuestion('q3', 'coding', 'coding'),
    ]

    const plan = buildSectionPlan([mcqSection, codingSection], questions)

    expect(plan).toHaveLength(2)
    expect(plan[0]!.questionIndices).toEqual([0, 1])
    expect(plan[1]!.questionIndices).toEqual([2])
  })

  it('falls back to questionType when sectionId is missing', () => {
    const questions = [makeQuestion('q1', 'mcq'), makeQuestion('q2', 'coding')]

    const plan = buildSectionPlan([mcqSection, codingSection], questions)

    expect(plan[0]!.questionIndices).toEqual([0])
    expect(plan[1]!.questionIndices).toEqual([1])
  })
})

describe('shouldUseSectionTimers', () => {
  it('returns true when any section has durationMinutes > 0', () => {
    const questions = [makeQuestion('q1', 'mcq', 'mcq')]
    const plan = buildSectionPlan([mcqSection], questions)

    expect(shouldUseSectionTimers([mcqSection], plan)).toBe(true)
  })

  it('returns false when definition has no sections', () => {
    expect(shouldUseSectionTimers([], [])).toBe(false)
  })
})

describe('section bounds and clamping', () => {
  it('restricts navigation to the active section', () => {
    const questions = [
      makeQuestion('q1', 'mcq', 'mcq'),
      makeQuestion('q2', 'mcq', 'mcq'),
      makeQuestion('q3', 'coding', 'coding'),
    ]
    const plan = buildSectionPlan([mcqSection, codingSection], questions)

    expect(getSectionBounds(plan, 0)).toEqual({ start: 0, end: 1, indices: [0, 1] })
    expect(clampQuestionIndexToSection(2, plan, 0)).toBe(1)
    expect(clampQuestionIndexToSection(0, plan, 1)).toBe(2)
  })
})

describe('reconcileSectionTimerState', () => {
  it('advances through expired sections on reload', () => {
    const questions = [
      makeQuestion('q1', 'mcq', 'mcq'),
      makeQuestion('q2', 'coding', 'coding'),
    ]
    const plan = buildSectionPlan([mcqSection, codingSection], questions)
    const now = Date.now()
    const expiredAt = new Date(now - 60_000).toISOString()

    const result = reconcileSectionTimerState(
      plan,
      { sectionIndex: 0, sectionExpiresAt: expiredAt },
      now,
    )

    expect(result.expiredAll).toBe(false)
    expect(result.state.sectionIndex).toBe(1)
    expect(new Date(result.state.sectionExpiresAt).getTime()).toBeGreaterThan(now)
  })

  it('marks all sections expired when the last section time is up', () => {
    const questions = [makeQuestion('q1', 'coding', 'coding')]
    const shortSection = { ...codingSection, durationMinutes: 5 }
    const plan = buildSectionPlan([shortSection], questions)
    const now = Date.now()

    const result = reconcileSectionTimerState(
      plan,
      { sectionIndex: 0, sectionExpiresAt: new Date(now - 1_000).toISOString() },
      now,
    )

    expect(result.expiredAll).toBe(true)
  })
})
