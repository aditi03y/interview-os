/** Stable Gemini 2.5 Flash model ID for generateContent */
export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash'

export const GEMINI_API_VERSION = 'v1beta'
export const GEMINI_API_BASE = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}`

export interface GeminiConfig {
  apiKey: string
  model: string
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  requestTimeoutMs: number
  /** Client-side requests-per-minute guard (helps stay under free-tier RPM) */
  clientRpm: number
}

const PLACEHOLDER_KEYS = new Set(['', 'your-gemini-api-key', 'your-api-key'])

export function loadGeminiConfig(overrides?: Partial<GeminiConfig>): GeminiConfig {
  return {
    apiKey: overrides?.apiKey ?? import.meta.env.VITE_GEMINI_API_KEY ?? '',
    model: overrides?.model ?? import.meta.env.VITE_GEMINI_MODEL ?? GEMINI_DEFAULT_MODEL,
    maxRetries: overrides?.maxRetries ?? Number(import.meta.env.VITE_GEMINI_MAX_RETRIES ?? 3),
    baseDelayMs: overrides?.baseDelayMs ?? 500,
    maxDelayMs: overrides?.maxDelayMs ?? 8_000,
    requestTimeoutMs: overrides?.requestTimeoutMs ?? 60_000,
    clientRpm: overrides?.clientRpm ?? Number(import.meta.env.VITE_GEMINI_CLIENT_RPM ?? 10),
  }
}

export function isGeminiConfigured(apiKey?: string): boolean {
  const key = apiKey ?? import.meta.env.VITE_GEMINI_API_KEY ?? ''
  return Boolean(key && !PLACEHOLDER_KEYS.has(key.trim()))
}

export function getGenerateContentUrl(model: string, apiKey: string): string {
  return `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
}
