import type { ApiResult } from '@/types'
import type { StudyDayProgressRow, StudyDayProgressInsert, StudyDayProgressUpdate } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { CompletedItems, DayProgress } from '../types'
import { parseCompletedItems } from '../lib/progress'

function mapRowToDayProgress(row: StudyDayProgressRow): DayProgress {
  return {
    id: row.id,
    userId: row.user_id,
    dayNumber: row.day_number,
    notes: row.notes,
    timeSpentMinutes: row.time_spent_minutes,
    completedItems: parseCompletedItems(row.completed_items),
    status: row.status,
    progressPercent: row.progress_percent,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchStudyDayProgress(
  userId: string,
): Promise<ApiResult<DayProgress[]>> {
  const { data, error } = await supabase
    .from('study_day_progress')
    .select('*')
    .eq('user_id', userId)
    .order('day_number', { ascending: true })

  if (error) {
    return { data: null, error: mapPostgrestError(error) }
  }

  return { data: data.map(mapRowToDayProgress), error: null }
}

export async function upsertStudyDayProgress(
  userId: string,
  dayNumber: number,
  payload: {
    notes?: string
    timeSpentMinutes?: number
    completedItems?: CompletedItems
    progressPercent?: number
    status?: StudyDayProgressUpdate['status']
    completedAt?: string | null
  },
): Promise<ApiResult<DayProgress>> {
  const row = {
    user_id: userId,
    day_number: dayNumber,
    ...(payload.notes !== undefined && { notes: payload.notes }),
    ...(payload.timeSpentMinutes !== undefined && {
      time_spent_minutes: payload.timeSpentMinutes,
    }),
    ...(payload.completedItems !== undefined && {
      completed_items: payload.completedItems,
    }),
    ...(payload.progressPercent !== undefined && {
      progress_percent: payload.progressPercent,
    }),
    ...(payload.status !== undefined && { status: payload.status }),
    ...(payload.completedAt !== undefined && { completed_at: payload.completedAt }),
  }

  const { data, error } = await supabase
    .from('study_day_progress')
    .upsert(row as StudyDayProgressInsert, { onConflict: 'user_id,day_number' })
    .select('*')
    .single()

  if (error) {
    return { data: null, error: mapPostgrestError(error) }
  }

  return { data: mapRowToDayProgress(data), error: null }
}
