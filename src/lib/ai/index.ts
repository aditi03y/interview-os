export type {
  AIProvider,
  AIProviderConfig,
  AIProviderId,
  ChatMessage,
  ChatRole,
  ChatCompletionRequest,
  ChatCompletionResponse,
  MentorContext,
} from './types'

export { AIProviderError, mapAIError, isAIProviderError } from './errors'
export {
  DEFAULT_MENTOR_SYSTEM_PROMPT,
  buildSystemPrompt,
  generateConversationTitle,
} from './prompts'
export {
  createAIProvider,
  getAIProvider,
  getActiveProviderId,
  listProviders,
  completeChat,
} from './factory'
export { GeminiProvider, OpenAIProvider, ClaudeProvider, OpenRouterProvider } from './providers'
export {
  GeminiClient,
  getGeminiClient,
  GEMINI_DEFAULT_MODEL,
  isGeminiConfigured,
  toUserFacingMessage,
  isGeminiError,
} from '@/lib/gemini'
export type { GeminiGenerateContentRequest, GeminiGenerateContentResponse } from '@/lib/gemini'
