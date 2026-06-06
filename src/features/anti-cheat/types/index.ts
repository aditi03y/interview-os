export type ViolationEventType =
  | 'tab_switch'
  | 'window_blur'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'idle_time'
  | 'fullscreen_exit'

export interface TestViolation {
  id: string
  userId: string
  testAttemptId: string | null
  eventType: ViolationEventType
  occurredAt: string
  metadata: Record<string, unknown>
}

export interface ViolationSummary {
  total: number
  byType: Record<ViolationEventType, number>
  last24Hours: number
  flaggedAttempts: number
}

export interface AttemptViolationSummary {
  attemptId: string
  attemptTitle: string
  total: number
  byType: Partial<Record<ViolationEventType, number>>
  lastOccurredAt: string | null
}

export const VIOLATION_EVENT_LABELS: Record<ViolationEventType, string> = {
  tab_switch: 'Tab Switch',
  window_blur: 'Window Blur',
  copy_attempt: 'Copy Attempt',
  paste_attempt: 'Paste Attempt',
  idle_time: 'Idle Time',
  fullscreen_exit: 'Fullscreen Exit',
}

export const VIOLATION_EVENT_DESCRIPTIONS: Record<ViolationEventType, string> = {
  tab_switch: 'User switched away from the test tab',
  window_blur: 'Test window lost focus',
  copy_attempt: 'Copy keyboard shortcut detected',
  paste_attempt: 'Paste keyboard shortcut detected',
  idle_time: 'No activity detected for extended period',
  fullscreen_exit: 'User exited fullscreen mode',
}

export const IDLE_THRESHOLD_MS = 60_000
export const VIOLATION_DEBOUNCE_MS = 2_000
