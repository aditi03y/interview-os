import type { CompletedItems, DayProgress } from '../types'
import {
  calculateDayProgressPercent,
  deriveStatus,
  EMPTY_COMPLETED_ITEMS,
} from './progress'
import type { RoadmapDay } from '../types'

/** Union merge — progress is never lost during sync conflicts */
export function mergeCompletedItems(
  a: CompletedItems,
  b: CompletedItems,
): CompletedItems {
  return {
    theory: [...new Set([...a.theory, ...b.theory])],
    dsa: [...new Set([...a.dsa, ...b.dsa])],
    assignment: [...new Set([...a.assignment, ...b.assignment])],
  }
}

function mergeNotes(
  local: string,
  remote: string,
  localUpdatedAt: string,
  remoteUpdatedAt: string,
): string {
  if (local === remote) return local

  const localTime = new Date(localUpdatedAt).getTime()
  const remoteTime = new Date(remoteUpdatedAt).getTime()

  // Prefer the most recently edited version; tie-break by longer content.
  if (localTime !== remoteTime) {
    return localTime >= remoteTime ? local : remote
  }

  return local.length >= remote.length ? local : remote
}

export function mergeDayProgress(
  local: DayProgress,
  remote: DayProgress,
  day: RoadmapDay,
): DayProgress {
  const completedItems = mergeCompletedItems(local.completedItems, remote.completedItems)
  const progressPercent = calculateDayProgressPercent(day, completedItems)
  const status = deriveStatus(progressPercent)
  const localTime = new Date(local.updatedAt).getTime()
  const remoteTime = new Date(remote.updatedAt).getTime()

  return {
    ...remote,
    id: remote.id || local.id,
    completedItems,
    notes: mergeNotes(local.notes, remote.notes, local.updatedAt, remote.updatedAt),
    timeSpentMinutes: Math.max(local.timeSpentMinutes, remote.timeSpentMinutes),
    progressPercent,
    status,
    completedAt:
      status === 'completed'
        ? local.completedAt ?? remote.completedAt ?? new Date().toISOString()
        : null,
    updatedAt: new Date(Math.max(localTime, remoteTime)).toISOString(),
  }
}

export function mergeProgressMaps(
  local: Map<number, DayProgress>,
  remote: Map<number, DayProgress>,
  days: RoadmapDay[],
): Map<number, DayProgress> {
  const dayByNumber = new Map(days.map((d) => [d.day, d]))
  const merged = new Map<number, DayProgress>()

  const allDayNumbers = new Set([...local.keys(), ...remote.keys()])
  for (const dayNumber of allDayNumbers) {
    const day = dayByNumber.get(dayNumber)
    if (!day) continue

    const localRow = local.get(dayNumber)
    const remoteRow = remote.get(dayNumber)

    if (localRow && remoteRow) {
      merged.set(dayNumber, mergeDayProgress(localRow, remoteRow, day))
    } else if (localRow) {
      merged.set(dayNumber, localRow)
    } else if (remoteRow) {
      merged.set(dayNumber, remoteRow)
    }
  }

  return merged
}

export function createOptimisticProgress(
  userId: string,
  dayNumber: number,
  existing: DayProgress | undefined,
  patch: Partial<Pick<DayProgress, 'completedItems' | 'notes' | 'timeSpentMinutes' | 'progressPercent' | 'status' | 'completedAt'>>,
): DayProgress {
  const now = new Date().toISOString()
  return {
    id: existing?.id ?? `local-${dayNumber}`,
    userId,
    dayNumber,
    notes: patch.notes ?? existing?.notes ?? '',
    timeSpentMinutes: patch.timeSpentMinutes ?? existing?.timeSpentMinutes ?? 0,
    completedItems: patch.completedItems ?? existing?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS },
    status: patch.status ?? existing?.status ?? 'not_started',
    progressPercent: patch.progressPercent ?? existing?.progressPercent ?? 0,
    completedAt: patch.completedAt !== undefined ? patch.completedAt : existing?.completedAt ?? null,
    updatedAt: now,
  }
}
