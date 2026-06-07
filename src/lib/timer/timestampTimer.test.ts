import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  createInitialTimerState,
  getElapsedMs,
  getRemainingSeconds,
  pauseTimer,
  startTimer,
} from '@/lib/timer/timestampTimer'

describe('timestampTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('accumulates elapsed time across tab switches using timestamps', () => {
    let state = createInitialTimerState()
    state = startTimer(state, Date.now())

    vi.advanceTimersByTime(5000)
    state = pauseTimer(state, Date.now())

    expect(getElapsedMs(state)).toBe(5000)

    state = startTimer(state, Date.now())
    vi.advanceTimersByTime(3000)
    state = pauseTimer(state, Date.now())

    expect(getElapsedMs(state)).toBe(8000)
  })

  it('computes countdown from expiresAt regardless of interval drift', () => {
    const expiresAt = new Date(Date.now() + 90_000).toISOString()
    expect(getRemainingSeconds(expiresAt)).toBe(90)

    vi.advanceTimersByTime(30_000)
    expect(getRemainingSeconds(expiresAt)).toBe(60)
  })
})
