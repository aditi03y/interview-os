import type { RoadmapDay } from '../types'
import { loadResourceCatalog } from './resourceRegistry'
import { fetchActiveStudyPlan, type StudyPlanMeta } from '../services/studyPlanContentService'

export interface CachedStudyPlan {
  meta: StudyPlanMeta
  days: RoadmapDay[]
}

let cached: CachedStudyPlan | null = null
let inflight: Promise<CachedStudyPlan | null> | null = null

export function invalidateStudyPlanContentCache(): void {
  cached = null
  inflight = null
}

export async function loadStudyPlanContent(force = false): Promise<CachedStudyPlan | null> {
  if (!force && cached) return cached
  if (!force && inflight) return inflight

  inflight = (async () => {
    const [result] = await Promise.all([fetchActiveStudyPlan(), loadResourceCatalog()])
    if (result.error || !result.data) {
      inflight = null
      return null
    }
    cached = result.data
    inflight = null
    return cached
  })()

  return inflight
}

export function getCachedStudyPlanDays(): RoadmapDay[] {
  return cached?.days ?? []
}

export function getCachedStudyPlanMeta(): StudyPlanMeta | null {
  return cached?.meta ?? null
}

/** Test helper — seed in-memory plan without hitting Supabase */
export function setStudyPlanContentForTests(plan: CachedStudyPlan): void {
  cached = plan
  inflight = null
}
