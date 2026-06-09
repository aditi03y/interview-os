import { getAIProvider } from '@/lib/ai'
import type { CodingTestCaseResult, TestQuestion } from '../types'
import { isCodingMetadata } from '../types'

interface AnalyzeInput {
  question: TestQuestion
  code: string
  language: string
  timeComplexity: string
  spaceComplexity: string
  testResults: CodingTestCaseResult[]
}

export async function analyzePracticeAttempt(input: AnalyzeInput): Promise<string | null> {
  const meta = isCodingMetadata(input.question.metadata) ? input.question.metadata : null
  const passed = input.testResults.filter((r) => r.passed).length
  const total = input.testResults.length

  const prompt = `You are an SDE interview coach. Analyze this coding practice submission.

Problem: ${input.question.title}
${input.question.body}

Language: ${input.language}
Submitted time complexity: ${input.timeComplexity}
Submitted space complexity: ${input.spaceComplexity}
Expected time complexity: ${meta?.expectedTimeComplexity ?? 'not specified'}
Expected space complexity: ${meta?.expectedSpaceComplexity ?? 'not specified'}
Test cases passed: ${passed}/${total}

Code:
\`\`\`${input.language}
${input.code}
\`\`\`

Failed cases:
${input.testResults
  .filter((r) => !r.passed)
  .map(
    (r) =>
      `- Input ${JSON.stringify(r.input)} expected ${JSON.stringify(r.expected)} got ${JSON.stringify(r.actual)} ${r.error ?? ''}`,
  )
  .join('\n') || 'None — all passed'}

Write a concise analysis (markdown, max 250 words):
1. How close is this to an optimal solution?
2. What was done well?
3. What to improve (algorithm, edge cases, complexity)?
4. Complexity assessment vs expected.`

  try {
    const provider = getAIProvider()
    if (!provider.isConfigured()) return null
    const response = await provider.complete({
      messages: [{ id: crypto.randomUUID(), role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 1024,
    })
    return response.message.content.trim() || null
  } catch {
    return null
  }
}
