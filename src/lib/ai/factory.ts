import type { AIProvider, AIProviderConfig, AIProviderId } from './types'
import {
  ClaudeProvider,
  GeminiProvider,
  OpenAIProvider,
  OpenRouterProvider,
} from './providers'

const providerConstructors: Record<
  AIProviderId,
  new (config?: AIProviderConfig) => AIProvider
> = {
  gemini: GeminiProvider,
  openai: OpenAIProvider,
  claude: ClaudeProvider,
  openrouter: OpenRouterProvider,
}

let cachedProvider: AIProvider | null = null
let cachedProviderId: AIProviderId | null = null

export function getActiveProviderId(): AIProviderId {
  const envProvider = import.meta.env.VITE_AI_PROVIDER as AIProviderId | undefined
  if (envProvider && envProvider in providerConstructors) {
    return envProvider
  }
  return 'gemini'
}

export function createAIProvider(
  id: AIProviderId = getActiveProviderId(),
  config?: AIProviderConfig,
): AIProvider {
  const Constructor = providerConstructors[id]
  if (!Constructor) {
    throw new Error(`Unknown AI provider: ${id}`)
  }
  return new Constructor(config)
}

export function getAIProvider(config?: AIProviderConfig): AIProvider {
  const id = getActiveProviderId()
  if (cachedProvider && cachedProviderId === id && !config) {
    return cachedProvider
  }
  const provider = createAIProvider(id, config)
  cachedProvider = provider
  cachedProviderId = id
  return provider
}

export function listProviders(): Array<{
  id: AIProviderId
  name: string
  configured: boolean
  isActive: boolean
}> {
  const activeId = getActiveProviderId()
  return (Object.keys(providerConstructors) as AIProviderId[]).map((id) => {
    const provider = createAIProvider(id)
    return {
      id,
      name: provider.name,
      configured: provider.isConfigured(),
      isActive: id === activeId,
    }
  })
}

export async function completeChat(
  request: Parameters<AIProvider['complete']>[0],
  providerId?: AIProviderId,
) {
  const provider = createAIProvider(providerId ?? getActiveProviderId())
  return provider.complete(request)
}
