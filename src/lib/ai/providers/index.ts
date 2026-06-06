import { AIProviderError } from '../errors'
import type { AIProvider, AIProviderConfig, ChatCompletionRequest, ChatCompletionResponse } from '../types'
import { GeminiProvider } from './gemini.provider'

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai' as const
  readonly name = 'OpenAI'
  readonly defaultModel: string

  constructor(config: AIProviderConfig = {}) {
    this.defaultModel = config.model ?? 'gpt-4o-mini'
    void config
  }

  isConfigured(): boolean {
    return Boolean(import.meta.env.VITE_OPENAI_API_KEY)
  }

  async complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    void request
    throw new AIProviderError('OpenAI provider is not yet implemented.', {
      code: 'not_implemented',
      provider: this.id,
    })
  }
}

export class ClaudeProvider implements AIProvider {
  readonly id = 'claude' as const
  readonly name = 'Anthropic Claude'
  readonly defaultModel: string

  constructor(config: AIProviderConfig = {}) {
    this.defaultModel = config.model ?? 'claude-3-5-sonnet-latest'
    void config
  }

  isConfigured(): boolean {
    return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)
  }

  async complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    void request
    throw new AIProviderError('Claude provider is not yet implemented.', {
      code: 'not_implemented',
      provider: this.id,
    })
  }
}

export class OpenRouterProvider implements AIProvider {
  readonly id = 'openrouter' as const
  readonly name = 'OpenRouter'
  readonly defaultModel: string

  constructor(config: AIProviderConfig = {}) {
    this.defaultModel = config.model ?? 'google/gemini-2.0-flash-exp:free'
    void config
  }

  isConfigured(): boolean {
    return Boolean(import.meta.env.VITE_OPENROUTER_API_KEY)
  }

  async complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    void request
    throw new AIProviderError('OpenRouter provider is not yet implemented.', {
      code: 'not_implemented',
      provider: this.id,
    })
  }
}

export { GeminiProvider }
