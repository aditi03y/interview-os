import { evaluateAssignmentGithubRepo } from '@/features/github-evaluator/services/assignmentEvaluationService'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { RepoEvaluationReport } from '@/features/github-evaluator/types'
import type { RoadmapAssignmentContext } from '@/features/study-plan/lib/getRoadmapAssignment'
import { getRoadmapAssignment } from '../lib/getRoadmapAssignment'
import type { AssignmentEvaluation } from '../types/assignmentEvaluation'

export async function evaluateAssignmentRepo(input: {
  userId: string
  dayNumber: number
  assignmentId: string
  assignmentTitle: string
  assignmentDescription?: string
  repoUrl: string
}): Promise<ApiResult<RepoEvaluationReport>> {
  const context: RoadmapAssignmentContext =
    getRoadmapAssignment(input.assignmentId) ?? {
      dayNumber: input.dayNumber,
      dayTitle: `Day ${input.dayNumber}`,
      daySubtitle: '',
      assignment: {
        id: input.assignmentId,
        title: input.assignmentTitle,
        description: input.assignmentDescription,
      },
    }

  return evaluateAssignmentGithubRepo(input.userId, input.repoUrl, context)
}

export async function fetchAssignmentEvaluations(
  userId: string,
  dayNumber: number,
  assignmentId: string,
): Promise<ApiResult<AssignmentEvaluation[]>> {
  const { data, error } = await supabase
    .from('github_reviews')
    .select(
      'id, user_id, study_day, assignment_id, assignment_title, repo_url, score, reviewed_at, summary, strengths, improvements, report',
    )
    .eq('user_id', userId)
    .eq('study_day', dayNumber)
    .eq('assignment_id', assignmentId)
    .order('reviewed_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }

  return {
    data: (data ?? []).map((row) => {
      const reportJson = row.report as {
        assignmentEvaluation?: RepoEvaluationReport['assignmentEvaluation']
        repoQualityScore?: number
      } | null

      return {
        id: row.id,
        userId: row.user_id,
        dayNumber: row.study_day ?? dayNumber,
        assignmentId: row.assignment_id ?? assignmentId,
        assignmentTitle: row.assignment_title ?? '',
        repoUrl: row.repo_url ?? '',
        qualityScore: reportJson?.repoQualityScore ?? row.score ?? 0,
        assignmentAccomplishmentScore:
          reportJson?.assignmentEvaluation?.assignmentAccomplishmentScore ?? row.score ?? 0,
        reviewedAt: row.reviewed_at,
        report: null,
      }
    }),
    error: null,
  }
}
