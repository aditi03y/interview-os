import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { SDE_ROADMAP_15_DAYS } from '../data/roadmap'
import {
  calculateDayProgressPercent,
  calculateStudyPlanStats,
  deriveStatus,
  EMPTY_COMPLETED_ITEMS,
  toggleItemCompletion,
} from '../lib/progress'
import {
  fetchStudyDayProgress,
  upsertStudyDayProgress,
} from '../services/studyPlanService'
import type { DayProgress, DayWithProgress, StudyPlanStats, StudySection } from '../types'

export function useStudyPlan() {
  const { user } = useAuth()
  const [progressMap, setProgressMap] = useState<Map<number, DayProgress>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [savingDay, setSavingDay] = useState<number | null>(null)

  const loadProgress = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    const result = await fetchStudyDayProgress(user.id)

    if (result.error) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    const map = new Map<number, DayProgress>()
    for (const row of result.data) {
      map.set(row.dayNumber, row)
    }
    setProgressMap(map)
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError(null)

      const result = await fetchStudyDayProgress(user.id)
      if (cancelled) return

      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        return
      }

      const map = new Map<number, DayProgress>()
      for (const row of result.data) {
        map.set(row.dayNumber, row)
      }
      setProgressMap(map)
      setIsLoading(false)
    }

    void run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when user id changes
  }, [user?.id])

  const days: DayWithProgress[] = useMemo(
    () =>
      SDE_ROADMAP_15_DAYS.map((day) => ({
        ...day,
        progress: progressMap.get(day.day) ?? null,
      })),
    [progressMap],
  )

  const stats: StudyPlanStats = useMemo(
    () => calculateStudyPlanStats(SDE_ROADMAP_15_DAYS, progressMap),
    [progressMap],
  )

  const toggleItem = useCallback(
    async (dayNumber: number, section: StudySection, itemId: string) => {
      if (!user) return

      const day = SDE_ROADMAP_15_DAYS.find((d) => d.day === dayNumber)
      if (!day) return

      setSavingDay(dayNumber)

      const existing = progressMap.get(dayNumber)
      const currentCompleted = existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
      const nextCompleted = toggleItemCompletion(currentCompleted, section, itemId)
      const progressPercent = calculateDayProgressPercent(day, nextCompleted)
      const status = deriveStatus(progressPercent)

      const result = await upsertStudyDayProgress(user.id, dayNumber, {
        completedItems: nextCompleted,
        progressPercent,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : null,
        notes: existing?.notes ?? '',
        timeSpentMinutes: existing?.timeSpentMinutes ?? 0,
      })

      setSavingDay(null)

      if (result.error) {
        setError(result.error.message)
        return
      }

      setProgressMap((prev) => {
        const next = new Map(prev)
        next.set(dayNumber, result.data)
        return next
      })
    },
    [user, progressMap],
  )

  const saveNotes = useCallback(
    async (dayNumber: number, notes: string) => {
      if (!user) return

      setSavingDay(dayNumber)

      const existing = progressMap.get(dayNumber)
      const day = SDE_ROADMAP_15_DAYS.find((d) => d.day === dayNumber)!
      const completed = existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }

      const result = await upsertStudyDayProgress(user.id, dayNumber, {
        notes,
        completedItems: completed,
        progressPercent: existing?.progressPercent ?? calculateDayProgressPercent(day, completed),
        status: existing?.status ?? deriveStatus(calculateDayProgressPercent(day, completed)),
        timeSpentMinutes: existing?.timeSpentMinutes ?? 0,
        completedAt: existing?.completedAt ?? null,
      })

      setSavingDay(null)

      if (result.error) {
        setError(result.error.message)
        return
      }

      setProgressMap((prev) => {
        const next = new Map(prev)
        next.set(dayNumber, result.data)
        return next
      })
    },
    [user, progressMap],
  )

  const addStudyTime = useCallback(
    async (dayNumber: number, minutesToAdd: number) => {
      if (!user || minutesToAdd <= 0) return

      setSavingDay(dayNumber)

      const existing = progressMap.get(dayNumber)
      const day = SDE_ROADMAP_15_DAYS.find((d) => d.day === dayNumber)!
      const completed = existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
      const nextMinutes = (existing?.timeSpentMinutes ?? 0) + minutesToAdd

      const result = await upsertStudyDayProgress(user.id, dayNumber, {
        timeSpentMinutes: nextMinutes,
        notes: existing?.notes ?? '',
        completedItems: completed,
        progressPercent: existing?.progressPercent ?? calculateDayProgressPercent(day, completed),
        status: existing?.status ?? deriveStatus(calculateDayProgressPercent(day, completed)),
        completedAt: existing?.completedAt ?? null,
      })

      setSavingDay(null)

      if (result.error) {
        setError(result.error.message)
        return
      }

      setProgressMap((prev) => {
        const next = new Map(prev)
        next.set(dayNumber, result.data)
        return next
      })
    },
    [user, progressMap],
  )

  return {
    days,
    stats,
    isLoading,
    error,
    expandedDay,
    setExpandedDay,
    toggleItem,
    saveNotes,
    addStudyTime,
    savingDay,
    reload: loadProgress,
  }
}
