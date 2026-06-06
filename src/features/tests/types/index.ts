import type { Json } from '@/types/database'

export type QuestionType = 'mcq' | 'subjective' | 'coding'
export type TestDefinitionType = QuestionType | 'mixed'
export type ScheduleType = 'revision_2d' | 'cumulative_5d' | 'manual'
export type AttemptStatus = 'in_progress' | 'completed' | 'auto_submitted' | 'abandoned'

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
