import { GeminiError, isGeminiError } from './errors'

export interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  onRetry?: (attempt: number, error: GeminiError, delayMs: number) => void
}

export async function withGeminiRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: GeminiError | undefined

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    try {
      return await operation(attempt)
    } catch (error) {
      const geminiError = normalizeToGeminiError(error)
      lastError = geminiError

      const isLastAttempt = attempt >= options.maxRetries
      if (isLastAttempt || !geminiError.retryable) {
        throw geminiError
      }

      const delayMs = computeDelayMs(attempt, options, geminiError.retryAfterMs)
      options.onRetry?.(attempt + 1, geminiError, delayMs)
      await sleep(delayMs)
    }
  }

  throw lastError ?? new GeminiError('Retry failed without error.', { code: 'unknown' })
}

function computeDelayMs(
  attempt: number,
  options: RetryOptions,
  retryAfterMs?: number,
): number {
  if (retryAfterMs != null && retryAfterMs > 0) {
    return Math.min(retryAfterMs, options.maxDelayMs)
  }

  const exponential = options.baseDelayMs * 2 ** attempt
  const jitter = Math.floor(Math.random() * options.baseDelayMs)
  return Math.min(exponential + jitter, options.maxDelayMs)
}

function normalizeToGeminiError(error: unknown): GeminiError {
  if (isGeminiError(error)) return error

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new GeminiError('Gemini request timed out.', {
      code: 'timeout',
      retryable: true,
      cause: error,
    })
  }

  if (error instanceof TypeError) {
    return new GeminiError('Network error while contacting Gemini API.', {
      code: 'network_error',
      retryable: true,
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new GeminiError(error.message, { code: 'unknown', retryable: false, cause: error })
  }

  return new GeminiError('Unknown Gemini error.', { code: 'unknown', retryable: false })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
