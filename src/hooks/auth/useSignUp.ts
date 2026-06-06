import { useCallback, useState } from 'react'
import { useAuthStore } from '@/stores'
import type { ApiResult } from '@/types'

interface SignUpFormInput {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export function useSignUp() {
  const signUp = useAuthStore((s) => s.signUp)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const execute = useCallback(
    async (
      input: SignUpFormInput,
    ): Promise<ApiResult<{ needsEmailConfirmation: boolean }>> => {
      setFieldError(null)

      if (!input.fullName.trim()) {
        const error = { message: 'Full name is required.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      if (!input.email.trim()) {
        const error = { message: 'Email is required.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      if (input.password.length < 6) {
        const error = { message: 'Password must be at least 6 characters.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      if (input.password !== input.confirmPassword) {
        const error = { message: 'Passwords do not match.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      return signUp({
        email: input.email.trim(),
        password: input.password,
        fullName: input.fullName.trim(),
      })
    },
    [signUp],
  )

  return { signUp: execute, isLoading, fieldError, clearFieldError: () => setFieldError(null) }
}
