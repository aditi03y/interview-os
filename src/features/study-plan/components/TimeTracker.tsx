import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatStudyTime } from '../lib/progress'

interface TimeTrackerProps {
  totalMinutes: number
  onAddTime: (minutes: number) => Promise<void>
  isSaving: boolean
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimeTracker({ totalMinutes, onAddTime, isSaving }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const handleStart = () => setIsRunning(true)

  const handlePause = async () => {
    setIsRunning(false)
    const minutes = Math.max(1, Math.round(elapsedSeconds / 60))
    if (elapsedSeconds >= 30) {
      await onAddTime(minutes)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Time Tracking
          </p>
          <p className="mt-1 text-2xl font-mono font-bold tabular-nums">
            {formatElapsed(elapsedSeconds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total logged: {formatStudyTime(totalMinutes)}
            {isSaving ? ' · Saving...' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={handleStart}>
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => void handlePause()}>
              <Pause className="h-4 w-4" />
              Pause & Save
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleReset} disabled={elapsedSeconds === 0}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
