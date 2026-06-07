import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { Json, Difficulty } from '@/types/database'
import { mapDefinitionRow, mapQuestionRow } from '@/features/tests/lib/mappers'
import type { TestDefinition, TestQuestion, QuestionType, TestDefinitionType, ScheduleType, TestSectionConfig } from '@/features/tests/types'

export interface TestDefinitionInput {
  title: string
  description?: string | null
  testType: TestDefinitionType
  scheduleType: ScheduleType
  durationMinutes: number
  difficulty?: string | null
  topics?: string[]
  maxScore?: number
  isActive?: boolean
  coveredStudyDays?: number[]
  sections?: TestSectionConfig[]
}

export interface TestQuestionInput {
  questionType: QuestionType
  title: string
  body: string
  options?: Json | null
  correctAnswer?: string | null
  rubric?: string | null
  starterCode?: string | null
  metadata?: Json
  points?: number
  orderIndex?: number
  studyDay?: number | null
  topic?: string | null
}

export async function fetchAllTestDefinitionsAdmin(): Promise<ApiResult<TestDefinition[]>> {
  const { data, error } = await supabase
    .from('test_definitions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: mapPostgrestError(error) }

  return {
    data: (data ?? []).map((row) => mapDefinitionRow(row)),
    error: null,
  }
}

export async function fetchTestDefinitionAdmin(id: string): Promise<ApiResult<TestDefinition>> {
  const { data, error } = await supabase.from('test_definitions').select('*').eq('id', id).single()

  if (error) return { data: null, error: mapPostgrestError(error) }

  const { count } = await supabase
    .from('test_questions')
    .select('*', { count: 'exact', head: true })
    .eq('test_definition_id', id)

  return { data: mapDefinitionRow(data, count ?? 0), error: null }
}

export async function createTestDefinitionAdmin(
  input: TestDefinitionInput,
): Promise<ApiResult<TestDefinition>> {
  const { data, error } = await supabase
    .from('test_definitions')
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      test_type: input.testType,
      schedule_type: input.scheduleType,
      duration_minutes: input.durationMinutes,
      difficulty: (input.difficulty as Difficulty | null) ?? null,
      topics: input.topics ?? [],
      max_score: input.maxScore ?? 100,
      is_active: input.isActive ?? true,
      covered_study_days: input.coveredStudyDays ?? [],
      sections: (input.sections ?? []) as unknown as Json,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapDefinitionRow(data, 0), error: null }
}

export async function updateTestDefinitionAdmin(
  id: string,
  input: Partial<TestDefinitionInput>,
): Promise<ApiResult<TestDefinition>> {
  const { data, error } = await supabase
    .from('test_definitions')
    .update({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.testType !== undefined ? { test_type: input.testType } : {}),
      ...(input.scheduleType !== undefined ? { schedule_type: input.scheduleType } : {}),
      ...(input.durationMinutes !== undefined ? { duration_minutes: input.durationMinutes } : {}),
      ...(input.difficulty !== undefined
        ? { difficulty: input.difficulty as Difficulty | null }
        : {}),
      ...(input.topics !== undefined ? { topics: input.topics } : {}),
      ...(input.maxScore !== undefined ? { max_score: input.maxScore } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
      ...(input.coveredStudyDays !== undefined
        ? { covered_study_days: input.coveredStudyDays }
        : {}),
      ...(input.sections !== undefined ? { sections: input.sections as unknown as Json } : {}),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapDefinitionRow(data), error: null }
}

export async function deleteTestDefinitionAdmin(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('test_definitions').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function fetchQuestionsForTestAdmin(
  testDefinitionId: string,
): Promise<ApiResult<TestQuestion[]>> {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('test_definition_id', testDefinitionId)
    .order('order_index', { ascending: true })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapQuestionRow), error: null }
}

export async function createQuestionAdmin(
  testDefinitionId: string,
  input: TestQuestionInput,
): Promise<ApiResult<TestQuestion>> {
  const { data, error } = await supabase
    .from('test_questions')
    .insert({
      test_definition_id: testDefinitionId,
      question_type: input.questionType,
      title: input.title.trim(),
      body: input.body,
      options: input.options ?? null,
      correct_answer: input.correctAnswer ?? null,
      rubric: input.rubric ?? null,
      starter_code: input.starterCode ?? null,
      metadata: input.metadata ?? {},
      points: input.points ?? 1,
      order_index: input.orderIndex ?? 0,
      study_day: input.studyDay ?? null,
      topic: input.topic ?? null,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapQuestionRow(data), error: null }
}

export async function createQuestionsBulkAdmin(
  testDefinitionId: string,
  inputs: TestQuestionInput[],
): Promise<ApiResult<TestQuestion[]>> {
  if (!inputs.length) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('test_questions')
    .insert(
      inputs.map((input) => ({
        test_definition_id: testDefinitionId,
        question_type: input.questionType,
        title: input.title.trim(),
        body: input.body,
        options: input.options ?? null,
        correct_answer: input.correctAnswer ?? null,
        rubric: input.rubric ?? null,
        starter_code: input.starterCode ?? null,
        metadata: input.metadata ?? {},
        points: input.points ?? 1,
        order_index: input.orderIndex ?? 0,
        study_day: input.studyDay ?? null,
        topic: input.topic ?? null,
      })),
    )
    .select('*')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: (data ?? []).map(mapQuestionRow), error: null }
}

export async function updateQuestionAdmin(
  id: string,
  input: Partial<TestQuestionInput>,
): Promise<ApiResult<TestQuestion>> {
  const { data, error } = await supabase
    .from('test_questions')
    .update({
      ...(input.questionType !== undefined ? { question_type: input.questionType } : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.options !== undefined ? { options: input.options } : {}),
      ...(input.correctAnswer !== undefined ? { correct_answer: input.correctAnswer } : {}),
      ...(input.rubric !== undefined ? { rubric: input.rubric } : {}),
      ...(input.starterCode !== undefined ? { starter_code: input.starterCode } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.points !== undefined ? { points: input.points } : {}),
      ...(input.orderIndex !== undefined ? { order_index: input.orderIndex } : {}),
      ...(input.studyDay !== undefined ? { study_day: input.studyDay } : {}),
      ...(input.topic !== undefined ? { topic: input.topic } : {}),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapQuestionRow(data), error: null }
}

export async function deleteQuestionAdmin(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('test_questions').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function deleteAllQuestionsForTestAdmin(
  testDefinitionId: string,
): Promise<ApiResult<void>> {
  const { error } = await supabase
    .from('test_questions')
    .delete()
    .eq('test_definition_id', testDefinitionId)

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}
