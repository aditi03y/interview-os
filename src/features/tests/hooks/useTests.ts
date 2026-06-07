import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { toast } from '@/lib/toast'
import {
  buildScheduledSlots,
  getPlanDay,
  scheduleKey,
} from '../lib/scheduler'
import {
  fetchScoreSummary,
  fetchTestDefinitions,
  fetchUserAttempts,
  startAttempt,
} from '../services/testService'
import type { ScheduledTestSlot, ScoreSummary, TestAttempt, TestDefinition } from '../types'

export function useTests() {
  const { user } = useAuth()

  const [definitions, setDefinitions] = useState<TestDefinition[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [summary, setSummary] = useState<ScoreSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)

  const anchorDate = useMemo(() => {
    if (user?.createdAt) return new Date(user.createdAt)
    return new Date()
  }, [user])

  const planDay = useMemo(() => getPlanDay(anchorDate), [anchorDate])

  const completedScheduleKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const attempt of attempts) {
      if (
        attempt.scheduleDay &&
        attempt.definition?.scheduleType &&
        attempt.definition.scheduleType !== 'manual' &&
        (attempt.status === 'completed' || attempt.status === 'auto_submitted')
      ) {
        keys.add(scheduleKey(attempt.definition.scheduleType, attempt.scheduleDay))
      }
    }
    return keys
  }, [attempts])

  const scheduledSlots = useMemo(
    () => buildScheduledSlots(definitions, planDay, completedScheduleKeys),
    [definitions, planDay, completedScheduleKeys],
  )

  const manualTests = useMemo(
    () => definitions.filter((d) => d.scheduleType === 'manual'),
    [definitions],
  )

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      const [defsResult, attemptsResult, summaryResult] = await Promise.all([
        fetchTestDefinitions(),
        fetchUserAttempts(user.id),
        fetchScoreSummary(user.id),
      ])

      if (cancelled) return

      if (defsResult.error) setError(defsResult.error.message)
      else setDefinitions(defsResult.data ?? [])

      if (attemptsResult.error) setError(attemptsResult.error.message)
      else setAttempts(attemptsResult.data ?? [])

      if (summaryResult.data) setSummary(summaryResult.data)
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when user id changes
  }, [user?.id])

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [defsResult, attemptsResult, summaryResult] = await Promise.all([
      fetchTestDefinitions(),
      fetchUserAttempts(user.id),
      fetchScoreSummary(user.id),
    ])

    if (defsResult.error) setError(defsResult.error.message)
    else setDefinitions(defsResult.data ?? [])

    if (attemptsResult.error) setError(attemptsResult.error.message)
    else setAttempts(attemptsResult.data ?? [])

    if (summaryResult.data) setSummary(summaryResult.data)
    setLoading(false)
  }, [user])

  const handleStart = useCallback(
    async (
      definition: TestDefinition,
      options?: { coveredStudyDays?: number[]; scheduleDay?: number },
    ): Promise<TestAttempt | null> => {
      if (!user) return null
      setStartingId(definition.id)
      setError(null)

      const result = await startAttempt({
        userId: user.id,
        definition,
        coveredStudyDays: options?.coveredStudyDays,
        scheduleDay: options?.scheduleDay,
      })

      setStartingId(null)
      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message, 'Could not start test')
        return null
      }
      if (result.data) {
        toast.success(`Started ${definition.title}. Good luck!`, 'Test started')
        setAttempts((prev) => [result.data!, ...prev])
      }
      return result.data
    },
    [user],
  )

  const inProgressAttempt = useMemo(
    () => attempts.find((a) => a.status === 'in_progress'),
    [attempts],
  )

  return {
    definitions,
    attempts,
    summary,
    loading,
    error,
    planDay,
    scheduledSlots,
    manualTests,
    startingId,
    inProgressAttempt,
    reload,
    startTest: handleStart,
  }
}

export type UseTestsReturn = ReturnType<typeof useTests>

export type { ScheduledTestSlot, TestDefinition, TestAttempt, ScoreSummary }
