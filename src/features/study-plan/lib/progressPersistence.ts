import { STORAGE_KEYS } from '@/lib/constants/app'
import type { DayProgress } from '../types'

const CACHE_VERSION = 1

export interface StudyProgressCache {
  version: typeof CACHE_VERSION
  userId: string
  days: Record<number, DayProgress>
  savedAt: string
}

export interface PendingSyncEntry {
  dayNumber: number
  payload: Record<string, unknown>
  queuedAt: string
  retryCount: number
}

export interface StudyProgressStore extends StudyProgressCache {
  pendingSync: PendingSyncEntry[]
}

function storageKey(userId: string): string {
  return STORAGE_KEYS.studyProgress(userId)
}

export function loadProgressCache(userId: string): StudyProgressStore | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as StudyProgressStore
    if (parsed.version !== CACHE_VERSION || parsed.userId !== userId) return null

    return parsed
  } catch {
    return null
  }
}

export function cacheToProgressMap(cache: StudyProgressCache): Map<number, DayProgress> {
  return new Map(
    Object.entries(cache.days).map(([day, progress]) => [Number(day), progress]),
  )
}

export function progressMapToCache(
  userId: string,
  map: Map<number, DayProgress>,
  pendingSync: PendingSyncEntry[] = [],
): StudyProgressStore {
  const days: Record<number, DayProgress> = {}
  for (const [dayNumber, progress] of map) {
    days[dayNumber] = progress
  }

  return {
    version: CACHE_VERSION,
    userId,
    days,
    pendingSync,
    savedAt: new Date().toISOString(),
  }
}

export function saveProgressCache(
  userId: string,
  map: Map<number, DayProgress>,
  pendingSync: PendingSyncEntry[] = [],
): void {
  if (typeof window === 'undefined') return

  try {
    const payload = progressMapToCache(userId, map, pendingSync)
    localStorage.setItem(storageKey(userId), JSON.stringify(payload))
  } catch (err) {
    console.warn('[StudyPlan] Failed to persist progress cache', err)
  }
}

export function queuePendingSync(
  userId: string,
  map: Map<number, DayProgress>,
  entry: Omit<PendingSyncEntry, 'queuedAt' | 'retryCount'>,
  existingPending: PendingSyncEntry[] = [],
): PendingSyncEntry[] {
  const pending = [
    ...existingPending.filter((p) => p.dayNumber !== entry.dayNumber),
    {
      ...entry,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    },
  ]
  saveProgressCache(userId, map, pending)
  return pending
}

export function clearPendingSyncForDay(
  userId: string,
  map: Map<number, DayProgress>,
  dayNumber: number,
  pending: PendingSyncEntry[],
): PendingSyncEntry[] {
  const next = pending.filter((p) => p.dayNumber !== dayNumber)
  saveProgressCache(userId, map, next)
  return next
}
