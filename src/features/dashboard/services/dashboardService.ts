import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import { fetchReadinessSnapshot } from '@/features/readiness/services/readinessService'
import type { ApiResult } from '@/types'
import { computeActivityStreak } from '../lib/activityUtils'
import type { DashboardActivity, DashboardSnapshot } from '../types'

export async function fetchDashboardSnapshot(userId: string): Promise<ApiResult<DashboardSnapshot>> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [dsaResult, testsResult, studyResult, readinessResult] = await Promise.all([
    supabase
      .from('dsa_progress')
      .select('problem_title, status, solved_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50),
    supabase
      .from('test_attempts')
      .select('id, status, score, max_score, completed_at, updated_at, test_definitions(title)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20),
    supabase
      .from('study_day_progress')
      .select('day_number, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(15),
    fetchReadinessSnapshot(userId),
  ])

  const error = dsaResult.error ?? testsResult.error ?? studyResult.error
  if (error) return { data: null, error: mapPostgrestError(error) }

  const dsaRows = dsaResult.data ?? []
  const testRows = testsResult.data ?? []
  const studyRows = studyResult.data ?? []

  const problemsSolved = dsaRows.filter((row) => row.status === 'solved').length
  const problemsThisWeek = dsaRows.filter(
    (row) =>
      row.status === 'solved' &&
      row.solved_at &&
      new Date(row.solved_at) >= weekAgo,
  ).length

  const testsCompleted = testRows.filter(
    (row) => row.status === 'completed' || row.status === 'auto_submitted',
  ).length
  const testsPending = testRows.filter((row) => row.status === 'in_progress').length

  const activityDates = [
    ...dsaRows.map((row) => row.solved_at ?? row.updated_at),
    ...testRows.map((row) => row.completed_at ?? row.updated_at),
    ...studyRows.map((row) => row.updated_at),
  ].filter(Boolean) as string[]

  const recentActivities = buildRecentActivities(dsaRows, testRows, studyRows)

  return {
    data: {
      problemsSolved,
      problemsThisWeek,
      currentStreak: computeActivityStreak(activityDates),
      testsCompleted,
      testsPending,
      readinessScore: readinessResult.data?.overallScore ?? 0,
      recentActivities,
    },
    error: null,
  }
}

type DsaRow = {
  problem_title: string
  status: string
  solved_at: string | null
  updated_at: string
}

type TestRow = {
  id: string
  status: string
  completed_at: string | null
  updated_at: string
  test_definitions: { title: string } | null
}

type StudyRow = {
  day_number: number
  status: string
  updated_at: string
}

function buildRecentActivities(
  dsaRows: DsaRow[],
  testRows: TestRow[],
  studyRows: StudyRow[],
): DashboardActivity[] {
  const items: DashboardActivity[] = []

  for (const row of dsaRows.slice(0, 5)) {
    if (row.status !== 'solved' && row.status !== 'in_progress') continue
    items.push({
      id: `dsa-${row.problem_title}-${row.updated_at}`,
      action: row.status === 'solved' ? `Solved ${row.problem_title}` : `Working on ${row.problem_title}`,
      module: 'DSA Tracker',
      timestamp: row.solved_at ?? row.updated_at,
      status: row.status === 'solved' ? 'completed' : 'in-progress',
    })
  }

  for (const row of testRows.slice(0, 5)) {
    const title = row.test_definitions?.title ?? 'Test'
    items.push({
      id: `test-${row.id}`,
      action:
        row.status === 'in_progress'
          ? `In progress: ${title}`
          : `Completed ${title}`,
      module: 'Tests',
      timestamp: row.completed_at ?? row.updated_at,
      status: row.status === 'in_progress' ? 'in-progress' : 'completed',
    })
  }

  for (const row of studyRows.slice(0, 5)) {
    items.push({
      id: `study-${row.day_number}`,
      action:
        row.status === 'completed'
          ? `Completed Day ${row.day_number}`
          : `Studying Day ${row.day_number}`,
      module: 'Study Plan',
      timestamp: row.updated_at,
      status: row.status === 'completed' ? 'completed' : 'in-progress',
    })
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)
}
