import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTestTimerOptions {
  expiresAt: string
  onExpire: () => void
  enabled?: boolean
}

export function useTestTimer({ expiresAt, onExpire, enabled = true }: UseTestTimerOptions) {
  const [, tick] = useState(0)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!enabled) return undefined

    expiredRef.current = false

    const interval = window.setInterval(() => {
      tick((n) => n + 1)
      const next = getRemaining(expiresAt)
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current()
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAt, enabled])

  const remainingSeconds = getRemaining(expiresAt)

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60)
    const secs = Math.max(0, seconds) % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [])

  const progressPercent = useCallback(
    (totalSeconds: number) => {
      if (totalSeconds <= 0) return 0
      return Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
    },
    [remainingSeconds],
  )

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isExpired: remainingSeconds <= 0,
    progressPercent,
  }
}

function getRemaining(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}
