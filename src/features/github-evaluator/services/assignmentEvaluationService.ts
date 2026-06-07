import { getAIProvider } from '@/lib/ai'
import { AIProviderError } from '@/lib/ai/errors'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { Json } from '@/types/database'
import type { RoadmapAssignmentContext } from '@/features/study-plan/lib/getRoadmapAssignment'
import {
  ASSIGNMENT_EVALUATOR_SYSTEM_PROMPT,
  buildAssignmentEvaluationUserPrompt,
  parseAssignmentEvaluationJson,
} from '../lib/assignmentEvaluationPrompt'
import { fetchGithubRepoSnapshotForAssignment } from '../lib/githubApi'
import { parseGithubRepoUrl } from '../lib/parseRepoUrl'
import type { RepoEvaluationReport } from '../types'

export async function evaluateAssignmentGithubRepo(
  userId: string,
  repoUrlInput: string,
  assignmentContext: RoadmapAssignmentContext,
): Promise<ApiResult<RepoEvaluationReport>> {
  const parsed = parseGithubRepoUrl(repoUrlInput)
  if (!parsed) {
    return { data: null, error: { message: 'Invalid GitHub repository URL.', code: 'invalid_url' } }
  }

  let snapshot
  try {
    snapshot = await fetchGithubRepoSnapshotForAssignment(parsed)
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Failed to fetch repository.' },
    }
  }

  const provider = getAIProvider()
  if (!provider.isConfigured()) {
    return {
      data: null,
      error: {
        message: 'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.',
        code: 'missing_api_key',
      },
    }
  }

  let evaluation
  try {
    const response = await provider.complete({
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: buildAssignmentEvaluationUserPrompt(snapshot, assignmentContext),
        },
      ],
      systemPrompt: ASSIGNMENT_EVALUATOR_SYSTEM_PROMPT,
      temperature: 0.35,
      maxTokens: 4096,
    })
    evaluation = parseAssignmentEvaluationJson(response.message.content)
  } catch (err) {
    const message =
      err instanceof AIProviderError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'AI evaluation failed.'
    return { data: null, error: { message } }
  }

  const { assignment, dayNumber, dayTitle } = assignmentContext

  const report: RepoEvaluationReport = {
    repoUrl: parsed.url,
    repoName: snapshot.metadata.name,
    owner: parsed.owner,
    qualityScore: evaluation.qualityScore,
    documentationScore: evaluation.documentationScore,
    structureScore: evaluation.structureScore,
    engineeringScore: evaluation.engineeringScore,
    summary: evaluation.summary,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    sections: evaluation.sections,
    snapshot,
    reviewedAt: new Date().toISOString(),
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dayNumber,
      dayTitle,
    },
    assignmentEvaluation: {
      assignmentAccomplishmentScore: evaluation.assignmentAccomplishmentScore,
      requirementsMetScore: evaluation.requirementsMetScore,
      functionalityScore: evaluation.functionalityScore,
      accomplishedCriteria: evaluation.accomplishedCriteria,
      missingRequirements: evaluation.missingRequirements,
    },
  }

  const saveResult = await saveAssignmentReview(userId, parsed.owner, report)
  if (saveResult.data?.id) {
    report.id = saveResult.data.id
  }

  return { data: report, error: null }
}

async function saveAssignmentReview(
  userId: string,
  owner: string,
  report: RepoEvaluationReport,
): Promise<ApiResult<{ id: string }>> {
  const accomplishmentScore = report.assignmentEvaluation?.assignmentAccomplishmentScore ?? report.qualityScore

  const { data, error } = await supabase
    .from('github_reviews')
    .insert({
      user_id: userId,
      github_username: owner,
      repo_name: report.repoName,
      repo_url: report.repoUrl,
      language: report.snapshot.metadata.primaryLanguage,
      stars: report.snapshot.metadata.stars,
      score: accomplishmentScore,
      documentation_score: report.documentationScore,
      structure_score: report.structureScore,
      engineering_score: report.engineeringScore,
      summary: report.summary,
      strengths: report.strengths as unknown as Json,
      improvements: report.improvements as unknown as Json,
      study_day: report.assignment?.dayNumber ?? null,
      assignment_id: report.assignment?.id ?? null,
      assignment_title: report.assignment?.title ?? null,
      report: {
        sections: report.sections,
        assignment: report.assignment,
        assignmentEvaluation: report.assignmentEvaluation,
        repoQualityScore: report.qualityScore,
      } as unknown as Json,
      repo_metadata: report.snapshot as unknown as Json,
    })
    .select('id')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: { id: data.id }, error: null }
}
