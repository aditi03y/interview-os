export type GeminiErrorCode =
  | 'missing_api_key'
  | 'invalid_request'
  | 'authentication_error'
  | 'permission_denied'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'server_error'
  | 'timeout'
  | 'network_error'
  | 'empty_response'
  | 'blocked_response'
  | 'unknown'

export interface GeminiErrorOptions {
  code: GeminiErrorCode
  status?: number
  retryAfterMs?: number
  retryable?: boolean
  cause?: unknown
  details?: string
}

export class GeminiError extends Error {
  readonly code: GeminiErrorCode
  readonly status?: number
  readonly retryAfterMs?: number
  readonly retryable: boolean
  readonly details?: string

  constructor(message: string, options: GeminiErrorOptions) {
    super(message, options.cause ? { cause: options.cause } : undefined)
    this.name = 'GeminiError'
    this.code = options.code
    this.status = options.status
    this.retryAfterMs = options.retryAfterMs
    this.retryable = options.retryable ?? isRetryableCode(options.code, options.status)
    this.details = options.details
  }
}

function isRetryableCode(code: GeminiErrorCode, status?: number): boolean {
  if (code === 'rate_limited' || code === 'quota_exceeded' || code === 'server_error') {
    return true
  }
  if (code === 'network_error' || code === 'timeout') return true
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

interface GoogleApiErrorBody {
  error?: {
    code?: number
    message?: string
    status?: string
    details?: unknown[]
  }
}

export function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined
  const seconds = Number(header)
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1000)
  }
  const date = Date.parse(header)
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now())
  }
  return undefined
}

export function mapHttpErrorToGeminiError(
  status: number,
  body: GoogleApiErrorBody | null,
  retryAfterMs?: number,
): GeminiError {
  const message = body?.error?.message ?? `Gemini API request failed (${status})`
  const googleStatus = body?.error?.status ?? ''

  if (status === 400) {
    return new GeminiError(message, {
      code: 'invalid_request',
      status,
      retryable: false,
      details: googleStatus,
    })
  }

  if (status === 401 || status === 403) {
    const isPermission = googleStatus === 'PERMISSION_DENIED'
    return new GeminiError(message, {
      code: isPermission ? 'permission_denied' : 'authentication_error',
      status,
      retryable: false,
      details: googleStatus,
    })
  }

  if (status === 429) {
    const isQuota =
      googleStatus === 'RESOURCE_EXHAUSTED' ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('exhausted')

    return new GeminiError(
      isQuota
        ? 'Gemini API quota exceeded. Check usage in Google AI Studio or wait for reset.'
        : 'Gemini API rate limit reached. Retrying shortly.',
      {
        code: isQuota ? 'quota_exceeded' : 'rate_limited',
        status,
        retryAfterMs,
        retryable: true,
        details: googleStatus,
      },
    )
  }

  if (status >= 500) {
    return new GeminiError('Gemini API is temporarily unavailable.', {
      code: 'server_error',
      status,
      retryable: true,
      details: googleStatus || message,
    })
  }

  return new GeminiError(message, {
    code: 'unknown',
    status,
    retryable: false,
    details: googleStatus,
  })
}

export function isGeminiError(error: unknown): error is GeminiError {
  return error instanceof GeminiError
}

export function toUserFacingMessage(error: GeminiError): string {
  switch (error.code) {
    case 'missing_api_key':
      return 'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.'
    case 'rate_limited':
      return 'Too many requests to Gemini. Please wait a moment and try again.'
    case 'quota_exceeded':
      return 'Daily Gemini quota exceeded. Limits reset at midnight Pacific Time.'
    case 'timeout':
      return 'Gemini request timed out. Try a shorter prompt or try again.'
    case 'network_error':
      return 'Network error while contacting Gemini. Check your connection.'
    case 'empty_response':
      return 'Gemini returned an empty response. Try rephrasing your prompt.'
    case 'blocked_response':
      return 'Response was blocked by Gemini safety filters.'
    default:
      return error.message
  }
}
