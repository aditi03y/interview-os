import { useCallback } from 'react'
import { useAuthStore } from '@/stores'
import type { ApiResult } from '@/types'

export function useSignOut() {
  const signOut = useAuthStore((s) => s.signOut)
  const isLoading = useAuthStore((s) => s.isLoading)

  const execute = useCallback(async (): Promise<ApiResult<void>> => {
    return signOut()
  }, [signOut])

  return { signOut: execute, isLoading }
}
