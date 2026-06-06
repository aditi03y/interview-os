/** @deprecated Import from `@/lib/gemini` instead */
export {
  GEMINI_DEFAULT_MODEL,
  toGeminiContents,
} from '@/lib/gemini'

/** @deprecated Use GeminiClient.generateContent via `@/lib/gemini` */
export function parseGeminiResponse(data: {
  candidates?: Array<{ content?: { parts?: Array<{ text: string }> } }>
  error?: { message: string }
}): string {
  if (data.error) throw new Error(data.error.message)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No response generated. The model returned an empty result.')
  return text
}

/** @deprecated Use getGenerateContentUrl from `@/lib/gemini` */
export function getGeminiApiUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
}

export type { GeminiApiResponse as GeminiResponse } from '@/lib/gemini/types'
