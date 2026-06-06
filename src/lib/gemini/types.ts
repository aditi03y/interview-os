export interface GeminiContentPart {
  text: string
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiContentPart[]
}

export interface GeminiGenerationConfig {
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  topK?: number
  /** 0 disables thinking; -1 uses dynamic thinking (model default) */
  thinkingBudget?: number
}

export interface GeminiGenerateContentRequest {
  model?: string
  systemInstruction?: string
  contents: GeminiContent[]
  generationConfig?: GeminiGenerationConfig
  /** Override timeout for this request (ms) */
  timeoutMs?: number
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount?: number
  thoughtsTokenCount?: number
}

export interface GeminiGenerateContentResponse {
  text: string
  model: string
  finishReason?: string
  usage?: GeminiUsageMetadata
}

export interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiContentPart[]
    }
    finishReason?: string
  }>
  usageMetadata?: GeminiUsageMetadata
  error?: {
    code?: number
    message?: string
    status?: string
  }
}
