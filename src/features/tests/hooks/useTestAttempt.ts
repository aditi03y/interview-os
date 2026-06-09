import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { useAuth } from '@/hooks/auth'
import { toast } from '@/lib/toast'
import {
  fetchAttemptById,
  fetchAttemptQuestions,
  saveAttemptAnswers,
  submitAttempt,
} from '../services/testService'
import {
  buildSectionPlan,
  clampQuestionIndexToSection,
  getSectionBounds,
  shouldUseSectionTimers,
} from '../lib/sectionPlan'
import { clearSectionTimerState } from '../lib/sectionTimerPersistence'
import { useSectionTestTimer } from './useSectionTestTimer'
import { useTestTimer } from './useTestTimer'
import type { AttemptAnswers, QuestionAnswer, TestAttempt, TestQuestion } from '../types'
import { totalSectionDuration } from '../types'

export function useTestAttempt(attemptId: string | undefined) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [answers, setAnswers] = useState<AttemptAnswers>({})
  const [currentIndex, setCurrentIndexRaw] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startedAtRef = useRef(0)
  const answersRef = useRef<AttemptAnswers>({})

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const sectionPlan = useMemo(
    () => buildSectionPlan(attempt?.definition?.sections ?? [], questions),
    [attempt?.definition?.sections, questions],
  )

  const sectionTimersEnabled = useMemo(
    () => shouldUseSectionTimers(attempt?.definition?.sections ?? [], sectionPlan),
    [attempt?.definition?.sections, sectionPlan],
  )

  useEffect(() => {
    if (!user || !attemptId) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      const attemptResult = await fetchAttemptById(attemptId, user.id)
      if (cancelled) return

      if (attemptResult.error || !attemptResult.data) {
        setError(attemptResult.error?.message ?? 'Attempt not found')
        setLoading(false)
        return
      }

      const loadedAttempt = attemptResult.data
      if (loadedAttempt.status !== 'in_progress') {
        navigate(ROUTES.testResults(attemptId), { replace: true })
        return
      }

      const questionsResult = await fetchAttemptQuestions(loadedAttempt)
      if (cancelled) return

      if (questionsResult.error || !questionsResult.data?.length) {
        setError(questionsResult.error?.message ?? 'Questions not found')
        setLoading(false)
        return
      }

      setAttempt(loadedAttempt)
      setQuestions(questionsResult.data)
      setAnswers(loadedAttempt.answers ?? {})
      startedAtRef.current = new Date(loadedAttempt.startedAt).getTime()
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [attemptId, navigate, user])

  const doSubmit = useCallback(
    async (autoSubmitted = false) => {
      if (!attempt || submitting) return
      setSubmitting(true)
      setError(null)

      const timeSpentSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000)
      const result = await submitAttempt({
        attempt,
        questions,
        answers: answersRef.current,
        autoSubmitted,
        timeSpentSeconds,
      })

      setSubmitting(false)
      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message, 'Submission failed')
        return
      }

      clearSectionTimerState(attempt.id)

      toast.success(
        autoSubmitted ? 'Test auto-submitted — time expired.' : 'Test submitted successfully.',
        'Submission complete',
      )
      navigate(ROUTES.testResults(attempt.id))
    },
    [attempt, navigate, questions, submitting],
  )

  const doSubmitRef = useRef(doSubmit)
  useEffect(() => {
    doSubmitRef.current = doSubmit
  }, [doSubmit])

  const handleOverallExpire = useCallback(() => {
    void doSubmitRef.current(true)
  }, [])

  const totalDurationSeconds = useMemo(() => {
    const sections = attempt?.definition?.sections ?? []
    const sectionDuration = totalSectionDuration(sections)
    const minutes =
      sectionDuration > 0 ? sectionDuration : (attempt?.definition?.durationMinutes ?? 60)
    return minutes * 60
  }, [attempt?.definition?.durationMinutes, attempt?.definition?.sections])

  const overallTimer = useTestTimer({
    expiresAt: attempt?.expiresAt ?? new Date(0).toISOString(),
    enabled: Boolean(attempt?.status === 'in_progress'),
    onExpire: handleOverallExpire,
    totalSeconds: totalDurationSeconds,
  })

  const handleSectionChange = useCallback(
    (nextSectionIndex: number) => {
      const bounds = getSectionBounds(sectionPlan, nextSectionIndex)
      setCurrentIndexRaw(bounds.start)
      const label = sectionPlan[nextSectionIndex]?.section.label ?? 'Next section'
      toast.info(`Time's up for the previous section. Starting: ${label}.`, 'Section change')
    },
    [sectionPlan],
  )

  const handleSectionSync = useCallback(
    (sectionIndex: number) => {
      const bounds = getSectionBounds(sectionPlan, sectionIndex)
      setCurrentIndexRaw(bounds.start)
    },
    [sectionPlan],
  )

  const handleAllSectionsExpire = useCallback(() => {
    toast.info('All section timers ended. Submitting your test.', 'Time expired')
    void doSubmitRef.current(true)
  }, [])

  const sectionTimer = useSectionTestTimer({
    attemptId,
    plan: sectionPlan,
    enabled: sectionTimersEnabled && Boolean(attempt?.status === 'in_progress'),
    onSectionExpire: handleSectionChange,
    onSectionSync: handleSectionSync,
    onAllSectionsExpire: handleAllSectionsExpire,
  })

  const setCurrentIndex = useCallback(
    (index: number) => {
      if (!sectionTimersEnabled) {
        setCurrentIndexRaw(index)
        return
      }
      setCurrentIndexRaw(
        clampQuestionIndexToSection(index, sectionPlan, sectionTimer.sectionIndex),
      )
    },
    [sectionPlan, sectionTimer.sectionIndex, sectionTimersEnabled],
  )

  const setAnswer = useCallback(
    (questionId: string, patch: Partial<QuestionAnswer> & { value: string }) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...patch, value: patch.value },
      }))
    },
    [],
  )

  const persistAnswers = useCallback(async () => {
    if (!attempt) return
    await saveAttemptAnswers(attempt.id, answersRef.current)
  }, [attempt])

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return undefined
    const interval = window.setInterval(() => {
      void persistAnswers()
    }, 15_000)
    return () => window.clearInterval(interval)
  }, [attempt, persistAnswers])

  const currentQuestion = questions[currentIndex]
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id]
    if (!a?.value?.trim()) return false
    if (q.questionType === 'coding') {
      return Boolean(a.timeComplexity?.trim() && a.spaceComplexity?.trim())
    }
    return true
  }).length

  const sectionBounds = sectionTimersEnabled
    ? getSectionBounds(sectionPlan, sectionTimer.sectionIndex)
    : null

  const goNext = useCallback(() => {
    if (sectionBounds) {
      setCurrentIndex(Math.min(currentIndex + 1, sectionBounds.end))
      return
    }
    setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1))
  }, [currentIndex, questions.length, sectionBounds, setCurrentIndex])

  const goPrev = useCallback(() => {
    if (sectionBounds) {
      setCurrentIndex(Math.max(currentIndex - 1, sectionBounds.start))
      return
    }
    setCurrentIndex(Math.max(currentIndex - 1, 0))
  }, [currentIndex, sectionBounds, setCurrentIndex])

  const isLastQuestionInSection = sectionBounds
    ? currentIndex >= sectionBounds.end
    : currentIndex >= questions.length - 1

  const canAdvanceSectionEarly =
    sectionTimersEnabled &&
    sectionTimer.sectionIndex < sectionTimer.sectionCount - 1 &&
    isLastQuestionInSection

  return {
    attempt,
    questions,
    answers,
    currentIndex,
    currentQuestion,
    loading,
    submitting,
    error,
    formattedTime: sectionTimersEnabled
      ? sectionTimer.sectionFormattedTime
      : overallTimer.formattedTime,
    remainingSeconds: sectionTimersEnabled
      ? sectionTimer.sectionRemainingSeconds
      : overallTimer.remainingSeconds,
    timerProgress: sectionTimersEnabled
      ? sectionTimer.sectionTimerProgress
      : overallTimer.progressPercent,
    overallFormattedTime: overallTimer.formattedTime,
    overallRemainingSeconds: overallTimer.remainingSeconds,
    overallTimerProgress: overallTimer.progressPercent,
    isExpired: overallTimer.isExpired,
    sectionTimersEnabled,
    currentSection: sectionTimer.currentSection,
    sectionIndex: sectionTimer.sectionIndex,
    sectionCount: sectionTimer.sectionCount,
    sectionPlan,
    canAdvanceSectionEarly,
    advanceSectionEarly: sectionTimer.advanceSectionEarly,
    answeredCount,
    setAnswer,
    setCurrentIndex,
    goNext,
    goPrev,
    submit: () => doSubmit(false),
  }
}
