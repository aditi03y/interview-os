import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import type { ApiResult } from '@/types'
import type {
  DsaProblemRow,
  RawAnalyticsData,
  StudyProgressRow,
  TestAttemptRow,
  ViolationRow,
} from '../types'

const dayTitleMap = new Map(SDE_ROADMAP_15_DAYS.map((d) => [d.day, d.title]))

export async function fetchAnalyticsData(userId: string): Promise<ApiResult<RawAnalyticsData>> {
  const [studyResult, dsaResult, testsResult, violationsResult] = await Promise.all([
    supabase
      .from('study_day_progress')
      .select('day_number, time_spent_minutes, progress_percent, status, updated_at')
      .eq('user_id', userId),
    supabase
      .from('dsa_progress')
      .select('pattern, difficulty, status, attempts, solved_at, updated_at')
      .eq('user_id', userId),
    supabase
      .from('test_attempts')
      .select('score, max_score, status, completed_at, started_at')
      .eq('user_id', userId),
    supabase
      .from('test_violations')
      .select('event_type, occurred_at')
      .eq('user_id', userId),
  ])

  const error =
    studyResult.error ?? dsaResult.error ?? testsResult.error ?? violationsResult.error
  if (error) return { data: null, error: mapPostgrestError(error) }

  const studyProgress: StudyProgressRow[] = (studyResult.data ?? []).map((row) => ({
    dayNumber: row.day_number,
    dayTitle: dayTitleMap.get(row.day_number) ?? `Day ${row.day_number}`,
    timeSpentMinutes: row.time_spent_minutes,
    progressPercent: row.progress_percent,
    status: row.status,
    updatedAt: row.updated_at,
  }))

  const dsaProblems: DsaProblemRow[] = (dsaResult.data ?? []).map((row) => ({
    topic: row.pattern,
    difficulty: row.difficulty,
    status: row.status,
    attempts: row.attempts,
    solvedAt: row.solved_at,
    updatedAt: row.updated_at,
  }))

  const testAttempts: TestAttemptRow[] = (testsResult.data ?? []).map((row) => ({
    score: row.score,
    maxScore: row.max_score,
    status: row.status,
    completedAt: row.completed_at,
    startedAt: row.started_at,
  }))

  const violations: ViolationRow[] = (violationsResult.data ?? []).map((row) => ({
    eventType: row.event_type,
    occurredAt: row.occurred_at,
  }))

  return {
    data: { studyProgress, dsaProblems, testAttempts, violations },
    error: null,
  }
}
