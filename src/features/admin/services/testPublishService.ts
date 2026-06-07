import type { Json } from '@/types/database'
import type { ApiResult } from '@/types'
import type { GeneratedTestQuestion } from '../lib/testGenerationPrompt'
import { pickStudyDayForQuestion, sectionTotalMaxScore } from '../lib/testSections'
import {
  createQuestionsBulkAdmin,
  deleteAllQuestionsForTestAdmin,
  updateTestDefinitionAdmin,
  type TestDefinitionInput,
  type TestQuestionInput,
} from './adminTestService'

export interface CommitGeneratedQuestionsResult {
  questionCount: number
  maxScore: number
}

function toQuestionInputs(
  generated: GeneratedTestQuestion[],
  studyDays: number[],
  startOrderIndex: number,
): TestQuestionInput[] {
  return generated.map((q, index) => ({
    questionType: q.questionType,
    title: q.title,
    body: q.body,
    options: q.options,
    correctAnswer: q.correctAnswer,
    rubric: q.rubric,
    starterCode: q.starterCode,
    metadata: q.metadata as Json,
    points: q.points,
    studyDay: q.studyDay ?? pickStudyDayForQuestion(studyDays, startOrderIndex + index),
    topic: q.topic,
    orderIndex: startOrderIndex + index,
  }))
}

export async function commitGeneratedQuestionsAdmin(
  testId: string,
  definition: TestDefinitionInput,
  generated: GeneratedTestQuestion[],
  options: {
    mode: 'replace' | 'append'
    existingQuestionCount: number
    onPhase?: (phase: 'publishing') => void
  },
): Promise<ApiResult<CommitGeneratedQuestionsResult>> {
  if (!generated.length) {
    return { data: null, error: { message: 'No questions to add.' } }
  }

  const studyDays = definition.coveredStudyDays ?? []
  const sections = definition.sections ?? []

  if (options.mode === 'replace') {
    const deleteResult = await deleteAllQuestionsForTestAdmin(testId)
    if (deleteResult.error) return { data: null, error: deleteResult.error }
  }

  options.onPhase?.('publishing')

  const startOrderIndex = options.mode === 'append' ? options.existingQuestionCount : 0
  const inputs = toQuestionInputs(generated, studyDays, startOrderIndex)
  const createResult = await createQuestionsBulkAdmin(testId, inputs)
  if (createResult.error) return { data: null, error: createResult.error }

  const maxScore = Math.max(1, sectionTotalMaxScore(sections))
  const publishResult = await updateTestDefinitionAdmin(testId, {
    isActive: true,
    maxScore,
  })

  if (publishResult.error) return { data: null, error: publishResult.error }

  return {
    data: { questionCount: inputs.length, maxScore },
    error: null,
  }
}
