import { useCallback } from 'react'
import { useAuth } from '@/hooks/auth'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchReadinessSnapshot } from '../services/readinessService'

export function useReadiness() {
  const { user } = useAuth()

  const fetcher = useCallback(async () => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } }
    return fetchReadinessSnapshot(user.id)
  }, [user])

  const { data, isLoading, error, reload } = useAsyncData(fetcher, [user?.id], {
    enabled: Boolean(user),
  })

  return { snapshot: data, loading: isLoading, error, reload }
}
