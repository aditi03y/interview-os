import { useCallback, useState } from 'react'
import { useAuthStore } from '@/stores'
import type { ApiResult } from '@/types'

export function useSignIn() {
  const signIn = useAuthStore((s) => s.signIn)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const execute = useCallback(
    async (email: string, password: string): Promise<ApiResult<void>> => {
      setFieldError(null)

      if (!email.trim()) {
        const error = { message: 'Email is required.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      if (!password) {
        const error = { message: 'Password is required.' }
        setFieldError(error.message)
        return { data: null, error }
      }

      return signIn(email.trim(), password)
    },
    [signIn],
  )

  return { signIn: execute, isLoading, fieldError, clearFieldError: () => setFieldError(null) }
}
