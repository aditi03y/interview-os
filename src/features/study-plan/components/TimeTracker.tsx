import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { STORAGE_KEYS } from '@/lib/constants/app'
import { toast } from '@/lib/toast'
import {
  formatSeconds,
  getElapsedMs,
  pauseTimer,
  resetTimer,
  startTimer,
  type TimestampTimerState,
} from '@/lib/timer/timestampTimer'
import { Button } from '@/components/ui'
import { formatStudyTime } from '../lib/progress'

interface TimeTrackerProps {
  dayNumber: number
  totalMinutes: number
  onAddTime: (minutes: number) => Promise<void>
  isSaving: boolean
}

function loadTimerState(userId: string, dayNumber: number): TimestampTimerState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.studyTimer(userId, dayNumber))
    if (!raw) return null
    return JSON.parse(raw) as TimestampTimerState
  } catch {
    return null
  }
}

function saveTimerState(userId: string, dayNumber: number, state: TimestampTimerState): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.studyTimer(userId, dayNumber), JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

export function TimeTracker({ dayNumber, totalMinutes, onAddTime, isSaving }: TimeTrackerProps) {
  const { user } = useAuth()
  const userId = user?.id

  const [timerState, setTimerState] = useState<TimestampTimerState>(() => {
    if (!userId) return resetTimer()
    return loadTimerState(userId, dayNumber) ?? resetTimer()
  })
  const [, tick] = useState(0)
  const timerRef = useRef(timerState)
  const isPausingRef = useRef(false)

  useEffect(() => {
    timerRef.current = timerState
  }, [timerState])

  const persist = useCallback(
    (state: TimestampTimerState) => {
      if (!userId) return
      saveTimerState(userId, dayNumber, state)
    },
    [dayNumber, userId],
  )

  const updateTimer = useCallback(
    (updater: (prev: TimestampTimerState) => TimestampTimerState) => {
      setTimerState((prev) => {
        const next = updater(prev)
        persist(next)
        return next
      })
    },
    [persist],
  )

  // Persist running timer when component unmounts (day collapsed / navigation)
  useEffect(() => {
    return () => {
      if (userId) {
        saveTimerState(userId, dayNumber, timerRef.current)
      }
    }
  }, [dayNumber, userId])

  useEffect(() => {
    if (!timerState.isRunning) return

    const interval = window.setInterval(() => tick((n) => n + 1), 1000)

    const handleVisibility = () => {
      tick((n) => n + 1)
      if (document.visibilityState === 'hidden') {
        persist(timerRef.current)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [persist, timerState.isRunning])

  const elapsedSeconds = Math.floor(getElapsedMs(timerState) / 1000)

  const handleStart = () => updateTimer((prev) => startTimer(prev))

  const handlePause = async () => {
    if (isPausingRef.current) return
    isPausingRef.current = true

    try {
      const paused = pauseTimer(timerRef.current)
      updateTimer(() => paused)
      persist(paused)

      const elapsedMs = getElapsedMs(paused)
      if (elapsedMs >= 30_000) {
        const minutes = Math.max(1, Math.round(elapsedMs / 60_000))
        await onAddTime(minutes)
        toast.success(`Logged ${minutes} minute${minutes === 1 ? '' : 's'} of study time.`)
      }

      updateTimer(() => resetTimer())
    } finally {
      isPausingRef.current = false
    }
  }

  const handleReset = () => updateTimer(() => resetTimer())

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Time Tracking
          </p>
          <p className="mt-1 text-2xl font-mono font-bold tabular-nums" aria-live="polite">
            {formatSeconds(elapsedSeconds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total logged: {formatStudyTime(totalMinutes)}
            {isSaving ? ' · Saving...' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!timerState.isRunning ? (
            <Button size="sm" onClick={handleStart} className="min-w-[5.5rem]">
              <Play className="h-4 w-4" aria-hidden />
              Start
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void handlePause()}
              className="min-w-[5.5rem]"
            >
              <Pause className="h-4 w-4" aria-hidden />
              Pause & Save
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={elapsedSeconds === 0}
            className="min-w-[5.5rem]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
