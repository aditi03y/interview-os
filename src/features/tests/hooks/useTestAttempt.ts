import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { useAuth } from '@/hooks/auth'
import {
  fetchAttemptById,
  fetchAttemptQuestions,
  saveAttemptAnswers,
  submitAttempt,
} from '../services/testService'
import { useTestTimer } from './useTestTimer'
import type { AttemptAnswers, TestAttempt, TestQuestion } from '../types'

export function useTestAttempt(attemptId: string | undefined) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [answers, setAnswers] = useState<AttemptAnswers>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startedAtRef = useRef(0)
  const answersRef = useRef<AttemptAnswers>({})

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

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
        return
      }
      navigate(ROUTES.testResults(attempt.id))
    },
    [attempt, navigate, questions, submitting],
  )

  const handleExpire = useCallback(() => {
    void doSubmit(true)
  }, [doSubmit])

  const { formattedTime, remainingSeconds, progressPercent, isExpired } = useTestTimer({
    expiresAt: attempt?.expiresAt ?? new Date(0).toISOString(),
    enabled: Boolean(attempt?.status === 'in_progress'),
    onExpire: handleExpire,
  })

  const totalDurationSeconds = attempt?.definition?.durationMinutes
    ? attempt.definition.durationMinutes * 60
    : 0

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { value },
    }))
  }, [])

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
  const answeredCount = questions.filter((q) => answers[q.id]?.value?.trim()).length

  return {
    attempt,
    questions,
    answers,
    currentIndex,
    currentQuestion,
    loading,
    submitting,
    error,
    formattedTime,
    remainingSeconds,
    timerProgress: progressPercent(totalDurationSeconds),
    isExpired,
    answeredCount,
    setAnswer,
    setCurrentIndex,
    goNext: () => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1)),
    goPrev: () => setCurrentIndex((i) => Math.max(i - 1, 0)),
    submit: () => doSubmit(false),
  }
}
