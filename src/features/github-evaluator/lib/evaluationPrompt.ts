import type { GithubRepoSnapshot } from '../types'
import { formatLanguageBreakdown, summarizeCommits } from './githubApi'

export const GITHUB_EVALUATOR_SYSTEM_PROMPT = `You are an expert software engineering interviewer and code reviewer evaluating GitHub repositories for SDE interview readiness.

Analyze the repository data provided and return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "qualityScore": number,
  "documentationScore": number,
  "structureScore": number,
  "engineeringScore": number,
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "sections": {
    "documentation": string,
    "structure": string,
    "engineering": string,
    "commitActivity": string,
    "recommendations": string[]
  }
}

Scoring guidelines (0-100 each):
- qualityScore: Overall interview-ready project quality
- documentationScore: README clarity, setup instructions, architecture docs, comments
- structureScore: Project organization, separation of concerns, naming, modularity
- engineeringScore: Testing, CI/CD, error handling, code practices, maintainability

Be specific and reference actual signals from the data. If README is missing, documentationScore should reflect that. Provide 3-5 strengths and 3-5 improvements. Section text should be 2-4 sentences each.`

export function buildEvaluationUserPrompt(snapshot: GithubRepoSnapshot): string {
  const { metadata, readme, readmeTruncated, commits, languages } = snapshot

  const commitLines = commits
    .slice(0, 20)
    .map((c) => `- [${c.sha}] ${c.date.slice(0, 10)} @${c.author}: ${c.message}`)
    .join('\n')

  return `Evaluate this GitHub repository for SDE interview readiness.

## Repository Metadata
- Name: ${metadata.fullName}
- Description: ${metadata.description ?? 'None'}
- Stars: ${metadata.stars} | Forks: ${metadata.forks} | Open Issues: ${metadata.openIssues}
- Primary Language: ${metadata.primaryLanguage ?? 'Unknown'}
- Topics: ${metadata.topics.join(', ') || 'None'}
- License: ${metadata.license ?? 'None'}
- Default Branch: ${metadata.defaultBranch}
- Size: ${metadata.sizeKb} KB
- Fork: ${metadata.isFork} | Archived: ${metadata.archived}
- Created: ${metadata.createdAt} | Last Push: ${metadata.pushedAt ?? 'Unknown'}

## Languages
${formatLanguageBreakdown(languages)}

## README ${readmeTruncated ? '(truncated)' : ''}
${readme ?? '** No README found **'}

## Recent Commit History (${commits.length} commits fetched)
${summarizeCommits(commits)}

${commitLines || 'No commits available.'}

Return the JSON evaluation object only.`
}

export function parseEvaluationJson(raw: string): {
  qualityScore: number
  documentationScore: number
  structureScore: number
  engineeringScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  sections: {
    documentation: string
    structure: string
    engineering: string
    commitActivity: string
    recommendations: string[]
  }
} {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = fenceMatch ? fenceMatch[1]!.trim() : trimmed

  const start = jsonText.indexOf('{')
  const end = jsonText.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('AI returned an invalid evaluation format.')
  }

  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>

  return {
    qualityScore: clampScore(parsed.qualityScore),
    documentationScore: clampScore(parsed.documentationScore),
    structureScore: clampScore(parsed.structureScore),
    engineeringScore: clampScore(parsed.engineeringScore),
    summary: String(parsed.summary ?? ''),
    strengths: stringArray(parsed.strengths),
    improvements: stringArray(parsed.improvements),
    sections: {
      documentation: String((parsed.sections as Record<string, unknown>)?.documentation ?? ''),
      structure: String((parsed.sections as Record<string, unknown>)?.structure ?? ''),
      engineering: String((parsed.sections as Record<string, unknown>)?.engineering ?? ''),
      commitActivity: String((parsed.sections as Record<string, unknown>)?.commitActivity ?? ''),
      recommendations: stringArray((parsed.sections as Record<string, unknown>)?.recommendations),
    },
  }
}

function clampScore(value: unknown): number {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}
