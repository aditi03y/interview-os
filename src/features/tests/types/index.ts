import type { Json } from '@/types/database'

export type QuestionType = 'mcq' | 'subjective' | 'coding'
export type TestDefinitionType = QuestionType | 'mixed'
export type ScheduleType = 'revision_2d' | 'cumulative_5d' | 'manual'
export type AttemptStatus = 'in_progress' | 'completed' | 'auto_submitted' | 'abandoned'
export type SectionDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface TestSectionNegativeMarking {
  enabled: boolean
  /** Points deducted per wrong MCQ answer (e.g. 0.25 = −¼ mark) */
  penaltyPerWrong: number
}

export interface TestSectionConfig {
  id: string
  label: string
  questionType: QuestionType
  questionCount: number
  difficulty: SectionDifficulty
  durationMinutes: number
  pointsPerQuestion: number
  negativeMarking: TestSectionNegativeMarking
}

export interface TestGradingConfig {
  sections: TestSectionConfig[]
}

export interface McqOption {
  id: string
  label: string
  isCorrect?: boolean
}

export interface CodingTestCase {
  input: Record<string, unknown>
  expected: unknown
}

export interface CodingMetadata {
  testCases: CodingTestCase[]
  functionName: string
}

export interface TestDefinition {
  id: string
  title: string
  description: string | null
  testType: TestDefinitionType
  scheduleType: ScheduleType
  durationMinutes: number
  difficulty: string | null
  topics: string[]
  maxScore: number
  isActive: boolean
  coveredStudyDays: number[]
  sections: TestSectionConfig[]
  questionCount?: number
}

export interface TestQuestion {
  id: string
  testDefinitionId: string
  questionType: QuestionType
  title: string
  body: string
  options: McqOption[] | null
  correctAnswer: string | null
  rubric: string | null
  starterCode: string | null
  metadata: CodingMetadata | Record<string, unknown>
  points: number
  orderIndex: number
  studyDay: number | null
  topic: string | null
}

export interface QuestionAnswer {
  value: string
  isCorrect?: boolean
  pointsEarned?: number
  graded?: boolean
}

export type AttemptAnswers = Record<string, QuestionAnswer>

export interface TestAttempt {
  id: string
  userId: string
  testDefinitionId: string
  status: AttemptStatus
  score: number | null
  maxScore: number
  startedAt: string
  completedAt: string | null
  timeSpentSeconds: number | null
  expiresAt: string
  answers: AttemptAnswers
  selectedQuestionIds: string[]
  autoSubmitted: boolean
  scheduleDay: number | null
  coveredStudyDays: number[]
  definition?: TestDefinition
}

export interface ScheduledTestSlot {
  definition: TestDefinition
  scheduleType: ScheduleType
  planDay: number
  coveredStudyDays: number[]
  dueLabel: string
  isDue: boolean
  completedToday: boolean
}

export interface LeaderboardEntry {
  userId: string
  fullName: string | null
  score: number
  maxScore: number
  timeSpentSeconds: number | null
  completedAt: string
  rank: number
}

export interface ScoreSummary {
  totalAttempts: number
  completedAttempts: number
  averageScore: number
  bestScore: number
  totalTimeSpentMinutes: number
}

export function parseMcqOptions(raw: Json | null): McqOption[] | null {
  if (!raw || !Array.isArray(raw)) return null
  return raw as unknown as McqOption[]
}

export function parseCodingMetadata(raw: Json | Record<string, unknown>): CodingMetadata | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const meta = raw as Record<string, unknown>
  if (!Array.isArray(meta.testCases) || typeof meta.functionName !== 'string') return null
  return meta as unknown as CodingMetadata
}

export function parseTestSections(raw: Json | unknown): TestSectionConfig[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const questionType = row.questionType
      if (questionType !== 'mcq' && questionType !== 'subjective' && questionType !== 'coding') {
        return null
      }
      const negative = (row.negativeMarking as Record<string, unknown>) ?? {}
      return {
        id: String(row.id ?? questionType),
        label: String(row.label ?? questionType),
        questionType,
        questionCount: Math.max(0, Number(row.questionCount) || 0),
        difficulty: normalizeSectionDifficulty(row.difficulty),
        durationMinutes: Math.max(1, Number(row.durationMinutes) || 10),
        pointsPerQuestion: Math.max(0.5, Number(row.pointsPerQuestion) || 1),
        negativeMarking: {
          enabled: Boolean(negative.enabled),
          penaltyPerWrong: Math.max(0, Number(negative.penaltyPerWrong) || 0.25),
        },
      } satisfies TestSectionConfig
    })
    .filter((item): item is TestSectionConfig => item != null)
}

function normalizeSectionDifficulty(value: unknown): SectionDifficulty {
  if (value === 'Easy' || value === 'Medium' || value === 'Hard') return value
  return 'Medium'
}

export function getQuestionSectionId(question: TestQuestion): string | null {
  const meta = question.metadata
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null
  const sectionId = (meta as Record<string, unknown>).sectionId
  return typeof sectionId === 'string' && sectionId.trim() ? sectionId.trim() : null
}

export function totalSectionQuestions(sections: TestSectionConfig[]): number {
  return sections.reduce((sum, section) => sum + section.questionCount, 0)
}

export function totalSectionDuration(sections: TestSectionConfig[]): number {
  return sections.reduce((sum, section) => sum + section.durationMinutes, 0)
}
