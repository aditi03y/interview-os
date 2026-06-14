import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import {
  fetchActiveStudyPlan,
  type StudyPlanMeta,
} from '@/features/study-plan/services/studyPlanContentService'
import type { ResourceLink, RoadmapDay, StudySection } from '@/features/study-plan/types'

export interface AdminStudyPlan extends StudyPlanMeta {
  days: RoadmapDay[]
}

export interface DayInput {
  dayNumber: number
  title: string
  subtitle?: string
  estimatedMinutes?: number
  sortOrder?: number
}

export interface ItemInput {
  id: string
  section: StudySection
  title: string
  description?: string | null
  sortOrder?: number
  leetcodeSlug?: string | null
  difficulty?: string | null
  topic?: string | null
}

export interface ResourceInput {
  id: string
  title: string
  url: string
  resourceType?: ResourceLink['type'] | null
  sortOrder?: number
}

export interface PromptInput {
  id: string
  title: string
  promptText: string
  sortOrder?: number
}

async function getDefaultPlanId(): Promise<ApiResult<string>> {
  const { data, error } = await supabase
    .from('study_plans')
    .select('id')
    .eq('slug', 'default')
    .maybeSingle()

  if (error) return { data: null, error: mapPostgrestError(error) }
  if (!data) return { data: null, error: { message: 'Default study plan not found.', code: 'NO_PLAN' } }
  return { data: data.id, error: null }
}

async function getDayId(planId: string, dayNumber: number): Promise<ApiResult<string>> {
  const { data, error } = await supabase
    .from('study_plan_days')
    .select('id')
    .eq('plan_id', planId)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (error) return { data: null, error: mapPostgrestError(error) }
  if (!data) return { data: null, error: { message: `Day ${dayNumber} not found.`, code: 'NOT_FOUND' } }
  return { data: data.id, error: null }
}

export async function fetchCurriculumAdmin(): Promise<ApiResult<AdminStudyPlan>> {
  const result = await fetchActiveStudyPlan('default')
  if (result.error || !result.data) return { data: null, error: result.error ?? { message: 'Failed to load plan.' } }

  return {
    data: {
      ...result.data.meta,
      days: result.data.days,
    },
    error: null,
  }
}

export async function updatePlanMeta(input: {
  title: string
  description?: string | null
}): Promise<ApiResult<void>> {
  const { error } = await supabase
    .from('study_plans')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
    .eq('slug', 'default')

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function upsertStudyDay(input: DayInput): Promise<ApiResult<void>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const { error } = await supabase.from('study_plan_days').upsert(
    {
      plan_id: planResult.data,
      day_number: input.dayNumber,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? '',
      estimated_minutes: input.estimatedMinutes ?? 180,
      sort_order: input.sortOrder ?? input.dayNumber,
    },
    { onConflict: 'plan_id,day_number' },
  )

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function deleteStudyDay(dayNumber: number): Promise<ApiResult<void>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const { error } = await supabase.rpc('delete_study_plan_day_and_renumber', {
    p_plan_id: planResult.data,
    p_day_number: dayNumber,
  })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function renumberStudyPlanDays(): Promise<ApiResult<number>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const { data, error } = await supabase.rpc('renumber_study_plan_days', {
    p_plan_id: planResult.data,
  })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data ?? 0, error: null }
}

export async function renameStudyDayTitle(
  dayNumber: number,
  title: string,
): Promise<ApiResult<void>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('study_plan_days')
    .select('subtitle, estimated_minutes, sort_order')
    .eq('plan_id', planResult.data)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (fetchError) return { data: null, error: mapPostgrestError(fetchError) }
  if (!existing) {
    return { data: null, error: { message: `Day ${dayNumber} not found.`, code: 'NOT_FOUND' } }
  }

  return upsertStudyDay({
    dayNumber,
    title: title.trim(),
    subtitle: existing.subtitle,
    estimatedMinutes: existing.estimated_minutes,
    sortOrder: existing.sort_order,
  })
}

export async function upsertStudyItem(
  dayNumber: number,
  input: ItemInput,
): Promise<ApiResult<void>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const dayResult = await getDayId(planResult.data, dayNumber)
  if (dayResult.error || !dayResult.data) {
    return { data: null, error: dayResult.error ?? { message: 'Day not found.' } }
  }

  const { error } = await supabase.from('study_plan_items').upsert(
    {
      id: input.id.trim(),
      day_id: dayResult.data,
      section: input.section,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      leetcode_slug: input.leetcodeSlug ?? null,
      difficulty: input.difficulty ?? null,
      topic: input.topic ?? null,
    },
    { onConflict: 'id' },
  )

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function deleteStudyItem(itemId: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('study_plan_items').delete().eq('id', itemId)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function upsertItemResource(
  itemId: string,
  input: ResourceInput,
): Promise<ApiResult<void>> {
  const { error } = await supabase.from('study_plan_item_resources').upsert(
    {
      id: input.id.trim(),
      item_id: itemId,
      title: input.title.trim(),
      url: input.url.trim(),
      resource_type: input.resourceType ?? null,
      sort_order: input.sortOrder ?? 0,
    },
    { onConflict: 'id' },
  )

  if (error) return { data: null, error: mapPostgrestError(error) }

  await supabase.from('resource_catalog').upsert({
    id: input.id.trim(),
    title: input.title.trim(),
    url: input.url.trim(),
    provider: inferProvider(input.url),
    category: input.resourceType ?? 'general',
    status: 'active',
  })

  return { data: undefined, error: null }
}

export async function deleteItemResource(resourceId: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('study_plan_item_resources').delete().eq('id', resourceId)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function upsertStudyPrompt(
  dayNumber: number,
  input: PromptInput,
): Promise<ApiResult<void>> {
  const planResult = await getDefaultPlanId()
  if (planResult.error || !planResult.data) {
    return { data: null, error: planResult.error ?? { message: 'Plan not found.' } }
  }

  const dayResult = await getDayId(planResult.data, dayNumber)
  if (dayResult.error || !dayResult.data) {
    return { data: null, error: dayResult.error ?? { message: 'Day not found.' } }
  }

  const { error } = await supabase.from('study_plan_prompts').upsert(
    {
      id: input.id.trim(),
      day_id: dayResult.data,
      title: input.title.trim(),
      prompt_text: input.promptText,
      sort_order: input.sortOrder ?? 0,
    },
    { onConflict: 'id' },
  )

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function deleteStudyPrompt(promptId: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('study_plan_prompts').delete().eq('id', promptId)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

function inferProvider(url: string): string {
  if (url.includes('leetcode.com')) return 'leetcode'
  if (url.includes('geeksforgeeks.org')) return 'geeksforgeeks'
  if (url.includes('neetcode.io')) return 'neetcode'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'other'
}
