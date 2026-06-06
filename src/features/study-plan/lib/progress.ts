import type { StudyStatus } from '@/types'
import type {
  CompletedItems,
  DayProgress,
  DayWithProgress,
  RoadmapDay,
  StudyPlanStats,
  StudySection,
} from '../types'

export const EMPTY_COMPLETED_ITEMS: CompletedItems = {
  theory: [],
  dsa: [],
  assignment: [],
}

export function getDayItemCount(day: RoadmapDay): number {
  return day.theory.length + day.dsa.length + day.assignment.length
}

export function getTotalRoadmapItems(days: RoadmapDay[]): number {
  return days.reduce((sum, day) => sum + getDayItemCount(day), 0)
}

export function countCompletedItems(completed: CompletedItems): number {
  return completed.theory.length + completed.dsa.length + completed.assignment.length
}

export function calculateDayProgressPercent(
  day: RoadmapDay,
  completed: CompletedItems,
): number {
  const total = getDayItemCount(day)
  if (total === 0) return 0
  return Math.round((countCompletedItems(completed) / total) * 100)
}

export function deriveStatus(progressPercent: number): StudyStatus {
  if (progressPercent === 0) return 'not_started'
  if (progressPercent === 100) return 'completed'
  return 'in_progress'
}

export function toggleItemCompletion(
  completed: CompletedItems,
  section: StudySection,
  itemId: string,
): CompletedItems {
  const sectionItems = completed[section]
  const exists = sectionItems.includes(itemId)

  return {
    ...completed,
    [section]: exists
      ? sectionItems.filter((id) => id !== itemId)
      : [...sectionItems, itemId],
  }
}

export function isItemCompleted(
  completed: CompletedItems,
  section: StudySection,
  itemId: string,
): boolean {
  return completed[section].includes(itemId)
}

export function mergeDayWithProgress(
  day: RoadmapDay,
  progress: DayProgress | null,
): DayWithProgress {
  return { ...day, progress }
}

export function calculateStudyPlanStats(
  days: RoadmapDay[],
  progressMap: Map<number, DayProgress>,
): StudyPlanStats {
  let completedItemCount = 0
  let completedDays = 0
  let inProgressDays = 0
  let totalTimeMinutes = 0

  for (const day of days) {
    const progress = progressMap.get(day.day)
    const completed = progress?.completedItems ?? EMPTY_COMPLETED_ITEMS
    const percent =
      progress?.progressPercent ?? calculateDayProgressPercent(day, completed)

    completedItemCount += countCompletedItems(completed)
    totalTimeMinutes += progress?.timeSpentMinutes ?? 0

    if (percent === 100) completedDays += 1
    else if (percent > 0) inProgressDays += 1
  }

  const totalItems = getTotalRoadmapItems(days)
  const overallPercent =
    totalItems === 0 ? 0 : Math.round((completedItemCount / totalItems) * 100)

  return {
    overallPercent,
    completedDays,
    totalDays: days.length,
    totalTimeMinutes,
    inProgressDays,
  }
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function parseCompletedItems(raw: unknown): CompletedItems {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_COMPLETED_ITEMS }

  const obj = raw as Record<string, unknown>
  const toArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : []

  return {
    theory: toArray(obj.theory),
    dsa: toArray(obj.dsa),
    assignment: toArray(obj.assignment),
  }
}
