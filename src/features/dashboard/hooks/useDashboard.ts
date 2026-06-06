import { useCallback } from 'react'
import { useAuth } from '@/hooks/auth'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchDashboardSnapshot } from '../services/dashboardService'

export function useDashboard() {
  const { user } = useAuth()

  const fetcher = useCallback(async () => {
    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } }
    }
    return fetchDashboardSnapshot(user.id)
  }, [user])

  const { data, isLoading, error, reload } = useAsyncData(fetcher, [user?.id], {
    enabled: Boolean(user),
  })

  return {
    snapshot: data,
    isLoading,
    error,
    reload,
  }
}
