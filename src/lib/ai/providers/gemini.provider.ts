import { AIProviderError } from '../errors'
import { buildSystemPrompt, DEFAULT_MENTOR_SYSTEM_PROMPT } from '../prompts'
import type {
  AIProvider,
  AIProviderConfig,
  AIProviderId,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '../types'
import {
  GEMINI_DEFAULT_MODEL,
  getGeminiClient,
  isGeminiError,
  toGeminiContents,
  toUserFacingMessage,
} from '@/lib/gemini'

export class GeminiProvider implements AIProvider {
  readonly id: AIProviderId = 'gemini'
  readonly name = 'Google Gemini'
  readonly defaultModel: string

  constructor(config: AIProviderConfig = {}) {
    this.defaultModel = config.model ?? GEMINI_DEFAULT_MODEL
  }

  isConfigured(): boolean {
    return getGeminiClient({ model: this.defaultModel }).isConfigured()
  }

  async complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const client = getGeminiClient({ model: this.defaultModel })

    const systemPrompt = buildSystemPrompt(
      request.systemPrompt ?? DEFAULT_MENTOR_SYSTEM_PROMPT,
      request.context,
    )

    try {
      const response = await client.generateContent({
        systemInstruction: systemPrompt,
        contents: toGeminiContents(request.messages),
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2048,
          thinkingBudget: 0,
        },
      })

      return {
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.text,
        },
        provider: this.id,
        model: response.model,
        usage: response.usage
          ? {
              promptTokens: response.usage.promptTokenCount,
              completionTokens: response.usage.candidatesTokenCount,
              totalTokens: response.usage.totalTokenCount,
            }
          : undefined,
      }
    } catch (error) {
      if (isGeminiError(error)) {
        throw new AIProviderError(toUserFacingMessage(error), {
          code: error.code,
          status: error.status,
          provider: this.id,
        })
      }
      throw error
    }
  }
}

export { GEMINI_DEFAULT_MODEL } from '@/lib/gemini'
