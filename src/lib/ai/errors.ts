import type { ApiError } from '@/types'

import { isGeminiError, toUserFacingMessage } from '@/lib/gemini'

export class AIProviderError extends Error {
  readonly code: string
  readonly status?: number
  readonly provider: string

  constructor(message: string, options: { code: string; status?: number; provider: string }) {
    super(message)
    this.name = 'AIProviderError'
    this.code = options.code
    this.status = options.status
    this.provider = options.provider
  }
}

export function mapAIError(error: unknown): ApiError {
  if (error instanceof AIProviderError) {
    return { message: error.message, code: error.code, status: error.status }
  }

  if (isGeminiError(error)) {
    return { message: toUserFacingMessage(error), code: error.code, status: error.status }
  }

  if (error instanceof Error) {
    return { message: error.message, code: 'ai_error' }
  }

  return { message: 'An unexpected AI error occurred.', code: 'unknown' }
}

export function isAIProviderError(error: unknown): error is AIProviderError {
  return error instanceof AIProviderError
}
