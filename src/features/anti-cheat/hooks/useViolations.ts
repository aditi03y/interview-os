import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import {
  fetchAttemptViolationSummaries,
  fetchViolations,
  fetchViolationSummary,
} from '../services/violationService'
import type {
  AttemptViolationSummary,
  TestViolation,
  ViolationEventType,
  ViolationSummary,
} from '../types'

export function useViolations(options?: {
  attemptId?: string
  eventType?: ViolationEventType | 'all'
  limit?: number
}) {
  const { user } = useAuth()
  const [violations, setViolations] = useState<TestViolation[]>([])
  const [summary, setSummary] = useState<ViolationSummary | null>(null)
  const [attemptSummaries, setAttemptSummaries] = useState<AttemptViolationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventTypeFilter = options?.eventType === 'all' ? undefined : options?.eventType

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      const [violationsResult, summaryResult, attemptsResult] = await Promise.all([
        fetchViolations(user.id, {
          attemptId: options?.attemptId,
          eventType: eventTypeFilter,
          limit: options?.limit,
        }),
        fetchViolationSummary(user.id),
        options?.attemptId ? Promise.resolve({ data: [], error: null }) : fetchAttemptViolationSummaries(user.id),
      ])

      if (cancelled) return

      if (violationsResult.error) setError(violationsResult.error.message)
      else setViolations(violationsResult.data ?? [])

      if (summaryResult.data) setSummary(summaryResult.data)
      if (attemptsResult.data) setAttemptSummaries(attemptsResult.data)

      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when user or filters change
  }, [user?.id, options?.attemptId, eventTypeFilter, options?.limit])

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [violationsResult, summaryResult, attemptsResult] = await Promise.all([
      fetchViolations(user.id, {
        attemptId: options?.attemptId,
        eventType: eventTypeFilter,
        limit: options?.limit,
      }),
      fetchViolationSummary(user.id),
      options?.attemptId ? Promise.resolve({ data: [], error: null }) : fetchAttemptViolationSummaries(user.id),
    ])

    if (violationsResult.data) setViolations(violationsResult.data)
    if (summaryResult.data) setSummary(summaryResult.data)
    if (attemptsResult.data) setAttemptSummaries(attemptsResult.data)
    setLoading(false)
  }, [eventTypeFilter, options?.attemptId, options?.limit, user])

  return {
    violations,
    summary,
    attemptSummaries,
    loading,
    error,
    reload,
  }
}
