import type { SectionTimerState } from './sectionPlan'

const STORAGE_PREFIX = 'interview-os-section-timer:'

function storageKey(attemptId: string): string {
  return `${STORAGE_PREFIX}${attemptId}`
}

export function loadSectionTimerState(attemptId: string): SectionTimerState | null {
  try {
    const raw = sessionStorage.getItem(storageKey(attemptId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SectionTimerState
    if (
      typeof parsed.sectionIndex !== 'number' ||
      typeof parsed.sectionExpiresAt !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveSectionTimerState(attemptId: string, state: SectionTimerState): void {
  try {
    sessionStorage.setItem(storageKey(attemptId), JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

export function clearSectionTimerState(attemptId: string): void {
  try {
    sessionStorage.removeItem(storageKey(attemptId))
  } catch {
    // ignore
  }
}
