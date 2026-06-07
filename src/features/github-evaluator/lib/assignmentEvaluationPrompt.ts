import type { RoadmapAssignmentContext } from '@/features/study-plan/lib/getRoadmapAssignment'
import type { GithubRepoSnapshot } from '../types'
import { buildEvaluationUserPrompt } from './evaluationPrompt'

export const ASSIGNMENT_EVALUATOR_SYSTEM_PROMPT = `You are an expert SDE interviewer grading a student's GitHub submission for a specific coding assignment.

You must evaluate TWO dimensions:
1. **Assignment accomplishment** — Did the repository actually solve the assigned problem? Are required behaviors implemented correctly?
2. **Repository quality** — Documentation, structure, and engineering practices (secondary for grading, still report scores).

Return ONLY valid JSON (no markdown fences) matching this schema:
{
  "qualityScore": number,
  "documentationScore": number,
  "structureScore": number,
  "engineeringScore": number,
  "assignmentAccomplishmentScore": number,
  "requirementsMetScore": number,
  "functionalityScore": number,
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "accomplishedCriteria": string[],
  "missingRequirements": string[],
  "sections": {
    "documentation": string,
    "structure": string,
    "engineering": string,
    "commitActivity": string,
    "assignmentAccomplishment": string,
    "requirementsCoverage": string,
    "recommendations": string[]
  }
}

Scoring (0-100):
- assignmentAccomplishmentScore: Overall how well the assignment problem was solved (PRIMARY grade)
- requirementsMetScore: Explicit assignment requirements / rubric items satisfied
- functionalityScore: Correctness and completeness of core behavior inferred from code + README
- qualityScore: Overall repo interview-readiness (same as generic evaluator)
- documentationScore, structureScore, engineeringScore: As in standard repo review

Be evidence-based. Reference README claims, file names, and source snippets. If source code is missing or empty, assignmentAccomplishmentScore must be low and explain why. Provide 3-6 accomplishedCriteria and 3-6 missingRequirements when applicable.`

export function buildAssignmentEvaluationUserPrompt(
  snapshot: GithubRepoSnapshot,
  context: RoadmapAssignmentContext,
): string {
  const repoSection = buildEvaluationUserPrompt(snapshot)
  const { assignment, dayNumber, dayTitle, daySubtitle } = context

  const fileTree = snapshot.rootEntries?.length
    ? snapshot.rootEntries
        .map((e) => `- ${e.type === 'dir' ? '[dir]' : '[file]'} ${e.path}${e.type === 'file' ? ` (${e.size} bytes)` : ''}`)
        .join('\n')
    : 'File tree not available.'

  const sourceSection = snapshot.sourceSamples?.length
    ? snapshot.sourceSamples
        .map(
          (sample) =>
            `### ${sample.path}${sample.truncated ? ' (truncated)' : ''}\n\`\`\`\n${sample.content}\n\`\`\``,
        )
        .join('\n\n')
    : '** No source files fetched — infer from README and file tree only **'

  return `${repoSection}

---

## Study Plan Assignment Context
- Day ${dayNumber}: ${dayTitle}${daySubtitle ? ` — ${daySubtitle}` : ''}
- Assignment ID: ${assignment.id}
- Assignment Title: ${assignment.title}
- Assignment Brief: ${assignment.description ?? 'Implement the assigned data structure or algorithm as described in the title.'}

## Your Task
Grade whether this repository accomplishes the assignment above — not just whether it looks like a good GitHub project.

Check for:
- Core data structure / algorithm implementation matching the assignment
- Required operations (e.g. get/put/remove, resize, traverse) if implied by the title/description
- Evidence of working logic in source files or README demos
- Tests or examples demonstrating correctness (bonus, not always required)

## Repository File Tree
${fileTree}

## Source Code Samples
${sourceSection}

Return the JSON evaluation object only.`
}

export function parseAssignmentEvaluationJson(raw: string): {
  qualityScore: number
  documentationScore: number
  structureScore: number
  engineeringScore: number
  assignmentAccomplishmentScore: number
  requirementsMetScore: number
  functionalityScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  accomplishedCriteria: string[]
  missingRequirements: string[]
  sections: {
    documentation: string
    structure: string
    engineering: string
    commitActivity: string
    assignmentAccomplishment: string
    requirementsCoverage: string
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
  const sections = (parsed.sections as Record<string, unknown>) ?? {}

  return {
    qualityScore: clampScore(parsed.qualityScore),
    documentationScore: clampScore(parsed.documentationScore),
    structureScore: clampScore(parsed.structureScore),
    engineeringScore: clampScore(parsed.engineeringScore),
    assignmentAccomplishmentScore: clampScore(parsed.assignmentAccomplishmentScore),
    requirementsMetScore: clampScore(parsed.requirementsMetScore),
    functionalityScore: clampScore(parsed.functionalityScore),
    summary: String(parsed.summary ?? ''),
    strengths: stringArray(parsed.strengths),
    improvements: stringArray(parsed.improvements),
    accomplishedCriteria: stringArray(parsed.accomplishedCriteria),
    missingRequirements: stringArray(parsed.missingRequirements),
    sections: {
      documentation: String(sections.documentation ?? ''),
      structure: String(sections.structure ?? ''),
      engineering: String(sections.engineering ?? ''),
      commitActivity: String(sections.commitActivity ?? ''),
      assignmentAccomplishment: String(sections.assignmentAccomplishment ?? ''),
      requirementsCoverage: String(sections.requirementsCoverage ?? ''),
      recommendations: stringArray(sections.recommendations),
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
