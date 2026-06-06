import { useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/auth'
import { useAsyncData } from '@/hooks/useAsyncData'
import { computeAnalytics } from '../lib/computeAnalytics'
import { fetchAnalyticsData } from '../services/analyticsService'

export function useAnalytics() {
  const { user } = useAuth()

  const fetcher = useCallback(async () => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } }
    const result = await fetchAnalyticsData(user.id)
    if (result.error) return result
    if (!result.data) return { data: null, error: { message: 'No analytics data' } }
    return { data: computeAnalytics(result.data), error: null }
  }, [user])

  const { data, isLoading, error, reload } = useAsyncData(fetcher, [user?.id], {
    enabled: Boolean(user),
  })

  const hasData = useMemo(() => {
    if (!data) return false
    return (
      data.totalStudyMinutes > 0 ||
      data.dsaSolvedCount > 0 ||
      data.testsCompleted > 0
    )
  }, [data])

  return { snapshot: data, loading: isLoading, error, hasData, reload }
}
