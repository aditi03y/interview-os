import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import type { ApiResult } from '@/types'
import { computeReadiness } from '../lib/computeReadiness'
import type { RawReadinessData, ReadinessSnapshot } from '../types'

const dayTitleMap = new Map(SDE_ROADMAP_15_DAYS.map((d) => [d.day, d.title]))

export async function fetchReadinessSnapshot(userId: string): Promise<ApiResult<ReadinessSnapshot>> {
  const [dsaResult, testsResult, studyResult, githubResult] = await Promise.all([
    supabase
      .from('dsa_progress')
      .select('pattern, difficulty, status, attempts')
      .eq('user_id', userId),
    supabase
      .from('test_attempts')
      .select('score, max_score, status')
      .eq('user_id', userId),
    supabase
      .from('study_day_progress')
      .select('day_number, progress_percent, status')
      .eq('user_id', userId),
    supabase
      .from('github_reviews')
      .select('score, documentation_score, structure_score, engineering_score')
      .eq('user_id', userId)
      .order('reviewed_at', { ascending: false })
      .limit(10),
  ])

  const error = dsaResult.error ?? testsResult.error ?? studyResult.error ?? githubResult.error
  if (error) return { data: null, error: mapPostgrestError(error) }

  const raw: RawReadinessData = {
    dsaProblems: (dsaResult.data ?? []).map((row) => ({
      topic: row.pattern,
      difficulty: row.difficulty,
      status: row.status,
      attempts: row.attempts,
    })),
    testAttempts: (testsResult.data ?? []).map((row) => ({
      score: row.score,
      maxScore: row.max_score,
      status: row.status,
    })),
    studyProgress: (studyResult.data ?? []).map((row) => ({
      dayNumber: row.day_number,
      dayTitle: dayTitleMap.get(row.day_number) ?? `Day ${row.day_number}`,
      progressPercent: row.progress_percent,
      status: row.status,
    })),
    githubReviews: (githubResult.data ?? []).map((row) => ({
      qualityScore: row.score,
      documentationScore: row.documentation_score,
      structureScore: row.structure_score,
      engineeringScore: row.engineering_score,
    })),
  }

  return { data: computeReadiness(raw), error: null }
}
