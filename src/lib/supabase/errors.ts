import { AuthError } from '@supabase/supabase-js'
import type { ApiError } from '@/types'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password.',
  email_not_confirmed: 'Please confirm your email before signing in.',
  user_already_exists: 'An account with this email already exists.',
  weak_password: 'Password must be at least 6 characters.',
  over_request_rate_limit: 'Too many attempts. Please try again later.',
}

export function mapSupabaseError(error: AuthError | Error | null): ApiError {
  if (!error) {
    return { message: 'An unknown error occurred.' }
  }

  if (error instanceof AuthError) {
    const friendly = AUTH_ERROR_MESSAGES[error.code ?? '']
    return {
      message: friendly ?? error.message,
      code: error.code,
      status: error.status,
    }
  }

  return { message: error.message }
}

export function mapPostgrestError(error: { message: string; code?: string; details?: string }): ApiError {
  return {
    message: error.message,
    code: error.code,
  }
}
