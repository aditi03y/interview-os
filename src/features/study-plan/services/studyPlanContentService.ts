import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { PromptTemplate, ResourceLink, RoadmapDay, RoadmapItem, StudySection } from '../types'

export interface StudyPlanMeta {
  id: string
  slug: string
  title: string
  description: string | null
}

interface ItemResourceRow {
  id: string
  title: string
  url: string
  resource_type: string | null
  sort_order: number
}

interface ItemRow {
  id: string
  section: StudySection
  title: string
  description: string | null
  sort_order: number
  leetcode_slug: string | null
  difficulty: string | null
  topic: string | null
  study_plan_item_resources: ItemResourceRow[] | null
}

interface PromptRow {
  id: string
  title: string
  prompt_text: string
  sort_order: number
}

interface DayRow {
  id: string
  day_number: number
  title: string
  subtitle: string
  estimated_minutes: number
  sort_order: number
  study_plan_items: ItemRow[] | null
  study_plan_prompts: PromptRow[] | null
}

interface PlanRow {
  id: string
  slug: string
  title: string
  description: string | null
  study_plan_days: DayRow[] | null
}

function mapResource(row: ItemResourceRow): ResourceLink {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    type: (row.resource_type as ResourceLink['type']) ?? undefined,
  }
}

function mapItem(row: ItemRow): RoadmapItem {
  const resources = (row.study_plan_item_resources ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapResource)

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    resources: resources.length ? resources : undefined,
  }
}

function mapDay(row: DayRow): RoadmapDay {
  const items = (row.study_plan_items ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)

  const theory = items.filter((i) => i.section === 'theory').map(mapItem)
  const dsa = items.filter((i) => i.section === 'dsa').map(mapItem)
  const assignment = items.filter((i) => i.section === 'assignment').map(mapItem)

  const promptTemplates: PromptTemplate[] = (row.study_plan_prompts ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      id: p.id,
      title: p.title,
      prompt: p.prompt_text,
    }))

  return {
    day: row.day_number,
    title: row.title,
    subtitle: row.subtitle,
    estimatedMinutes: row.estimated_minutes,
    theory,
    dsa,
    assignment,
    promptTemplates,
  }
}

function mapPlanRow(row: PlanRow): { meta: StudyPlanMeta; days: RoadmapDay[] } {
  const days = (row.study_plan_days ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.day_number - b.day_number)
    .map(mapDay)

  return {
    meta: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
    },
    days,
  }
}

const PLAN_SELECT = `
  id,
  slug,
  title,
  description,
  study_plan_days (
    id,
    day_number,
    title,
    subtitle,
    estimated_minutes,
    sort_order,
    study_plan_items (
      id,
      section,
      title,
      description,
      sort_order,
      leetcode_slug,
      difficulty,
      topic,
      study_plan_item_resources (
        id,
        title,
        url,
        resource_type,
        sort_order
      )
    ),
    study_plan_prompts (
      id,
      title,
      prompt_text,
      sort_order
    )
  )
`

export async function fetchActiveStudyPlan(
  slug = 'default',
): Promise<ApiResult<{ meta: StudyPlanMeta; days: RoadmapDay[] }>> {
  const { data, error } = await supabase
    .from('study_plans')
    .select(PLAN_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) return { data: null, error: mapPostgrestError(error) }
  if (!data) {
    return {
      data: null,
      error: { message: 'No active study plan found. Seed content from the admin curriculum console.', code: 'NO_PLAN' },
    }
  }

  return { data: mapPlanRow(data as PlanRow), error: null }
}

export function getDayTitleMap(days: RoadmapDay[]): Map<number, string> {
  return new Map(days.map((day) => [day.day, day.title]))
}
