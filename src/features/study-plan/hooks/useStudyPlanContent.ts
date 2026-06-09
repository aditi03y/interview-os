import { useCallback, useEffect, useState } from 'react'
import {
  invalidateStudyPlanContentCache,
  loadStudyPlanContent,
  type CachedStudyPlan,
} from '../lib/studyPlanContentCache'

export function useStudyPlanContent() {
  const [plan, setPlan] = useState<CachedStudyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (force = true) => {
    setLoading(true)
    setError(null)
    if (force) invalidateStudyPlanContentCache()
    const data = await loadStudyPlanContent(force)
    if (!data) {
      setError('Study plan content is empty. Run the seed script or add days in the admin curriculum console.')
      setPlan(null)
    } else {
      setPlan(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload(false)
  }, [reload])

  return {
    meta: plan?.meta ?? null,
    days: plan?.days ?? [],
    loading,
    error,
    reload,
  }
}
