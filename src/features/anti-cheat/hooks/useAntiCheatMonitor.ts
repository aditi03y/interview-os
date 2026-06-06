import { useCallback, useEffect, useRef, useState } from 'react'
import { logViolation } from '../services/violationService'
import {
  IDLE_THRESHOLD_MS,
  VIOLATION_DEBOUNCE_MS,
  type TestViolation,
  type ViolationEventType,
} from '../types'

interface UseAntiCheatMonitorOptions {
  userId: string | undefined
  attemptId: string | undefined
  enabled?: boolean
  requestFullscreen?: boolean
}

export function useAntiCheatMonitor({
  userId,
  attemptId,
  enabled = true,
  requestFullscreen = true,
}: UseAntiCheatMonitorOptions) {
  const [violations, setViolations] = useState<TestViolation[]>([])
  const [isFullscreen, setIsFullscreen] = useState(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false,
  )

  const lastEventAtRef = useRef<Record<string, number>>({})
  const idleTimerRef = useRef<number | null>(null)
  const isIdleRef = useRef(false)
  const lastActivityRef = useRef(0)

  const recordEvent = useCallback(
    async (eventType: ViolationEventType, metadata?: Record<string, unknown>) => {
      if (!userId || !attemptId || !enabled) return

      const now = Date.now()
      const lastAt = lastEventAtRef.current[eventType] ?? 0
      if (now - lastAt < VIOLATION_DEBOUNCE_MS) return
      lastEventAtRef.current[eventType] = now

      const result = await logViolation(userId, eventType, attemptId, metadata)
      if (result.data) {
        setViolations((prev) => [result.data!, ...prev])
      }
    },
    [attemptId, enabled, userId],
  )

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    isIdleRef.current = false

    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current)
    }

    idleTimerRef.current = window.setTimeout(() => {
      isIdleRef.current = true
      const idleSeconds = Math.round((Date.now() - lastActivityRef.current) / 1000)
      void recordEvent('idle_time', { idleSeconds })
    }, IDLE_THRESHOLD_MS)
  }, [recordEvent])

  const wasFullscreenRef = useRef(false)

  useEffect(() => {
    if (!enabled || !userId || !attemptId) return undefined

    lastActivityRef.current = Date.now()

    if (requestFullscreen && document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen may be blocked by browser policy; monitoring still active
      })
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        void recordEvent('tab_switch')
      }
    }

    const onWindowBlur = () => {
      void recordEvent('window_blur')
    }

    const onCopy = () => {
      void recordEvent('copy_attempt')
    }

    const onPaste = () => {
      void recordEvent('paste_attempt')
    }

    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement)
      setIsFullscreen(active)
      if (wasFullscreenRef.current && !active) {
        void recordEvent('fullscreen_exit')
      }
      if (active) wasFullscreenRef.current = true
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const
    const onActivity = () => resetIdleTimer()

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    document.addEventListener('copy', onCopy)
    document.addEventListener('paste', onPaste)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    for (const event of activityEvents) {
      document.addEventListener(event, onActivity, { passive: true })
    }

    resetIdleTimer()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onWindowBlur)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('fullscreenchange', onFullscreenChange)

      for (const event of activityEvents) {
        document.removeEventListener(event, onActivity)
      }

      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current)
      }

      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    }
  }, [attemptId, enabled, recordEvent, requestFullscreen, resetIdleTimer, userId])

  return {
    violations,
    violationCount: violations.length,
    isFullscreen,
    enterFullscreen: () => {
      void document.documentElement.requestFullscreen?.().catch(() => {})
    },
  }
}
