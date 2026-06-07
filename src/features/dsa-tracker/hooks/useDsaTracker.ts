import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { toast } from '@/lib/toast'
import type { Difficulty } from '@/types'
import {
  buildDailySolves,
  buildDifficultyBreakdown,
  buildTopicDistribution,
  calculateMetrics,
  filterProblems,
} from '../lib/stats'
import {
  createProblem,
  deleteProblem,
  fetchProblems,
  updateProblem,
  updateProblemStatus,
} from '../services/dsaService'
import type { DsaProblem, DsaProblemInput, ProblemStatus, ViewMode } from '../types'

export function useDsaTracker() {
  const { user } = useAuth()
  const [problems, setProblems] = useState<DsaProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<DsaProblem | null>(null)

  const loadProblems = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    const result = await fetchProblems(user.id)
    if (result.error) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    setProblems(result.data)
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError(null)
      const result = await fetchProblems(user.id)
      if (cancelled) return

      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        return
      }

      setProblems(result.data)
      setIsLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  const filteredProblems = useMemo(
    () => filterProblems(problems, search, difficultyFilter, topicFilter),
    [problems, search, difficultyFilter, topicFilter],
  )

  const metrics = useMemo(() => calculateMetrics(problems), [problems])
  const dailySolves = useMemo(() => buildDailySolves(problems), [problems])
  const topicDistribution = useMemo(() => buildTopicDistribution(problems), [problems])
  const difficultyBreakdown = useMemo(() => buildDifficultyBreakdown(problems), [problems])

  const topics = useMemo(() => {
    const set = new Set(problems.map((p) => p.topic ?? 'Uncategorized'))
    return Array.from(set).sort()
  }, [problems])

  const openCreateForm = useCallback(() => {
    setEditingProblem(null)
    setFormOpen(true)
  }, [])

  const openEditForm = useCallback((problem: DsaProblem) => {
    setEditingProblem(problem)
    setFormOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingProblem(null)
  }, [])

  const saveProblem = useCallback(
    async (input: DsaProblemInput): Promise<boolean> => {
      if (!user) return false

      setIsSaving(true)
      setError(null)

      const result = editingProblem
        ? await updateProblem(editingProblem.id, input)
        : await createProblem(user.id, input)

      setIsSaving(false)

      if (result.error) {
        setError(result.error.message)
        toast.error(result.error.message, editingProblem ? 'Update failed' : 'Create failed')
        return false
      }

      setProblems((prev) =>
        editingProblem
          ? prev.map((p) => (p.id === result.data.id ? result.data : p))
          : [result.data, ...prev],
      )

      toast.success(
        editingProblem ? 'Problem updated.' : 'Problem added to your tracker.',
        editingProblem ? 'Updated' : 'Added',
      )

      closeForm()
      return true
    },
    [user, editingProblem, closeForm],
  )

  const changeStatus = useCallback(async (id: string, status: ProblemStatus) => {
    setIsSaving(true)
    const result = await updateProblemStatus(id, status)
    setIsSaving(false)

    if (result.error) {
      setError(result.error.message)
      toast.error(result.error.message, 'Status update failed')
      return
    }

    setProblems((prev) => prev.map((p) => (p.id === id ? result.data : p)))
    toast.success('Problem status updated.')
  }, [])

  const removeProblem = useCallback(async (id: string) => {
    const result = await deleteProblem(id)
    if (result.error) {
      setError(result.error.message)
      toast.error(result.error.message, 'Delete failed')
      return
    }
    setProblems((prev) => prev.filter((p) => p.id !== id))
    toast.success('Problem removed from tracker.')
  }, [])

  return {
    problems: filteredProblems,
    allProblems: problems,
    isLoading,
    isSaving,
    error,
    viewMode,
    setViewMode,
    search,
    setSearch,
    difficultyFilter,
    setDifficultyFilter,
    topicFilter,
    setTopicFilter,
    topics,
    metrics,
    dailySolves,
    topicDistribution,
    difficultyBreakdown,
    formOpen,
    editingProblem,
    openCreateForm,
    openEditForm,
    closeForm,
    saveProblem,
    changeStatus,
    removeProblem,
    reload: loadProblems,
  }
}
