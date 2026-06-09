import { getCachedStudyPlanDays } from '@/features/study-plan/lib/studyPlanContentCache'
import { getDayTitleMap } from '@/features/study-plan/services/studyPlanContentService'
import type { RoadmapDay } from '@/features/study-plan/types'
import type { ScheduleType, ScheduledTestSlot, TestDefinition } from '../types'

const MS_PER_DAY = 86_400_000

export function getPlanDay(anchorDate: Date, today: Date = new Date()): number {
  const anchor = startOfDay(anchorDate)
  const now = startOfDay(today)
  const diff = Math.floor((now.getTime() - anchor.getTime()) / MS_PER_DAY)
  return Math.max(1, diff + 1)
}

export function isRevisionDue(planDay: number): boolean {
  return planDay >= 2 && planDay % 2 === 0
}

export function isCumulativeDue(planDay: number): boolean {
  return planDay >= 5 && planDay % 5 === 0
}

/**
 * 2-day revision on even plan days (2, 4, 6, …) covers the current pair of study days
 * ending today — e.g. plan day 4 → study days 3 & 4 (never day 0).
 */
export function getRevisionStudyDays(planDay: number): number[] {
  if (planDay < 2) return []
  return [planDay - 1, planDay]
}

/**
 * Study days used to load questions when starting a test.
 * When the admin configured days on the test definition, those always win.
 * Scheduler days apply only when the definition has no study days set.
 */
export function resolveCoveredStudyDays(
  definitionDays: number[],
  scheduledDays?: number[],
): number[] {
  const valid = (days: number[]) => days.filter((day) => day >= 1)
  const def = valid(definitionDays)

  if (def.length) return def

  return valid(scheduledDays ?? [])
}

export function getCumulativeStudyDays(
  planDay: number,
  days: RoadmapDay[] = getCachedStudyPlanDays(),
): number[] {
  const maxDay = days.length ? Math.max(...days.map((d) => d.day)) : planDay
  return Array.from({ length: Math.min(planDay, maxDay) }, (_, i) => i + 1)
}

export function getStudyDayTitles(
  studyDays: number[],
  days: RoadmapDay[] = getCachedStudyPlanDays(),
): string[] {
  const titleMap = getDayTitleMap(days)
  return studyDays
    .map((day) => titleMap.get(day))
    .filter((title): title is string => Boolean(title))
}

export function buildScheduledSlots(
  definitions: TestDefinition[],
  planDay: number,
  completedScheduleKeys: Set<string>,
  days: RoadmapDay[] = getCachedStudyPlanDays(),
): ScheduledTestSlot[] {
  const slots: ScheduledTestSlot[] = []

  const revisionDef = definitions.find((d) => d.scheduleType === 'revision_2d')
  if (revisionDef && isRevisionDue(planDay)) {
    const covered = getRevisionStudyDays(planDay)
    const key = `revision_2d:${planDay}`
    slots.push({
      definition: revisionDef,
      scheduleType: 'revision_2d',
      planDay,
      coveredStudyDays: covered,
      dueLabel: `Revision — Days ${covered.join(' & ')} (${getStudyDayTitles(covered, days).join(', ')})`,
      isDue: true,
      completedToday: completedScheduleKeys.has(key),
    })
  }

  const cumulativeDef = definitions.find((d) => d.scheduleType === 'cumulative_5d')
  if (cumulativeDef && isCumulativeDue(planDay)) {
    const covered = getCumulativeStudyDays(planDay, days)
    const key = `cumulative_5d:${planDay}`
    slots.push({
      definition: cumulativeDef,
      scheduleType: 'cumulative_5d',
      planDay,
      coveredStudyDays: covered,
      dueLabel: `Cumulative — Days 1–${planDay}`,
      isDue: true,
      completedToday: completedScheduleKeys.has(key),
    })
  }

  return slots
}

export function getNextScheduledEvent(planDay: number): {
  type: ScheduleType
  daysUntil: number
  label: string
} | null {
  for (let offset = 1; offset <= 10; offset += 1) {
    const futureDay = planDay + offset
    if (isRevisionDue(futureDay)) {
      return {
        type: 'revision_2d',
        daysUntil: offset,
        label: `2-day revision on plan day ${futureDay}`,
      }
    }
    if (isCumulativeDue(futureDay)) {
      return {
        type: 'cumulative_5d',
        daysUntil: offset,
        label: `5-day cumulative on plan day ${futureDay}`,
      }
    }
  }
  return null
}

export function scheduleKey(scheduleType: ScheduleType, planDay: number): string {
  return `${scheduleType}:${planDay}`
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}
