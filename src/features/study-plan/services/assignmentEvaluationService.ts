import { evaluateGithubRepo } from '@/features/github-evaluator/services/evaluationService'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { AssignmentEvaluation } from '../types/assignmentEvaluation'

export async function evaluateAssignmentRepo(input: {
  userId: string
  dayNumber: number
  assignmentId: string
  assignmentTitle: string
  repoUrl: string
}): Promise<ApiResult<AssignmentEvaluation['report']>> {
  const evalResult = await evaluateGithubRepo(input.userId, input.repoUrl)
  if (evalResult.error || !evalResult.data) {
    return { data: null, error: evalResult.error ?? { message: 'Evaluation failed' } }
  }

  const report = evalResult.data

  if (report.id) {
    const { error } = await supabase
      .from('github_reviews')
      .update({
        study_day: input.dayNumber,
        assignment_id: input.assignmentId,
        assignment_title: input.assignmentTitle,
      })
      .eq('id', report.id)
      .eq('user_id', input.userId)

    if (error) {
      return { data: null, error: mapPostgrestError(error) }
    }
  }

  return { data: report, error: null }
}

export async function fetchAssignmentEvaluations(
  userId: string,
  dayNumber: number,
  assignmentId: string,
): Promise<ApiResult<AssignmentEvaluation[]>> {
  const { data, error } = await supabase
    .from('github_reviews')
    .select(
      'id, user_id, study_day, assignment_id, assignment_title, repo_url, score, reviewed_at, summary, strengths, improvements',
    )
    .eq('user_id', userId)
    .eq('study_day', dayNumber)
    .eq('assignment_id', assignmentId)
    .order('reviewed_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      dayNumber: row.study_day ?? dayNumber,
      assignmentId: row.assignment_id ?? assignmentId,
      assignmentTitle: row.assignment_title ?? '',
      repoUrl: row.repo_url ?? '',
      qualityScore: row.score ?? 0,
      reviewedAt: row.reviewed_at,
      report: null,
    })),
    error: null,
  }
}
