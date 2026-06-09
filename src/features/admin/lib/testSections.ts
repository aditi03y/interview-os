import type { QuestionType, SectionDifficulty, TestSectionConfig } from '@/features/tests/types'

export const DEFAULT_TEST_SECTIONS: TestSectionConfig[] = [
  {
    id: 'mcq',
    label: 'MCQ',
    questionType: 'mcq',
    questionCount: 5,
    difficulty: 'Medium',
    durationMinutes: 15,
    pointsPerQuestion: 1,
    negativeMarking: { enabled: false, penaltyPerWrong: 0.25 },
  },
  {
    id: 'subjective',
    label: 'Theory / Subjective',
    questionType: 'subjective',
    questionCount: 0,
    difficulty: 'Medium',
    durationMinutes: 20,
    pointsPerQuestion: 2,
    negativeMarking: { enabled: false, penaltyPerWrong: 0 },
  },
  {
    id: 'dsa',
    label: 'DSA / Coding',
    questionType: 'coding',
    questionCount: 0,
    difficulty: 'Medium',
    durationMinutes: 45,
    pointsPerQuestion: 5,
    negativeMarking: { enabled: false, penaltyPerWrong: 0 },
  },
]

export function createEmptySection(
  questionType: QuestionType,
  label: string,
): TestSectionConfig {
  const base = DEFAULT_TEST_SECTIONS.find((s) => s.questionType === questionType)
  return {
    id: `${questionType}-${crypto.randomUUID().slice(0, 8)}`,
    label,
    questionType,
    questionCount: 0,
    difficulty: base?.difficulty ?? 'Medium',
    durationMinutes: base?.durationMinutes ?? 15,
    pointsPerQuestion: base?.pointsPerQuestion ?? 1,
    negativeMarking: base?.negativeMarking ?? { enabled: false, penaltyPerWrong: 0.25 },
  }
}

export function cloneSections(sections: TestSectionConfig[]): TestSectionConfig[] {
  return sections.map((section) => ({
    ...section,
    negativeMarking: { ...section.negativeMarking },
  }))
}

export function activeSections(sections: TestSectionConfig[]): TestSectionConfig[] {
  return sections.filter((section) => section.questionCount > 0)
}

export function sectionTotalQuestions(sections: TestSectionConfig[]): number {
  return sections.reduce((sum, section) => sum + section.questionCount, 0)
}

export function sectionTotalDuration(sections: TestSectionConfig[]): number {
  return sections.reduce((sum, section) => sum + section.durationMinutes, 0)
}

export function sectionTotalMaxScore(sections: TestSectionConfig[]): number {
  const total = sections.reduce(
    (sum, section) => sum + section.questionCount * section.pointsPerQuestion,
    0,
  )
  return Math.round(total * 100) / 100
}

export function normalizeDifficulty(value: string): SectionDifficulty {
  if (value === 'Easy' || value === 'Medium' || value === 'Hard') return value
  return 'Medium'
}

/** Split a section count into AI batches to stay within token limits */
export function batchSectionCounts(total: number, batchSize = 15): number[] {
  if (total <= 0) return []
  const batches: number[] = []
  let remaining = total
  while (remaining > 0) {
    const size = Math.min(batchSize, remaining)
    batches.push(size)
    remaining -= size
  }
  return batches
}

export function pickStudyDayForQuestion(studyDays: number[], index: number): number | null {
  if (!studyDays.length) return null
  return studyDays[index % studyDays.length] ?? null
}
