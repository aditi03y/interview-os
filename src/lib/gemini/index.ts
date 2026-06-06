export {
  GEMINI_DEFAULT_MODEL,
  GEMINI_API_BASE,
  loadGeminiConfig,
  isGeminiConfigured,
  getGenerateContentUrl,
} from './config'

export type { GeminiConfig } from './config'

export {
  GeminiError,
  isGeminiError,
  toUserFacingMessage,
  mapHttpErrorToGeminiError,
  parseRetryAfterMs,
} from './errors'

export type { GeminiErrorCode } from './errors'

export { GeminiRateLimiter } from './rateLimiter'
export { withGeminiRetry } from './retry'
export type { RetryOptions } from './retry'

export {
  GeminiClient,
  getGeminiClient,
  resetGeminiClient,
  toGeminiContents,
} from './client'

export type {
  GeminiContent,
  GeminiContentPart,
  GeminiGenerationConfig,
  GeminiGenerateContentRequest,
  GeminiGenerateContentResponse,
  GeminiUsageMetadata,
} from './types'
