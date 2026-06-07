import type { QuestionType, TestSectionConfig } from '@/features/tests/types'
import type { TestDefinitionInput } from '../services/adminTestService'

export interface TestGenerationSpec {
  instruction: string
  sections: TestSectionConfig[]
  topics: string[]
  studyDays: number[]
}

export interface GeneratedTestQuestion {
  questionType: QuestionType
  title: string
  body: string
  options: Array<{ id: string; label: string }> | null
  correctAnswer: string | null
  rubric: string | null
  starterCode: string | null
  metadata: Record<string, unknown>
  points: number
  topic: string | null
  studyDay: number | null
  sectionId: string
}

export const TEST_GENERATION_SYSTEM_PROMPT = `You are an expert SDE intern interview content author.

Generate original, unambiguous test questions for a technical assessment platform.
Follow the style guides and difficulty calibration provided in the admin content prompts.
Return ONLY valid JSON (no markdown fences) matching this schema:

{
  "questions": [
    {
      "questionType": "mcq" | "subjective" | "coding",
      "title": "short label",
      "body": "full question prompt shown to the student",
      "options": [{"id": "a", "label": "..."}, {"id": "b", "label": "..."}, {"id": "c", "label": "..."}, {"id": "d", "label": "..."}] | null,
      "correctAnswer": "option id for mcq" | null,
      "rubric": "grading rubric for subjective" | null,
      "starterCode": "function solve(...) { ... }" | null,
      "metadata": { "functionName": "solve", "testCases": [{"input": {}, "expected": ...}] } | {},
      "points": number,
      "topic": "string or null",
      "studyDay": number or null
    }
  ]
}

Rules:
- MCQ: exactly 4 options with ids a, b, c, d; exactly one correctAnswer.
- Subjective: rubric with 3–5 bullet points for full credit.
- Coding / DSA: include starterCode, metadata.functionName, and 2–4 testCases with JSON-serializable input/expected.
- Do not duplicate questions within the batch. Each must be distinct.
- Match the section difficulty and question type exactly.
- When study days are provided, distribute questions across those days.`

export function buildSectionGenerationUserPrompt(
  test: TestDefinitionInput,
  spec: TestGenerationSpec,
  section: TestSectionConfig,
  batchSize: number,
  contentPromptContext: string,
  existingTitles: string[],
): string {
  const adminInstruction = spec.instruction.trim()
    ? `\n## Admin instructions\n${spec.instruction.trim()}\n`
    : ''

  const studyDayLine = spec.studyDays.length
    ? spec.studyDays.join(', ')
    : 'Any / not specified'

  const avoidDupes =
    existingTitles.length > 0
      ? `\nDo NOT repeat or closely paraphrase these existing titles:\n${existingTitles.map((t) => `- ${t}`).join('\n')}\n`
      : ''

  return `${contentPromptContext ? `## Content style guides\n${contentPromptContext}\n\n` : ''}## Test context
- Title: ${test.title}
- Description: ${test.description?.trim() || 'None'}
- Test type: ${test.testType}
- Topics: ${spec.topics.length ? spec.topics.join(', ') : 'General SDE intern interview prep'}
- Study days to cover: ${studyDayLine}

## Section: ${section.label}
- Question type: ${section.questionType}
- Difficulty: ${section.difficulty}
- Section time budget: ${section.durationMinutes} minutes
- Points per question: ${section.pointsPerQuestion}
${section.questionType === 'mcq' && section.negativeMarking.enabled ? `- Negative marking applies: −${section.negativeMarking.penaltyPerWrong} per wrong MCQ answer\n` : ''}${adminInstruction}${avoidDupes}
Generate exactly ${batchSize} ${section.questionType} question(s) for this section. Return the JSON object only.`
}

export function parseGeneratedTestQuestions(
  raw: string,
  section: TestSectionConfig,
): GeneratedTestQuestion[] {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = fenceMatch ? fenceMatch[1]!.trim() : trimmed

  const start = jsonText.indexOf('{')
  const end = jsonText.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error('AI returned an invalid question format.')
  }

  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>
  const rows = parsed.questions

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('AI returned no questions.')
  }

  return rows.map((row, index) =>
    normalizeQuestion(row as Record<string, unknown>, index, section),
  )
}

function normalizeQuestion(
  row: Record<string, unknown>,
  index: number,
  section: TestSectionConfig,
): GeneratedTestQuestion {
  if (row.questionType !== section.questionType) {
    throw new Error(`Question ${index + 1} type does not match section "${section.label}".`)
  }

  const title = String(row.title ?? '').trim()
  const body = String(row.body ?? '').trim()
  if (!title || !body) {
    throw new Error(`Question ${index + 1} is missing a title or body.`)
  }

  const questionType = section.questionType
  const options = normalizeOptions(row.options, questionType)
  const correctAnswer =
    questionType === 'mcq' ? String(row.correctAnswer ?? '').trim() || null : null

  if (questionType === 'mcq' && (!options?.length || !correctAnswer)) {
    throw new Error(`MCQ question ${index + 1} is missing options or a correct answer.`)
  }

  const rubric =
    questionType === 'subjective' ? String(row.rubric ?? '').trim() || null : null
  const starterCode =
    questionType === 'coding' ? String(row.starterCode ?? '').trim() || null : null
  const metadata =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {}

  return {
    questionType,
    title,
    body,
    options,
    correctAnswer,
    rubric,
    starterCode,
    metadata: { ...metadata, sectionId: section.id },
    points: normalizePoints(row.points, section.pointsPerQuestion),
    topic: row.topic != null && String(row.topic).trim() ? String(row.topic).trim() : null,
    studyDay: normalizeStudyDay(row.studyDay),
    sectionId: section.id,
  }
}

function normalizeOptions(
  raw: unknown,
  questionType: QuestionType,
): Array<{ id: string; label: string }> | null {
  if (questionType !== 'mcq') return null
  if (!Array.isArray(raw)) return null

  return raw
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const id = String(record.id ?? ['a', 'b', 'c', 'd'][i] ?? `opt${i + 1}`).trim()
      const label = String(record.label ?? '').trim()
      if (!label) return null
      return { id, label }
    })
    .filter((item): item is { id: string; label: string } => item != null)
}

function normalizePoints(value: unknown, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.round(n * 2) / 2
}

function normalizeStudyDay(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 15) return null
  return n
}
