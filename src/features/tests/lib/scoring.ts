import type {
  AttemptAnswers,
  CodingMetadata,
  QuestionAnswer,
  TestQuestion,
} from '../types'

export interface GradeResult {
  answers: AttemptAnswers
  score: number
  maxScore: number
}

export function gradeAttempt(questions: TestQuestion[], answers: AttemptAnswers): GradeResult {
  const graded: AttemptAnswers = { ...answers }
  let score = 0
  let maxScore = 0

  for (const question of questions) {
    maxScore += question.points
    const existing = graded[question.id] ?? { value: '' }
    const result = gradeQuestion(question, existing)
    graded[question.id] = result
    score += result.pointsEarned ?? 0
  }

  return { answers: graded, score: roundScore(score), maxScore: roundScore(maxScore) }
}

function gradeQuestion(question: TestQuestion, answer: QuestionAnswer): QuestionAnswer {
  const value = answer.value?.trim() ?? ''

  if (question.questionType === 'mcq') {
    const isCorrect = value.length > 0 && value === question.correctAnswer
    return {
      value,
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
      graded: true,
    }
  }

  if (question.questionType === 'subjective') {
    const wordCount = value.split(/\s+/).filter(Boolean).length
    let ratio = 0
    if (wordCount >= 80) ratio = 1
    else if (wordCount >= 40) ratio = 0.75
    else if (wordCount >= 20) ratio = 0.5
    else if (wordCount >= 8) ratio = 0.25

    return {
      value,
      isCorrect: ratio >= 0.5,
      pointsEarned: roundScore(question.points * ratio),
      graded: true,
    }
  }

  if (question.questionType === 'coding') {
    const meta = question.metadata as CodingMetadata
    if (!meta?.testCases?.length || !value) {
      return { value, isCorrect: false, pointsEarned: 0, graded: true }
    }

    const { passed, total } = runCodingTests(value, meta)
    const ratio = total > 0 ? passed / total : 0
    return {
      value,
      isCorrect: ratio === 1,
      pointsEarned: roundScore(question.points * ratio),
      graded: true,
    }
  }

  return { value, pointsEarned: 0, graded: true }
}

export function runCodingTests(
  code: string,
  meta: CodingMetadata,
): { passed: number; total: number } {
  const { testCases, functionName } = meta
  let passed = 0

  for (const testCase of testCases) {
    try {
      const fn = new Function(
        `${code}\nreturn typeof ${functionName} === 'function' ? ${functionName} : null;`,
      )()
      if (typeof fn !== 'function') continue

      const args = Object.values(testCase.input)
      const result = fn(...args)
      if (deepEqual(result, testCase.expected)) passed += 1
    } catch {
      // failed test case
    }
  }

  return { passed, total: testCases.length }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100
}
