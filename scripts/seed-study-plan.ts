/**
 * One-time seed: loads roadmap-days.ts content into Supabase study plan tables.
 *
 * Usage:
 *   npx tsx scripts/seed-study-plan.ts
 *
 * Requires .env with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (or VITE_SUPABASE_ANON_KEY + admin session — service role recommended).
 */
import { createClient } from '@supabase/supabase-js'
import { SDE_ROADMAP_15_DAYS } from '../src/features/study-plan/data/roadmap-days'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key).')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data: plan, error: planError } = await supabase
    .from('study_plans')
    .select('id')
    .eq('slug', 'default')
    .single()

  if (planError || !plan) {
    console.error('Default study plan not found. Apply migration 20250607000000_study_plan_config.sql first.')
    process.exit(1)
  }

  const planId = plan.id

  await supabase.from('study_plan_days').delete().eq('plan_id', planId)

  await supabase
    .from('study_plans')
    .update({
      title: 'SDE Intern Roadmap',
      description: '15-day structured path — arrays through DP, assignments, and mock interview prep.',
    })
    .eq('id', planId)

  for (const day of SDE_ROADMAP_15_DAYS) {
    const { data: dayRow, error: dayError } = await supabase
      .from('study_plan_days')
      .insert({
        plan_id: planId,
        day_number: day.day,
        title: day.title,
        subtitle: day.subtitle,
        estimated_minutes: day.estimatedMinutes,
        sort_order: day.day,
      })
      .select('id')
      .single()

    if (dayError || !dayRow) {
      console.error(`Day ${day.day} failed:`, dayError?.message)
      process.exit(1)
    }

    const dayId = dayRow.id

    for (const section of ['theory', 'dsa', 'assignment'] as const) {
      for (let index = 0; index < day[section].length; index++) {
        const item = day[section][index]!
        const { error: itemError } = await supabase.from('study_plan_items').insert({
          id: item.id,
          day_id: dayId,
          section,
          title: item.title,
          description: item.description ?? null,
          sort_order: index,
        })
        if (itemError) {
          console.error(`Item ${item.id} failed:`, itemError.message)
          process.exit(1)
        }

        for (let rIndex = 0; rIndex < (item.resources?.length ?? 0); rIndex++) {
          const resource = item.resources![rIndex]!
          const { error: resourceError } = await supabase.from('study_plan_item_resources').insert({
            id: resource.id,
            item_id: item.id,
            title: resource.title,
            url: resource.url,
            resource_type: resource.type ?? null,
            sort_order: rIndex,
          })
          if (resourceError) {
            console.error(`Resource ${resource.id} failed:`, resourceError.message)
            process.exit(1)
          }

          await supabase.from('resource_catalog').upsert({
            id: resource.id,
            title: resource.title,
            url: resource.url,
            provider: inferProvider(resource.url),
            category: resource.type ?? section,
            status: 'active',
          })
        }
      }
    }

    for (let index = 0; index < day.promptTemplates.length; index++) {
      const prompt = day.promptTemplates[index]!
      const { error: promptError } = await supabase.from('study_plan_prompts').insert({
        id: prompt.id,
        day_id: dayId,
        title: prompt.title,
        prompt_text: prompt.prompt,
        sort_order: index,
      })
      if (promptError) {
        console.error(`Prompt ${prompt.id} failed:`, promptError.message)
        process.exit(1)
      }
    }

    console.log(`Seeded day ${day.day}: ${day.title}`)
  }

  console.log(`Done — seeded ${SDE_ROADMAP_15_DAYS.length} days.`)
}

function inferProvider(url: string): string {
  if (url.includes('leetcode.com')) return 'leetcode'
  if (url.includes('geeksforgeeks.org')) return 'geeksforgeeks'
  if (url.includes('neetcode.io')) return 'neetcode'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'other'
}

void main()
