import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import {
  evaluateGithubRepo,
  fetchReviewById,
  fetchReviewHistory,
} from '../services/evaluationService'
import type { GithubReviewHistoryItem, RepoEvaluationReport } from '../types'

export function useGithubEvaluator() {
  const { user } = useAuth()
  const [repoUrl, setRepoUrl] = useState('')
  const [report, setReport] = useState<RepoEvaluationReport | null>(null)
  const [history, setHistory] = useState<GithubReviewHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    const result = await fetchReviewHistory(user.id)
    if (result.data) setHistory(result.data)
    setHistoryLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setHistoryLoading(true)
      const result = await fetchReviewHistory(user.id)
      if (cancelled) return
      if (result.data) setHistory(result.data)
      setHistoryLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when user id changes
  }, [user?.id])

  const evaluate = useCallback(async () => {
    if (!user || !repoUrl.trim()) return
    setLoading(true)
    setError(null)
    setReport(null)

    const result = await evaluateGithubRepo(user.id, repoUrl)
    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setReport(result.data)
    void loadHistory()
  }, [loadHistory, repoUrl, user])

  const loadReview = useCallback(
    async (reviewId: string) => {
      if (!user) return
      setLoading(true)
      setError(null)

      const result = await fetchReviewById(user.id, reviewId)
      setLoading(false)

      if (result.error) {
        setError(result.error.message)
        return
      }

      setReport(result.data)
      if (result.data?.repoUrl) setRepoUrl(result.data.repoUrl)
    },
    [user],
  )

  return {
    repoUrl,
    setRepoUrl,
    report,
    history,
    loading,
    historyLoading,
    error,
    evaluate,
    loadReview,
    reloadHistory: loadHistory,
  }
}
