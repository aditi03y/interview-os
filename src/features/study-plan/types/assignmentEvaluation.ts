import type { RepoEvaluationReport } from '@/features/github-evaluator/types'

export interface AssignmentEvaluation {
  id: string
  userId: string
  dayNumber: number
  assignmentId: string
  assignmentTitle: string
  repoUrl: string
  qualityScore: number
  reviewedAt: string
  report: RepoEvaluationReport | null
}
