import { getAIProvider } from '@/lib/ai'
import { AIProviderError } from '@/lib/ai/errors'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { Json } from '@/types/database'
import { fetchGithubRepoSnapshot } from '../lib/githubApi'
import {
  buildEvaluationUserPrompt,
  GITHUB_EVALUATOR_SYSTEM_PROMPT,
  parseEvaluationJson,
} from '../lib/evaluationPrompt'
import { parseGithubRepoUrl } from '../lib/parseRepoUrl'
import type {
  GithubReviewHistoryItem,
  RepoEvaluationReport,
} from '../types'

export async function evaluateGithubRepo(
  userId: string,
  repoUrlInput: string,
): Promise<ApiResult<RepoEvaluationReport>> {
  const parsed = parseGithubRepoUrl(repoUrlInput)
  if (!parsed) {
    return { data: null, error: { message: 'Invalid GitHub repository URL.', code: 'invalid_url' } }
  }

  let snapshot
  try {
    snapshot = await fetchGithubRepoSnapshot(parsed)
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
      messages: [{ id: crypto.randomUUID(), role: 'user', content: buildEvaluationUserPrompt(snapshot) }],
      systemPrompt: GITHUB_EVALUATOR_SYSTEM_PROMPT,
      temperature: 0.4,
      maxTokens: 4096,
    })
    evaluation = parseEvaluationJson(response.message.content)
  } catch (err) {
    const message =
      err instanceof AIProviderError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'AI evaluation failed.'
    return { data: null, error: { message } }
  }

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
  }

  const saveResult = await saveReview(userId, parsed.owner, report)
  if (saveResult.data?.id) {
    report.id = saveResult.data.id
  }

  return { data: report, error: null }
}

async function saveReview(
  userId: string,
  owner: string,
  report: RepoEvaluationReport,
): Promise<ApiResult<{ id: string }>> {
  const { data, error } = await supabase
    .from('github_reviews')
    .insert({
      user_id: userId,
      github_username: owner,
      repo_name: report.repoName,
      repo_url: report.repoUrl,
      language: report.snapshot.metadata.primaryLanguage,
      stars: report.snapshot.metadata.stars,
      score: report.qualityScore,
      documentation_score: report.documentationScore,
      structure_score: report.structureScore,
      engineering_score: report.engineeringScore,
      summary: report.summary,
      strengths: report.strengths as unknown as Json,
      improvements: report.improvements as unknown as Json,
      report: {
        sections: report.sections,
      } as unknown as Json,
      repo_metadata: report.snapshot as unknown as Json,
    })
    .select('id')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: { id: data.id }, error: null }
}

export async function fetchReviewHistory(
  userId: string,
): Promise<ApiResult<GithubReviewHistoryItem[]>> {
  const { data, error } = await supabase
    .from('github_reviews')
    .select(
      'id, repo_name, repo_url, github_username, score, documentation_score, structure_score, engineering_score, summary, reviewed_at',
    )
    .eq('user_id', userId)
    .order('reviewed_at', { ascending: false })
    .limit(20)

  if (error) return { data: null, error: mapPostgrestError(error) }

  return {
    data: data.map((row) => ({
      id: row.id,
      repoName: row.repo_name,
      repoUrl: row.repo_url,
      owner: row.github_username,
      qualityScore: row.score,
      documentationScore: row.documentation_score,
      structureScore: row.structure_score,
      engineeringScore: row.engineering_score,
      summary: row.summary,
      reviewedAt: row.reviewed_at,
    })),
    error: null,
  }
}

export async function fetchReviewById(
  userId: string,
  reviewId: string,
): Promise<ApiResult<RepoEvaluationReport>> {
  const { data, error } = await supabase
    .from('github_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('user_id', userId)
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }

  const metadata = data.repo_metadata as RepoEvaluationReport['snapshot'] | null
  const reportJson = data.report as { sections?: RepoEvaluationReport['sections'] } | null

  return {
    data: {
      id: data.id,
      repoUrl: data.repo_url ?? '',
      repoName: data.repo_name,
      owner: data.github_username,
      qualityScore: data.score ?? 0,
      documentationScore: data.documentation_score ?? 0,
      structureScore: data.structure_score ?? 0,
      engineeringScore: data.engineering_score ?? 0,
      summary: data.summary ?? '',
      strengths: Array.isArray(data.strengths) ? (data.strengths as string[]) : [],
      improvements: Array.isArray(data.improvements) ? (data.improvements as string[]) : [],
      sections: reportJson?.sections ?? {
        documentation: '',
        structure: '',
        engineering: '',
        commitActivity: '',
        recommendations: [],
      },
      snapshot: metadata ?? {
        metadata: {
          name: data.repo_name,
          fullName: `${data.github_username}/${data.repo_name}`,
          description: null,
          url: data.repo_url ?? '',
          homepage: null,
          stars: data.stars,
          forks: 0,
          openIssues: 0,
          watchers: 0,
          defaultBranch: 'main',
          primaryLanguage: data.language,
          topics: [],
          license: null,
          isFork: false,
          archived: false,
          hasWiki: false,
          hasPages: false,
          createdAt: data.created_at,
          updatedAt: data.created_at,
          pushedAt: null,
          sizeKb: 0,
        },
        readme: null,
        readmeTruncated: false,
        commits: [],
        languages: {},
        fetchedAt: data.reviewed_at,
      },
      reviewedAt: data.reviewed_at,
    },
    error: null,
  }
}
