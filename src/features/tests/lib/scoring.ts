import type {
  AttemptAnswers,
  CodingMetadata,
  QuestionAnswer,
  TestGradingConfig,
  TestQuestion,
} from '../types'
import { getQuestionSectionId, isCodingMetadata } from '../types'
import { gradeComplexityAnswer, COMPLEXITY_MARK_EACH } from './complexityGrading'
import { DEFAULT_CODING_LANGUAGE, runCodingTestSuite } from './codingRunner'

export interface GradeResult {
  answers: AttemptAnswers
  score: number
  maxScore: number
}

export function gradeAttempt(
  questions: TestQuestion[],
  answers: AttemptAnswers,
  grading?: TestGradingConfig,
): GradeResult {
  const graded: AttemptAnswers = { ...answers }
  let score = 0
  let maxScore = 0
  const sectionById = new Map((grading?.sections ?? []).map((section) => [section.id, section]))

  for (const question of questions) {
    const existing = graded[question.id] ?? { value: '' }
    const result = gradeQuestion(question, existing)
    graded[question.id] = result
    score += result.pointsEarned ?? 0
    maxScore += maxPointsForQuestion(question)

    const sectionId = getQuestionSectionId(question)
    const section = sectionId ? sectionById.get(sectionId) : undefined
    const negativeMarking = section?.negativeMarking

    if (
      question.questionType === 'mcq' &&
      negativeMarking?.enabled &&
      result.value &&
      result.isCorrect === false
    ) {
      score -= negativeMarking.penaltyPerWrong
    }
  }

  return {
    answers: graded,
    score: roundScore(Math.max(0, score)),
    maxScore: roundScore(maxScore),
  }
}

export function maxPointsForQuestion(question: TestQuestion): number {
  if (question.questionType !== 'coding') return question.points
  const meta = isCodingMetadata(question.metadata) ? question.metadata : null
  let complexityMax = 0
  if (meta?.expectedTimeComplexity) complexityMax += COMPLEXITY_MARK_EACH
  if (meta?.expectedSpaceComplexity) complexityMax += COMPLEXITY_MARK_EACH
  return question.points + complexityMax
}

function gradeQuestion(question: TestQuestion, answer: QuestionAnswer): QuestionAnswer {
  const value = answer.value?.trim() ?? ''

  if (question.questionType === 'mcq') {
    const isCorrect = value.length > 0 && value === question.correctAnswer
    return {
      ...answer,
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
      ...answer,
      value,
      isCorrect: ratio >= 0.5,
      pointsEarned: roundScore(question.points * ratio),
      graded: true,
    }
  }

  if (question.questionType === 'coding') {
    const meta = isCodingMetadata(question.metadata) ? question.metadata : null
    if (!meta?.testCases?.length || !value) {
      return {
        ...answer,
        value,
        isCorrect: false,
        pointsEarned: 0,
        testResults: [],
        graded: true,
      }
    }

    const run = runCodingTestSuite(value, meta, {
      includeHidden: true,
      language: answer.language ?? DEFAULT_CODING_LANGUAGE,
    })

    const caseRatio = run.total > 0 ? run.passed / run.total : 0
    const casePoints = roundScore(question.points * caseRatio)

    const timeGrade = gradeComplexityAnswer(answer.timeComplexity, meta.expectedTimeComplexity)
    const spaceGrade = gradeComplexityAnswer(answer.spaceComplexity, meta.expectedSpaceComplexity)

    const complexityPoints = timeGrade.points + spaceGrade.points
    const totalPoints = roundScore(casePoints + complexityPoints)
    const allCasesPassed = run.total > 0 && run.passed === run.total

    return {
      ...answer,
      value,
      testResults: run.results,
      complexityTimeCorrect: timeGrade.correct,
      complexitySpaceCorrect: spaceGrade.correct,
      isCorrect: allCasesPassed && timeGrade.correct && spaceGrade.correct,
      pointsEarned: totalPoints,
      graded: true,
    }
  }

  return { ...answer, value, pointsEarned: 0, graded: true }
}

/** @deprecated use runCodingTestSuite */
export function runCodingTests(
  code: string,
  meta: CodingMetadata,
): { passed: number; total: number } {
  const run = runCodingTestSuite(code, meta, { includeHidden: true })
  return { passed: run.passed, total: run.total }
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100
}
