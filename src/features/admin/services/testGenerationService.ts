import { getAIProvider } from '@/lib/ai'
import { AIProviderError } from '@/lib/ai/errors'
import type { TestSectionConfig } from '@/features/tests/types'
import type { ApiResult } from '@/types'
import {
  TEST_GENERATION_SYSTEM_PROMPT,
  buildSectionGenerationUserPrompt,
  parseGeneratedTestQuestions,
  type GeneratedTestQuestion,
  type TestGenerationSpec,
} from '../lib/testGenerationPrompt'
import { activeSections, batchSectionCounts } from '../lib/testSections'
import { buildTestGenerationContext } from './adminContentService'
import type { TestDefinitionInput } from './adminTestService'

const AI_BATCH_SIZE = 15

async function generateSectionBatch(
  test: TestDefinitionInput,
  spec: TestGenerationSpec,
  section: TestSectionConfig,
  batchSize: number,
  contentContext: string,
  existingTitles: string[],
): Promise<GeneratedTestQuestion[]> {
  const provider = getAIProvider()
  const userPrompt = buildSectionGenerationUserPrompt(
    test,
    spec,
    section,
    batchSize,
    contentContext,
    existingTitles,
  )

  const response = await provider.complete({
    messages: [{ id: crypto.randomUUID(), role: 'user', content: userPrompt }],
    systemPrompt: TEST_GENERATION_SYSTEM_PROMPT,
    temperature: 0.55,
    maxTokens: 8192,
  })

  return parseGeneratedTestQuestions(response.message.content, section)
}

export async function generateTestQuestionsWithAi(
  test: TestDefinitionInput,
  spec: TestGenerationSpec,
): Promise<ApiResult<GeneratedTestQuestion[]>> {
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

  const sections = activeSections(spec.sections)
  if (!sections.length) {
    return {
      data: null,
      error: { message: 'Enable at least one section with a question count greater than 0.' },
    }
  }

  const contentContext = await buildTestGenerationContext()
  const allQuestions: GeneratedTestQuestion[] = []

  try {
    for (const section of sections) {
      const batches = batchSectionCounts(section.questionCount, AI_BATCH_SIZE)
      for (const batchSize of batches) {
        const batch = await generateSectionBatch(
          test,
          spec,
          section,
          batchSize,
          contentContext,
          allQuestions.map((q) => q.title),
        )
        allQuestions.push(...batch)
      }
    }

    return { data: allQuestions, error: null }
  } catch (err) {
    const message =
      err instanceof AIProviderError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'AI question generation failed.'
    return { data: null, error: { message } }
  }
}
