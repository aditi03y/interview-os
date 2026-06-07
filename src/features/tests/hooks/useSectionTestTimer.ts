import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatSeconds, getCountdownProgress, getRemainingSeconds } from '@/lib/timer/timestampTimer'
import {
  createSectionExpiresAt,
  initialSectionTimerState,
  reconcileSectionTimerState,
  type SectionPlanItem,
  type SectionTimerState,
} from '../lib/sectionPlan'
import {
  clearSectionTimerState,
  loadSectionTimerState,
  saveSectionTimerState,
} from '../lib/sectionTimerPersistence'

interface UseSectionTestTimerOptions {
  attemptId: string | undefined
  plan: SectionPlanItem[]
  enabled: boolean
  onSectionExpire: (nextSectionIndex: number) => void
  onSectionSync: (sectionIndex: number) => void
  onAllSectionsExpire: () => void
}

export function useSectionTestTimer({
  attemptId,
  plan,
  enabled,
  onSectionExpire,
  onSectionSync,
  onAllSectionsExpire,
}: UseSectionTestTimerOptions) {
  const sessionKey = `${attemptId ?? ''}:${enabled}:${plan.map((item) => item.section.id).join('|')}`

  const boot = useMemo(() => {
    if (!enabled || !attemptId || !plan.length) return null

    const stored = loadSectionTimerState(attemptId)
    const base = stored ?? initialSectionTimerState(plan)
    const reconciled = reconcileSectionTimerState(plan, base)

    return {
      state: reconciled.state,
      expiredAll: reconciled.expiredAll,
      advancedOnLoad: Boolean(stored && reconciled.state.sectionIndex > base.sectionIndex),
    }
  }, [attemptId, enabled, plan])

  const [timerState, setTimerState] = useState<SectionTimerState | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const expiredRef = useRef(false)
  const initializedKeyRef = useRef('')
  const onSectionExpireRef = useRef(onSectionExpire)
  const onSectionSyncRef = useRef(onSectionSync)
  const onAllSectionsExpireRef = useRef(onAllSectionsExpire)

  useEffect(() => {
    onSectionExpireRef.current = onSectionExpire
  }, [onSectionExpire])

  useEffect(() => {
    onSectionSyncRef.current = onSectionSync
  }, [onSectionSync])

  useEffect(() => {
    onAllSectionsExpireRef.current = onAllSectionsExpire
  }, [onAllSectionsExpire])

  useEffect(() => {
    if (!enabled || !attemptId || !plan.length || !boot) return
    if (initializedKeyRef.current === sessionKey) return

    initializedKeyRef.current = sessionKey
    expiredRef.current = false
    setTimerState(boot.state)
    saveSectionTimerState(attemptId, boot.state)

    if (boot.expiredAll) {
      expiredRef.current = true
      onAllSectionsExpireRef.current()
      return
    }

    if (boot.advancedOnLoad) {
      onSectionExpireRef.current(boot.state.sectionIndex)
      return
    }

    if (boot.state.sectionIndex > 0) {
      onSectionSyncRef.current(boot.state.sectionIndex)
    }
  }, [attemptId, boot, enabled, plan.length, sessionKey])

  useEffect(() => {
    if (!enabled || !attemptId || !timerState || !plan.length) return undefined

    const tick = () => {
      const currentNow = Date.now()
      setNow(currentNow)

      const remaining = getRemainingSeconds(timerState.sectionExpiresAt, currentNow)
      if (remaining > 0 || expiredRef.current) return

      expiredRef.current = true

      if (timerState.sectionIndex >= plan.length - 1) {
        onAllSectionsExpireRef.current()
        return
      }

      const nextIndex = timerState.sectionIndex + 1
      const nextState: SectionTimerState = {
        sectionIndex: nextIndex,
        sectionExpiresAt: createSectionExpiresAt(plan[nextIndex]!.section.durationMinutes, currentNow),
      }

      setTimerState(nextState)
      saveSectionTimerState(attemptId, nextState)
      expiredRef.current = false
      onSectionExpireRef.current(nextIndex)
    }

    tick()
    const interval = window.setInterval(tick, 1000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [attemptId, enabled, plan, timerState])

  const advanceSectionEarly = useCallback(() => {
    if (!attemptId || !timerState || !plan.length) return
    if (timerState.sectionIndex >= plan.length - 1) return

    const nextIndex = timerState.sectionIndex + 1
    const nextState: SectionTimerState = {
      sectionIndex: nextIndex,
      sectionExpiresAt: createSectionExpiresAt(plan[nextIndex]!.section.durationMinutes),
    }
    setTimerState(nextState)
    saveSectionTimerState(attemptId, nextState)
    onSectionExpireRef.current(nextIndex)
  }, [attemptId, plan, timerState])

  const currentSection = enabled && timerState ? plan[timerState.sectionIndex] : null
  const sectionDurationSeconds = currentSection
    ? currentSection.section.durationMinutes * 60
    : 0
  const sectionRemainingSeconds =
    enabled && timerState
      ? getRemainingSeconds(timerState.sectionExpiresAt, now)
      : 0

  return {
    sectionIndex: timerState?.sectionIndex ?? 0,
    sectionCount: plan.length,
    currentSection,
    sectionFormattedTime: formatSeconds(sectionRemainingSeconds),
    sectionTimerProgress: timerState
      ? getCountdownProgress(timerState.sectionExpiresAt, sectionDurationSeconds, now)
      : 100,
    sectionRemainingSeconds,
    advanceSectionEarly,
    clearPersistence: () => {
      if (attemptId) clearSectionTimerState(attemptId)
    },
  }
}
