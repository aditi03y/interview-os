import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { syncDsaItemWithTracker } from '@/features/curriculum/lib/syncDsaProgress'
import { toast } from '@/lib/toast'
import { useStudyPlanContent } from './useStudyPlanContent'
import type { RoadmapDay } from '../types'
import {
  calculateDayProgressPercent,
  calculateStudyPlanStats,
  deriveStatus,
  EMPTY_COMPLETED_ITEMS,
  toggleItemCompletion,
} from '../lib/progress'
import {
  cacheToProgressMap,
  clearPendingSyncForDay,
  loadProgressCache,
  queuePendingSync,
  saveProgressCache,
  type PendingSyncEntry,
} from '../lib/progressPersistence'
import { createOptimisticProgress, mergeDayProgress, mergeProgressMaps } from '../lib/progressMerge'
import { studyPlanSyncQueue } from '../lib/syncQueue'
import {
  fetchStudyDayProgress,
  upsertStudyDayProgress,
} from '../services/studyPlanService'
import type { DayProgress, DayWithProgress, StudyPlanStats, StudySection } from '../types'

type UpsertPayload = Parameters<typeof upsertStudyDayProgress>[2]

function readCachedState(userId: string) {
  const cache = loadProgressCache(userId)
  return {
    progressMap: cache ? cacheToProgressMap(cache) : new Map<number, DayProgress>(),
    isLoading: !cache,
    isHydrated: Boolean(cache),
    pendingSync: cache?.pendingSync ?? [],
  }
}

function buildFullPayload(
  dayNumber: number,
  existing: DayProgress | undefined,
  patch: UpsertPayload,
  roadmapDays: RoadmapDay[],
): UpsertPayload {
  const day = roadmapDays.find((d) => d.day === dayNumber)
  const completed = patch.completedItems ?? existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
  const progressPercent =
    patch.progressPercent ?? existing?.progressPercent ??
    (day ? calculateDayProgressPercent(day, completed) : 0)

  return {
    notes: patch.notes ?? existing?.notes ?? '',
    timeSpentMinutes: patch.timeSpentMinutes ?? existing?.timeSpentMinutes ?? 0,
    completedItems: completed,
    progressPercent,
    status: patch.status ?? existing?.status ?? deriveStatus(progressPercent),
    completedAt:
      patch.completedAt !== undefined ? patch.completedAt : existing?.completedAt ?? null,
  }
}

export function useStudyPlan(userId: string) {
  const {
    days: roadmapDays,
    meta: planMeta,
    loading: contentLoading,
    error: contentError,
    reload: reloadContent,
  } = useStudyPlanContent()

  const cachedState = readCachedState(userId)

  const [progressMap, setProgressMap] = useState(cachedState.progressMap)
  const [isLoading, setIsLoading] = useState(cachedState.isLoading)
  const [isHydrated, setIsHydrated] = useState(cachedState.isHydrated)
  const [error, setError] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [notesSavingDay, setNotesSavingDay] = useState<number | null>(null)

  const pendingSyncRef = useRef<PendingSyncEntry[]>(cachedState.pendingSync)
  const progressMapRef = useRef(progressMap)
  const userIdRef = useRef(userId)

  useEffect(() => {
    progressMapRef.current = progressMap
  }, [progressMap])

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  const persistLocal = useCallback((map: Map<number, DayProgress>) => {
    saveProgressCache(userId, map, pendingSyncRef.current)
  }, [userId])

  const applyProgressMap = useCallback(
    (updater: (prev: Map<number, DayProgress>) => Map<number, DayProgress>) => {
      setProgressMap((prev) => {
        const next = updater(prev)
        persistLocal(next)
        return next
      })
    },
    [persistLocal],
  )

  const mergeServerRow = useCallback(
    (dayNumber: number, serverRow: DayProgress) => {
      applyProgressMap((prev) => {
        const next = new Map(prev)
        const day = roadmapDays.find((d) => d.day === dayNumber)
        const local = prev.get(dayNumber)

        if (day && local) {
          next.set(dayNumber, mergeDayProgress(local, serverRow, day))
        } else {
          next.set(dayNumber, serverRow)
        }
        return next
      })
    },
    [applyProgressMap, roadmapDays],
  )

  const runUpsert = useCallback(
    async (
      dayNumber: number,
      payload: UpsertPayload,
      options?: { notesOnly?: boolean; skipQueue?: boolean },
    ) => {
      if (userIdRef.current !== userId) return

      const execute = async () => {
        const existing = progressMapRef.current.get(dayNumber)
        const fullPayload = buildFullPayload(dayNumber, existing, payload, roadmapDays)

        if (options?.notesOnly) {
          setNotesSavingDay(dayNumber)
        } else {
          setSavingDay(dayNumber)
        }

        pendingSyncRef.current = queuePendingSync(
          userId,
          progressMapRef.current,
          { dayNumber, payload: fullPayload },
          pendingSyncRef.current,
        )

        const result = await upsertStudyDayProgress(userId, dayNumber, fullPayload)

        if (options?.notesOnly) {
          setNotesSavingDay(null)
        } else {
          setSavingDay(null)
        }

        if (result.error) {
          setError(result.error.message)
          if (!options?.notesOnly) {
            toast.error(result.error.message, 'Progress sync failed')
          }
          return
        }

        pendingSyncRef.current = clearPendingSyncForDay(
          userId,
          progressMapRef.current,
          dayNumber,
          pendingSyncRef.current,
        )

        mergeServerRow(dayNumber, result.data)
      }

      if (options?.skipQueue) {
        await execute()
      } else {
        await studyPlanSyncQueue.enqueue(dayNumber, execute)
      }
    },
    [mergeServerRow, roadmapDays, userId],
  )

  const flushPendingSync = useCallback(async () => {
    if (pendingSyncRef.current.length === 0) return

    const queue = [...pendingSyncRef.current]
    for (const entry of queue) {
      await runUpsert(
        entry.dayNumber,
        entry.payload as UpsertPayload,
        { skipQueue: true },
      )
    }
  }, [runUpsert])

  useEffect(() => {
    if (contentLoading) return undefined

    let cancelled = false

    const hydrateFromServer = async () => {
      const result = await fetchStudyDayProgress(userId)
      if (cancelled || userIdRef.current !== userId) return

      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        setIsHydrated(true)
        return
      }

      const remoteMap = new Map<number, DayProgress>()
      for (const row of result.data) {
        remoteMap.set(row.dayNumber, row)
      }

      applyProgressMap((prev) => mergeProgressMaps(prev, remoteMap, roadmapDays))
      setIsLoading(false)
      setIsHydrated(true)

      await flushPendingSync()
    }

    void hydrateFromServer()

    return () => {
      cancelled = true
    }
  }, [applyProgressMap, contentLoading, flushPendingSync, roadmapDays, userId])

  useEffect(() => {
    const handlePageHide = () => persistLocal(progressMapRef.current)

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        persistLocal(progressMapRef.current)
        void flushPendingSync()
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [flushPendingSync, persistLocal])

  const days: DayWithProgress[] = useMemo(
    () =>
      roadmapDays.map((day) => ({
        ...day,
        progress: progressMap.get(day.day) ?? null,
      })),
    [progressMap],
  )

  const stats: StudyPlanStats = useMemo(
    () => calculateStudyPlanStats(roadmapDays, progressMap),
    [progressMap],
  )

  const toggleItem = useCallback(
    async (dayNumber: number, section: StudySection, itemId: string) => {
      const day = roadmapDays.find((d) => d.day === dayNumber)
      if (!day) return

      let nextCompleted = EMPTY_COMPLETED_ITEMS
      let nextPercent = 0
      let nextStatus = deriveStatus(0)
      let wasChecked = false
      let snapshot: DayProgress | undefined

      applyProgressMap((prev) => {
        snapshot = prev.get(dayNumber)
        const currentCompleted = snapshot?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
        nextCompleted = toggleItemCompletion(currentCompleted, section, itemId)
        wasChecked = nextCompleted[section].includes(itemId)
        nextPercent = calculateDayProgressPercent(day, nextCompleted)
        nextStatus = deriveStatus(nextPercent)

        const next = new Map(prev)
        next.set(
          dayNumber,
          createOptimisticProgress(userId, dayNumber, snapshot, {
            completedItems: nextCompleted,
            progressPercent: nextPercent,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
          }),
        )
        return next
      })

      if (section === 'dsa') {
        void syncDsaItemWithTracker(userId, itemId, wasChecked)
      }

      await runUpsert(dayNumber, {
        completedItems: nextCompleted,
        progressPercent: nextPercent,
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
        notes: snapshot?.notes,
        timeSpentMinutes: snapshot?.timeSpentMinutes,
      })
    },
    [applyProgressMap, roadmapDays, runUpsert, userId],
  )

  const saveNotes = useCallback(
    async (dayNumber: number, notes: string) => {
      applyProgressMap((prev) => {
        const existing = prev.get(dayNumber)
        const day = roadmapDays.find((d) => d.day === dayNumber)
        if (!day) return prev

        const completed = existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
        const progressPercent =
          existing?.progressPercent ?? calculateDayProgressPercent(day, completed)

        const next = new Map(prev)
        next.set(
          dayNumber,
          createOptimisticProgress(userId, dayNumber, existing, {
            notes,
            completedItems: completed,
            progressPercent,
            status: existing?.status ?? deriveStatus(progressPercent),
          }),
        )
        return next
      })

      await runUpsert(dayNumber, { notes }, { notesOnly: true })
    },
    [applyProgressMap, roadmapDays, runUpsert, userId],
  )

  const addStudyTime = useCallback(
    async (dayNumber: number, minutesToAdd: number) => {
      if (minutesToAdd <= 0) return

      let nextMinutes = 0
      let snapshot: DayProgress | undefined

      applyProgressMap((prev) => {
        snapshot = prev.get(dayNumber)
        const day = roadmapDays.find((d) => d.day === dayNumber)
        if (!day) return prev

        const completed = snapshot?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
        nextMinutes = (snapshot?.timeSpentMinutes ?? 0) + minutesToAdd
        const progressPercent =
          snapshot?.progressPercent ?? calculateDayProgressPercent(day, completed)

        const next = new Map(prev)
        next.set(
          dayNumber,
          createOptimisticProgress(userId, dayNumber, snapshot, {
            timeSpentMinutes: nextMinutes,
            completedItems: completed,
            progressPercent,
            status: snapshot?.status ?? deriveStatus(progressPercent),
          }),
        )
        return next
      })

      await runUpsert(dayNumber, {
        timeSpentMinutes: nextMinutes,
        notes: snapshot?.notes,
        completedItems: snapshot?.completedItems,
      })
    },
    [applyProgressMap, roadmapDays, runUpsert, userId],
  )

  const reload = useCallback(async () => {
    setError(null)

    const result = await fetchStudyDayProgress(userId)
    if (result.error) {
      setError(result.error.message)
      return
    }

    const remoteMap = new Map<number, DayProgress>()
    for (const row of result.data) {
      remoteMap.set(row.dayNumber, row)
    }

    applyProgressMap((prev) => mergeProgressMaps(prev, remoteMap, roadmapDays))
    await reloadContent()
  }, [applyProgressMap, reloadContent, roadmapDays, userId])

  return {
    days,
    stats,
    planMeta,
    isLoading: (isLoading && !isHydrated) || contentLoading,
    error: error ?? contentError,
    expandedDay,
    setExpandedDay,
    toggleItem,
    saveNotes,
    addStudyTime,
    savingDay,
    notesSavingDay,
    reload,
  }
}
