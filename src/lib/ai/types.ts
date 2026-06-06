export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'openrouter'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt?: string
}

export interface MentorContext {
  topic?: string
  topicLabel?: string
  userName?: string
  college?: string
  targetRole?: string
  studyProgressSummary?: string
  dsaProgressSummary?: string
  customContext?: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  systemPrompt?: string
  context?: MentorContext
  temperature?: number
  maxTokens?: number
}

export interface ChatCompletionResponse {
  message: ChatMessage
  provider: AIProviderId
  model: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export interface StreamChatCompletionRequest extends ChatCompletionRequest {
  onToken?: (token: string) => void
}

export interface AIProvider {
  readonly id: AIProviderId
  readonly name: string
  readonly defaultModel: string
  isConfigured(): boolean
  complete(request: ChatCompletionRequest): Promise<ChatCompletionResponse>
}

export interface AIProviderConfig {
  apiKey?: string
  model?: string
  baseUrl?: string
}
