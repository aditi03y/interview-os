import type { ChatMessage } from '@/lib/ai/types'
import {
  GEMINI_DEFAULT_MODEL,
  getGenerateContentUrl,
  isGeminiConfigured,
  loadGeminiConfig,
  type GeminiConfig,
} from './config'
import {
  GeminiError,
  mapHttpErrorToGeminiError,
  parseRetryAfterMs,
  toUserFacingMessage,
} from './errors'
import { GeminiRateLimiter } from './rateLimiter'
import { withGeminiRetry } from './retry'
import type {
  GeminiApiResponse,
  GeminiContent,
  GeminiGenerateContentRequest,
  GeminiGenerateContentResponse,
} from './types'

export class GeminiClient {
  private readonly config: GeminiConfig
  private readonly rateLimiter: GeminiRateLimiter

  constructor(configOverrides?: Partial<GeminiConfig>) {
    this.config = loadGeminiConfig(configOverrides)
    this.rateLimiter = new GeminiRateLimiter(this.config.clientRpm)
  }

  get model(): string {
    return this.config.model
  }

  isConfigured(): boolean {
    return isGeminiConfigured(this.config.apiKey)
  }

  /**
   * Primary API entry point — generateContent with retry, rate limiting, and timeout.
   */
  async generateContent(
    request: GeminiGenerateContentRequest,
  ): Promise<GeminiGenerateContentResponse> {
    if (!this.isConfigured()) {
      throw new GeminiError(
        'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.',
        { code: 'missing_api_key', retryable: false },
      )
    }

    const model = request.model ?? this.config.model

    return withGeminiRetry(
      async () => {
        await this.rateLimiter.acquire()
        return this.executeGenerateContent(model, request)
      },
      {
        maxRetries: this.config.maxRetries,
        baseDelayMs: this.config.baseDelayMs,
        maxDelayMs: this.config.maxDelayMs,
      },
    )
  }

  private async executeGenerateContent(
    model: string,
    request: GeminiGenerateContentRequest,
  ): Promise<GeminiGenerateContentResponse> {
    const url = getGenerateContentUrl(model, this.config.apiKey)
    const timeoutMs = request.timeoutMs ?? this.config.requestTimeoutMs
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

    const body: Record<string, unknown> = {
      contents: request.contents,
    }

    if (request.systemInstruction) {
      body.systemInstruction = { parts: [{ text: request.systemInstruction }] }
    }

    if (request.generationConfig) {
      const { thinkingBudget, ...rest } = request.generationConfig
      const generationConfig: Record<string, unknown> = { ...rest }

      if (thinkingBudget != null) {
        generationConfig.thinkingConfig = { thinkingBudget }
      }

      body.generationConfig = generationConfig
    }

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GeminiError('Gemini request timed out.', {
          code: 'timeout',
          retryable: true,
          cause: error,
        })
      }
      throw new GeminiError('Network error while contacting Gemini API.', {
        code: 'network_error',
        retryable: true,
        cause: error,
      })
    } finally {
      window.clearTimeout(timeoutId)
    }

    let data: GeminiApiResponse
    try {
      data = (await response.json()) as GeminiApiResponse
    } catch {
      throw mapHttpErrorToGeminiError(response.status, null)
    }

    if (!response.ok) {
      const retryAfterMs = parseRetryAfterMs(response.headers.get('Retry-After'))
      throw mapHttpErrorToGeminiError(response.status, data, retryAfterMs)
    }

    if (data?.error) {
      throw mapHttpErrorToGeminiError(data.error.code ?? 500, data)
    }

    const text = extractResponseText(data)
    const finishReason = data?.candidates?.[0]?.finishReason

    if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
      throw new GeminiError('Response blocked by Gemini safety filters.', {
        code: 'blocked_response',
        retryable: false,
        details: finishReason,
      })
    }

    if (!text) {
      throw new GeminiError('Gemini returned an empty response.', {
        code: 'empty_response',
        retryable: false,
        details: finishReason,
      })
    }

    return {
      text,
      model,
      finishReason,
      usage: data?.usageMetadata,
    }
  }
}

function extractResponseText(data: GeminiApiResponse | null): string {
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  return parts
    .map((p) => p.text ?? '')
    .join('')
    .trim()
}

let defaultClient: GeminiClient | null = null

export function getGeminiClient(config?: Partial<GeminiConfig>): GeminiClient {
  if (!config) {
    if (!defaultClient) {
      defaultClient = new GeminiClient()
    }
    return defaultClient
  }
  return new GeminiClient(config)
}

export function resetGeminiClient(): void {
  defaultClient = null
}

/** Convert app chat messages to Gemini contents format */
export function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
}

export { GEMINI_DEFAULT_MODEL, toUserFacingMessage, GeminiError, isGeminiConfigured }
