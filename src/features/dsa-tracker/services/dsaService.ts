import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { DsaProgressInsert, DsaProgressUpdate } from '@/types/database'
import type { DsaProblem, DsaProblemInput, ProblemStatus } from '../types'
import { mapInputToRow, mapRowToProblem, mapUpdateToRow } from '../lib/mappers'

export async function fetchProblems(userId: string): Promise<ApiResult<DsaProblem[]>> {
  const { data, error } = await supabase
    .from('dsa_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapRowToProblem), error: null }
}

export async function createProblem(
  userId: string,
  input: DsaProblemInput,
): Promise<ApiResult<DsaProblem>> {
  const row = mapInputToRow(userId, input) as DsaProgressInsert

  const { data, error } = await supabase.from('dsa_progress').insert(row).select('*').single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapRowToProblem(data), error: null }
}

export async function updateProblem(
  id: string,
  input: Partial<DsaProblemInput>,
): Promise<ApiResult<DsaProblem>> {
  const row = mapUpdateToRow(input) as DsaProgressUpdate

  const { data, error } = await supabase
    .from('dsa_progress')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapRowToProblem(data), error: null }
}

export async function updateProblemStatus(
  id: string,
  status: ProblemStatus,
): Promise<ApiResult<DsaProblem>> {
  return updateProblem(id, { status })
}

export async function deleteProblem(id: string): Promise<ApiResult<void>> {
  const { error } = await supabase.from('dsa_progress').delete().eq('id', id)
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}
