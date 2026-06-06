import type { Json } from '@/types/database'
import {
  parseCodingMetadata,
  parseMcqOptions,
  type AttemptAnswers,
  type TestAttempt,
  type TestDefinition,
  type TestQuestion,
} from '../types'

interface DefinitionRow {
  id: string
  title: string
  description: string | null
  test_type: string
  schedule_type: string
  duration_minutes: number
  difficulty: string | null
  topics: Json
  max_score: number
  is_active: boolean
}

interface QuestionRow {
  id: string
  test_definition_id: string
  question_type: string
  title: string
  body: string
  options: Json | null
  correct_answer: string | null
  rubric: string | null
  starter_code: string | null
  metadata: Json
  points: number
  order_index: number
  study_day: number | null
  topic: string | null
}

interface AttemptRow {
  id: string
  user_id: string
  test_definition_id: string
  status: string
  score: number | null
  max_score: number
  started_at: string
  completed_at: string | null
  time_spent_seconds: number | null
  expires_at: string
  answers: Json
  selected_question_ids: string[]
  auto_submitted: boolean
  schedule_day: number | null
  covered_study_days: number[]
  test_definitions?: DefinitionRow | DefinitionRow[] | null
}

export function mapDefinitionRow(row: DefinitionRow, questionCount?: number): TestDefinition {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    testType: row.test_type as TestDefinition['testType'],
    scheduleType: row.schedule_type as TestDefinition['scheduleType'],
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    topics: Array.isArray(row.topics) ? (row.topics as string[]) : [],
    maxScore: Number(row.max_score),
    isActive: row.is_active,
    questionCount,
  }
}

export function mapQuestionRow(row: QuestionRow): TestQuestion {
  return {
    id: row.id,
    testDefinitionId: row.test_definition_id,
    questionType: row.question_type as TestQuestion['questionType'],
    title: row.title,
    body: row.body,
    options: parseMcqOptions(row.options),
    correctAnswer: row.correct_answer,
    rubric: row.rubric,
    starterCode: row.starter_code,
    metadata: parseCodingMetadata(row.metadata) ?? {},
    points: Number(row.points),
    orderIndex: row.order_index,
    studyDay: row.study_day,
    topic: row.topic,
  }
}

export function mapAttemptRow(row: AttemptRow): TestAttempt {
  const nested = row.test_definitions
  const definitionRow = Array.isArray(nested) ? nested[0] : nested

  return {
    id: row.id,
    userId: row.user_id,
    testDefinitionId: row.test_definition_id,
    status: row.status as TestAttempt['status'],
    score: row.score != null ? Number(row.score) : null,
    maxScore: Number(row.max_score),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    timeSpentSeconds: row.time_spent_seconds,
    expiresAt: row.expires_at,
    answers: (row.answers ?? {}) as unknown as AttemptAnswers,
    selectedQuestionIds: row.selected_question_ids ?? [],
    autoSubmitted: row.auto_submitted,
    scheduleDay: row.schedule_day,
    coveredStudyDays: row.covered_study_days ?? [],
    definition: definitionRow ? mapDefinitionRow(definitionRow) : undefined,
  }
}
