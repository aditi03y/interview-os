import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { Json } from '@/types/database'
import { gradeAttempt, maxPointsForQuestion } from '../lib/scoring'
import { mapQuestionRow } from '../lib/mappers'
import type { CodingTestCaseResult, TestQuestion } from '../types'
import { analyzePracticeAttempt } from './practiceAnalysisService'

export interface PracticeQuestionSummary extends TestQuestion {
  testTitle: string
  attemptCount: number
}

export interface PracticeAttemptRecord {
  id: string
  questionId: string
  language: string
  code: string
  timeComplexity: string
  spaceComplexity: string
  visibleResults: CodingTestCaseResult[]
  hiddenResults: CodingTestCaseResult[]
  score: number
  maxScore: number
  complexityTimeCorrect: boolean
  complexitySpaceCorrect: boolean
  aiAnalysis: string | null
  createdAt: string
}

export async function fetchPracticeQuestions(
  userId: string,
): Promise<ApiResult<PracticeQuestionSummary[]>> {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*, test_definitions!inner(title, is_active)')
    .eq('question_type', 'coding')
    .eq('test_definitions.is_active', true)
    .order('order_index')

  if (error) return { data: null, error: mapPostgrestError(error) }

  const { data: attempts } = await supabase
    .from('dsa_practice_attempts')
    .select('question_id')
    .eq('user_id', userId)

  const countMap = new Map<string, number>()
  for (const row of attempts ?? []) {
    countMap.set(row.question_id, (countMap.get(row.question_id) ?? 0) + 1)
  }

  const questions: PracticeQuestionSummary[] = (data ?? []).map((row) => {
    const def = row.test_definitions as { title: string }
    const q = mapQuestionRow(row)
    return {
      ...q,
      testTitle: def.title,
      attemptCount: countMap.get(q.id) ?? 0,
    }
  })

  return { data: questions, error: null }
}

export async function fetchPracticeQuestion(
  questionId: string,
): Promise<ApiResult<TestQuestion>> {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapQuestionRow(data), error: null }
}

export async function fetchPracticeAttempts(
  userId: string,
  questionId: string,
): Promise<ApiResult<PracticeAttemptRecord[]>> {
  const { data, error } = await supabase
    .from('dsa_practice_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }

  return {
    data: (data ?? []).map(mapPracticeRow),
    error: null,
  }
}

export async function submitPracticeAttempt(input: {
  userId: string
  question: TestQuestion
  code: string
  language: string
  timeComplexity: string
  spaceComplexity: string
}): Promise<ApiResult<PracticeAttemptRecord>> {
  const { userId, question, code, language, timeComplexity, spaceComplexity } = input

  const answer = {
    value: code,
    language,
    timeComplexity,
    spaceComplexity,
  }

  const graded = gradeAttempt([question], { [question.id]: answer })
  const result = graded.answers[question.id]!
  const visibleResults = (result.testResults ?? []).filter((r) => !r.hidden)
  const hiddenResults = (result.testResults ?? []).filter((r) => r.hidden)

  const aiAnalysis = await analyzePracticeAttempt({
    question,
    code,
    language,
    timeComplexity,
    spaceComplexity,
    testResults: result.testResults ?? [],
  })

  const { data, error } = await supabase
    .from('dsa_practice_attempts')
    .insert({
      user_id: userId,
      question_id: question.id,
      test_definition_id: question.testDefinitionId,
      language,
      code,
      time_complexity: timeComplexity,
      space_complexity: spaceComplexity,
      visible_results: visibleResults as unknown as Json,
      hidden_results: hiddenResults as unknown as Json,
      score: result.pointsEarned ?? 0,
      max_score: maxPointsForQuestion(question),
      complexity_time_correct: result.complexityTimeCorrect ?? false,
      complexity_space_correct: result.complexitySpaceCorrect ?? false,
      ai_analysis: aiAnalysis,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapPracticeRow(data), error: null }
}

function mapPracticeRow(row: {
  id: string
  question_id: string
  language: string
  code: string
  time_complexity: string
  space_complexity: string
  visible_results: Json
  hidden_results: Json
  score: number
  max_score: number
  complexity_time_correct: boolean
  complexity_space_correct: boolean
  ai_analysis: string | null
  created_at: string
}): PracticeAttemptRecord {
  return {
    id: row.id,
    questionId: row.question_id,
    language: row.language,
    code: row.code,
    timeComplexity: row.time_complexity,
    spaceComplexity: row.space_complexity,
    visibleResults: (row.visible_results ?? []) as unknown as CodingTestCaseResult[],
    hiddenResults: (row.hidden_results ?? []) as unknown as CodingTestCaseResult[],
    score: Number(row.score),
    maxScore: Number(row.max_score),
    complexityTimeCorrect: row.complexity_time_correct,
    complexitySpaceCorrect: row.complexity_space_correct,
    aiAnalysis: row.ai_analysis,
    createdAt: row.created_at,
  }
}
