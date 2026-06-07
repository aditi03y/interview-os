import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { Difficulty } from '@/types'
import { getCurriculumDsaItem, DSA_CURRICULUM } from '../data/dsaCurriculum'

export { DSA_CURRICULUM }

export function getCurriculumDsaCountForDay(dayNumber: number): number {
  return DSA_CURRICULUM.filter((item) => item.dayNumber === dayNumber).length
}

export function getTotalCurriculumDsaCount(): number {
  return DSA_CURRICULUM.length
}

export function verifyCurriculumConsistency(): {
  valid: boolean
  roadmapDsaCount: number
  curriculumCount: number
  mismatches: string[]
} {
  const mismatches: string[] = []
  let roadmapDsaCount = 0

  for (const day of SDE_ROADMAP_15_DAYS) {
    roadmapDsaCount += day.dsa.length
    const curriculumForDay = DSA_CURRICULUM.filter((c) => c.dayNumber === day.day)

    if (curriculumForDay.length !== day.dsa.length) {
      mismatches.push(
        `Day ${day.day}: roadmap has ${day.dsa.length} DSA items, curriculum has ${curriculumForDay.length}`,
      )
    }

    for (const item of day.dsa) {
      const curriculumItem = getCurriculumDsaItem(item.id)
      if (!curriculumItem) {
        mismatches.push(`Missing curriculum entry for ${item.id}`)
        continue
      }
      if (curriculumItem.title !== item.title) {
        mismatches.push(`Title mismatch for ${item.id}`)
      }
    }
  }

  return {
    valid: mismatches.length === 0 && roadmapDsaCount === DSA_CURRICULUM.length,
    roadmapDsaCount,
    curriculumCount: DSA_CURRICULUM.length,
    mismatches,
  }
}

export async function syncDsaItemWithTracker(
  userId: string,
  roadmapItemId: string,
  checked: boolean,
): Promise<ApiResult<void>> {
  const item = getCurriculumDsaItem(roadmapItemId)
  if (!item) {
    return { data: null, error: { message: `Unknown curriculum item: ${roadmapItemId}` } }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('dsa_progress')
    .select('id, status')
    .eq('user_id', userId)
    .eq('roadmap_item_id', roadmapItemId)
    .maybeSingle()

  if (fetchError) {
    return { data: null, error: mapPostgrestError(fetchError) }
  }

  if (checked) {
    if (existing) {
      const { error } = await supabase
        .from('dsa_progress')
        .update({
          status: 'solved',
          solved: true,
          solved_at: new Date().toISOString(),
          study_day: item.dayNumber,
        })
        .eq('id', existing.id)

      if (error) return { data: null, error: mapPostgrestError(error) }
      return { data: undefined, error: null }
    }

    const { error } = await supabase.from('dsa_progress').insert({
      user_id: userId,
      problem_title: item.title,
      platform: item.platform,
      difficulty: item.difficulty as Difficulty,
      pattern: item.topic,
      problem_url: item.problemUrl,
      status: 'solved',
      solved: true,
      solved_at: new Date().toISOString(),
      roadmap_item_id: roadmapItemId,
      study_day: item.dayNumber,
    })

    if (error) return { data: null, error: mapPostgrestError(error) }
    return { data: undefined, error: null }
  }

  if (existing && existing.status === 'solved') {
    const { error } = await supabase
      .from('dsa_progress')
      .update({ status: 'pending', solved: false, solved_at: null })
      .eq('id', existing.id)

    if (error) return { data: null, error: mapPostgrestError(error) }
  }

  return { data: undefined, error: null }
}

export async function seedMissingCurriculumProblems(userId: string): Promise<number> {
  let created = 0

  for (const item of DSA_CURRICULUM) {
    const { data: existing } = await supabase
      .from('dsa_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('roadmap_item_id', item.id)
      .maybeSingle()

    if (existing) continue

    const { error } = await supabase.from('dsa_progress').insert({
      user_id: userId,
      problem_title: item.title,
      platform: item.platform,
      difficulty: item.difficulty as Difficulty,
      pattern: item.topic,
      problem_url: item.problemUrl,
      status: 'pending',
      solved: false,
      roadmap_item_id: item.id,
      study_day: item.dayNumber,
    })

    if (!error) created += 1
  }

  return created
}
