import { useEffect, useRef, useState } from 'react'
import {
  formatSeconds,
  getCountdownProgress,
  getRemainingSeconds,
} from '@/lib/timer/timestampTimer'

interface UseTestTimerOptions {
  expiresAt: string
  onExpire: () => void
  enabled?: boolean
  totalSeconds?: number
}

export function useTestTimer({
  expiresAt,
  onExpire,
  enabled = true,
  totalSeconds = 3600,
}: UseTestTimerOptions) {
  const [now, setNow] = useState(() => Date.now())
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  const expiresAtRef = useRef(expiresAt)

  useEffect(() => {
    expiresAtRef.current = expiresAt
  }, [expiresAt])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!enabled || !expiresAt || expiresAt === new Date(0).toISOString()) return undefined

    expiredRef.current = getRemainingSeconds(expiresAt, Date.now()) <= 0

    const syncClock = () => {
      const currentNow = Date.now()
      setNow(currentNow)

      const remaining = getRemainingSeconds(expiresAtRef.current, currentNow)
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current()
      }
    }

    syncClock()
    const interval = window.setInterval(syncClock, 1000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncClock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', syncClock)
    window.addEventListener('pageshow', syncClock)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', syncClock)
      window.removeEventListener('pageshow', syncClock)
    }
  }, [enabled, expiresAt])

  const remainingSeconds = enabled ? getRemainingSeconds(expiresAt, now) : 0

  const progressPercent = enabled
    ? getCountdownProgress(expiresAt, totalSeconds, now)
    : 0

  return {
    remainingSeconds,
    formattedTime: formatSeconds(remainingSeconds),
    isExpired: remainingSeconds <= 0,
    progressPercent,
  }
}
