export interface TimestampTimerState {
  /** Wall-clock ms when the current running segment started */
  startTimestamp: number | null
  /** Ms accumulated from prior running segments */
  accumulatedMs: number
  isRunning: boolean
}

export interface CountdownTimerState {
  expiresAt: string
  totalSeconds: number
}

export function createInitialTimerState(): TimestampTimerState {
  return { startTimestamp: null, accumulatedMs: 0, isRunning: false }
}

export function getElapsedMs(state: TimestampTimerState, now = Date.now()): number {
  const runningMs =
    state.isRunning && state.startTimestamp != null ? now - state.startTimestamp : 0
  return state.accumulatedMs + runningMs
}

export function startTimer(state: TimestampTimerState, now = Date.now()): TimestampTimerState {
  if (state.isRunning) return state
  return { ...state, isRunning: true, startTimestamp: now }
}

export function pauseTimer(state: TimestampTimerState, now = Date.now()): TimestampTimerState {
  if (!state.isRunning || state.startTimestamp == null) {
    return { ...state, isRunning: false, startTimestamp: null }
  }
  return {
    accumulatedMs: state.accumulatedMs + (now - state.startTimestamp),
    isRunning: false,
    startTimestamp: null,
  }
}

export function resetTimer(): TimestampTimerState {
  return createInitialTimerState()
}

export function getRemainingSeconds(expiresAt: string, now = Date.now()): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000))
}

export function getCountdownProgress(
  expiresAt: string,
  totalSeconds: number,
  now = Date.now(),
): number {
  if (totalSeconds <= 0) return 0
  const remaining = getRemainingSeconds(expiresAt, now)
  return Math.max(0, Math.min(100, (remaining / totalSeconds) * 100))
}

export function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
