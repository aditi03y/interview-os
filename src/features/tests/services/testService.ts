import { supabase } from '@/lib/supabase'
import type { Json } from '@/types/database'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import { gradeAttempt, maxPointsForQuestion } from '../lib/scoring'
import { mapAttemptRow, mapDefinitionRow, mapQuestionRow } from '../lib/mappers'
import { resolveCoveredStudyDays, resolveQuestionStudyDayFilter } from '../lib/scheduler'
import { totalSectionDuration } from '../types'
import type {
  AttemptAnswers,
  AttemptStatus,
  LeaderboardEntry,
  ScoreSummary,
  TestAttempt,
  TestDefinition,
  TestQuestion,
} from '../types'

export async function fetchTestDefinitions(): Promise<ApiResult<TestDefinition[]>> {
  const { data, error } = await supabase
    .from('test_definitions')
    .select('*, test_questions(count)')
    .eq('is_active', true)
    .order('schedule_type')
    .order('title')

  if (error) return { data: null, error: mapPostgrestError(error) }

  const definitions = data.map((row) => {
    const count = Array.isArray(row.test_questions)
      ? row.test_questions[0]?.count
      : (row.test_questions as { count: number } | null)?.count
    return mapDefinitionRow(row, count ?? 0)
  })

  return { data: definitions, error: null }
}

export async function fetchQuestionsForDefinition(
  definitionId: string,
  studyDays?: number[],
): Promise<ApiResult<TestQuestion[]>> {
  let query = supabase
    .from('test_questions')
    .select('*')
    .eq('test_definition_id', definitionId)
    .order('order_index')

  if (studyDays?.length) {
    query = query.in('study_day', studyDays)
  }

  const { data, error } = await query
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapQuestionRow), error: null }
}

export async function fetchUserAttempts(userId: string): Promise<ApiResult<TestAttempt[]>> {
  const { data, error } = await supabase
    .from('test_attempts')
    .select('*, test_definitions(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapAttemptRow), error: null }
}

export async function fetchAttemptById(
  attemptId: string,
  userId: string,
): Promise<ApiResult<TestAttempt>> {
  const { data, error } = await supabase
    .from('test_attempts')
    .select('*, test_definitions(*)')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapAttemptRow(data), error: null }
}

export async function fetchAttemptQuestions(attempt: TestAttempt): Promise<ApiResult<TestQuestion[]>> {
  if (!attempt.selectedQuestionIds.length) {
    return fetchQuestionsForDefinition(attempt.testDefinitionId, attempt.coveredStudyDays.length
      ? attempt.coveredStudyDays
      : undefined)
  }

  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .in('id', attempt.selectedQuestionIds)
    .order('order_index')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapQuestionRow), error: null }
}

interface StartAttemptInput {
  userId: string
  definition: TestDefinition
  coveredStudyDays?: number[]
  scheduleDay?: number
}

export async function countCompletedAttempts(
  userId: string,
  testDefinitionId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('test_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('test_definition_id', testDefinitionId)
    .in('status', ['completed', 'auto_submitted'])

  if (error) return 0
  return count ?? 0
}

export async function startAttempt(input: StartAttemptInput): Promise<ApiResult<TestAttempt>> {
  const {
    userId,
    definition,
    coveredStudyDays: requestedStudyDays,
    scheduleDay = null,
  } = input

  if (definition.maxAttempts != null) {
    const used = await countCompletedAttempts(userId, definition.id)
    if (used >= definition.maxAttempts) {
      return {
        data: null,
        error: {
          message: `Attempt limit reached (${definition.maxAttempts} attempt${definition.maxAttempts === 1 ? '' : 's'} allowed).`,
          code: 'MAX_ATTEMPTS',
        },
      }
    }
  }

  const studyDayFilter = resolveQuestionStudyDayFilter(
    definition.scheduleType,
    definition.coveredStudyDays ?? [],
    requestedStudyDays,
  )

  const coveredStudyDays = resolveCoveredStudyDays(
    definition.coveredStudyDays ?? [],
    requestedStudyDays,
  )

  const questionsResult = await fetchQuestionsForDefinition(definition.id, studyDayFilter)
  if (questionsResult.error || !questionsResult.data?.length) {
    const dayHint =
      studyDayFilter?.length && definition.scheduleType !== 'manual'
        ? ` No questions are tagged for study day${studyDayFilter.length === 1 ? '' : 's'} ${studyDayFilter.join(', ')}.`
        : ''
    return {
      data: null,
      error:
        questionsResult.error ?? {
          message: `No questions available for this test.${dayHint}`,
          code: 'NO_QUESTIONS',
        },
    }
  }

  const questions = questionsResult.data
  const maxScore = questions.reduce((sum, q) => sum + maxPointsForQuestion(q), 0)
  const sectionDuration = totalSectionDuration(definition.sections)
  const durationMinutes =
    sectionDuration > 0 ? sectionDuration : definition.durationMinutes
  const expiresAt = new Date(Date.now() + durationMinutes * 60_000).toISOString()

  const { data, error } = await supabase
    .from('test_attempts')
    .insert({
      user_id: userId,
      test_definition_id: definition.id,
      status: 'in_progress',
      max_score: maxScore,
      expires_at: expiresAt,
      selected_question_ids: questions.map((q) => q.id),
      covered_study_days: coveredStudyDays,
      schedule_day: scheduleDay,
      answers: {},
    })
    .select('*, test_definitions(*)')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapAttemptRow(data), error: null }
}

export async function saveAttemptAnswers(
  attemptId: string,
  answers: AttemptAnswers,
): Promise<ApiResult<void>> {
  const { error } = await supabase
    .from('test_attempts')
    .update({ answers: answers as unknown as Json })
    .eq('id', attemptId)

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

interface SubmitAttemptInput {
  attempt: TestAttempt
  questions: TestQuestion[]
  answers: AttemptAnswers
  autoSubmitted?: boolean
  timeSpentSeconds: number
}

export async function submitAttempt(input: SubmitAttemptInput): Promise<ApiResult<TestAttempt>> {
  const { attempt, questions, answers, autoSubmitted = false, timeSpentSeconds } = input
  const { score, maxScore, answers: gradedAnswers } = gradeAttempt(questions, answers, {
    sections: attempt.definition?.sections ?? [],
  })

  const status: AttemptStatus = autoSubmitted ? 'auto_submitted' : 'completed'

  const { data, error } = await supabase
    .from('test_attempts')
    .update({
      status,
      score,
      max_score: maxScore,
      answers: gradedAnswers as unknown as Json,
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
      auto_submitted: autoSubmitted,
    })
    .eq('id', attempt.id)
    .select('*, test_definitions(*)')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapAttemptRow(data), error: null }
}

export async function fetchScoreSummary(userId: string): Promise<ApiResult<ScoreSummary>> {
  const { data, error } = await supabase
    .from('test_attempts')
    .select('status, score, max_score, time_spent_seconds')
    .eq('user_id', userId)

  if (error) return { data: null, error: mapPostgrestError(error) }

  const completed = data.filter((a) => a.status === 'completed' || a.status === 'auto_submitted')
  const percentages = completed
    .filter((a) => a.score != null && a.max_score > 0)
    .map((a) => (Number(a.score) / Number(a.max_score)) * 100)

  return {
    data: {
      totalAttempts: data.length,
      completedAttempts: completed.length,
      averageScore: percentages.length
        ? Math.round(percentages.reduce((s, p) => s + p, 0) / percentages.length)
        : 0,
      bestScore: percentages.length ? Math.round(Math.max(...percentages)) : 0,
      totalTimeSpentMinutes: Math.round(
        completed.reduce((s, a) => s + (a.time_spent_seconds ?? 0), 0) / 60,
      ),
    },
    error: null,
  }
}

export async function fetchLeaderboard(
  definitionId: string,
  limit = 10,
): Promise<ApiResult<LeaderboardEntry[]>> {
  const { data, error } = await supabase
    .from('test_attempts')
    .select('user_id, score, max_score, time_spent_seconds, completed_at, users(full_name)')
    .eq('test_definition_id', definitionId)
    .in('status', ['completed', 'auto_submitted'])
    .not('score', 'is', null)
    .order('score', { ascending: false })
    .order('time_spent_seconds', { ascending: true })
    .limit(limit)

  if (error) return { data: null, error: mapPostgrestError(error) }

  const entries: LeaderboardEntry[] = data.map((row, index) => {
    const users = row.users as { full_name: string | null } | { full_name: string | null }[] | null
    const user = Array.isArray(users) ? users[0] : users
    return {
      userId: row.user_id,
      fullName: user?.full_name ?? null,
      score: Number(row.score),
      maxScore: Number(row.max_score),
      timeSpentSeconds: row.time_spent_seconds,
      completedAt: row.completed_at ?? '',
      rank: index + 1,
    }
  })

  return { data: entries, error: null }
}
