import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { Json } from '@/types/database'
import type { ApiResult } from '@/types'
import type {
  AttemptViolationSummary,
  TestViolation,
  ViolationEventType,
  ViolationSummary,
} from '../types'

interface ViolationRow {
  id: string
  user_id: string
  test_attempt_id: string | null
  event_type: string
  occurred_at: string
  metadata: Json
}

function mapMetadata(raw: Json): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

function mapViolationRow(row: ViolationRow): TestViolation {
  return {
    id: row.id,
    userId: row.user_id,
    testAttemptId: row.test_attempt_id,
    eventType: row.event_type as ViolationEventType,
    occurredAt: row.occurred_at,
    metadata: mapMetadata(row.metadata),
  }
}

const EMPTY_BY_TYPE = (): ViolationSummary['byType'] => ({
  tab_switch: 0,
  window_blur: 0,
  copy_attempt: 0,
  paste_attempt: 0,
  idle_time: 0,
  fullscreen_exit: 0,
})

export async function logViolation(
  userId: string,
  eventType: ViolationEventType,
  testAttemptId?: string | null,
  metadata?: Record<string, unknown>,
): Promise<ApiResult<TestViolation>> {
  const { data, error } = await supabase
    .from('test_violations')
    .insert({
      user_id: userId,
      test_attempt_id: testAttemptId ?? null,
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      metadata: (metadata ?? {}) as Json,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapViolationRow(data), error: null }
}

export async function fetchViolations(
  userId: string,
  options?: {
    attemptId?: string
    eventType?: ViolationEventType
    limit?: number
  },
): Promise<ApiResult<TestViolation[]>> {
  let query = supabase
    .from('test_violations')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })

  if (options?.attemptId) {
    query = query.eq('test_attempt_id', options.attemptId)
  }
  if (options?.eventType) {
    query = query.eq('event_type', options.eventType)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapViolationRow), error: null }
}

export async function fetchViolationSummary(userId: string): Promise<ApiResult<ViolationSummary>> {
  const { data, error } = await supabase
    .from('test_violations')
    .select('event_type, occurred_at, test_attempt_id')
    .eq('user_id', userId)

  if (error) return { data: null, error: mapPostgrestError(error) }

  const byType = EMPTY_BY_TYPE()
  const attemptIds = new Set<string>()
  const dayAgo = Date.now() - 86_400_000
  let last24Hours = 0

  for (const row of data) {
    const type = row.event_type as ViolationEventType
    if (type in byType) byType[type] += 1
    if (row.test_attempt_id) attemptIds.add(row.test_attempt_id)
    if (new Date(row.occurred_at).getTime() >= dayAgo) last24Hours += 1
  }

  return {
    data: {
      total: data.length,
      byType,
      last24Hours,
      flaggedAttempts: attemptIds.size,
    },
    error: null,
  }
}

export async function fetchAttemptViolationSummaries(
  userId: string,
): Promise<ApiResult<AttemptViolationSummary[]>> {
  const { data, error } = await supabase
    .from('test_violations')
    .select('test_attempt_id, event_type, occurred_at, test_attempts(test_definitions(title))')
    .eq('user_id', userId)
    .not('test_attempt_id', 'is', null)
    .order('occurred_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }

  const grouped = new Map<string, AttemptViolationSummary>()

  for (const row of data) {
    const attemptId = row.test_attempt_id as string
    const existing = grouped.get(attemptId)
    const type = row.event_type as ViolationEventType

    const attempts = row.test_attempts as
      | { test_definitions: { title: string } | { title: string }[] | null }
      | { test_definitions: { title: string } | { title: string }[] | null }[]
      | null
    const attempt = Array.isArray(attempts) ? attempts[0] : attempts
    const defs = attempt?.test_definitions
    const def = Array.isArray(defs) ? defs[0] : defs
    const title = def?.title ?? 'Unknown Test'

    if (!existing) {
      grouped.set(attemptId, {
        attemptId,
        attemptTitle: title,
        total: 1,
        byType: { [type]: 1 },
        lastOccurredAt: row.occurred_at,
      })
    } else {
      existing.total += 1
      existing.byType[type] = (existing.byType[type] ?? 0) + 1
      if (!existing.lastOccurredAt || row.occurred_at > existing.lastOccurredAt) {
        existing.lastOccurredAt = row.occurred_at
      }
    }
  }

  return {
    data: Array.from(grouped.values()).sort((a, b) => b.total - a.total),
    error: null,
  }
}

export async function fetchViolationCountForAttempt(
  userId: string,
  attemptId: string,
): Promise<ApiResult<number>> {
  const { count, error } = await supabase
    .from('test_violations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('test_attempt_id', attemptId)

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: count ?? 0, error: null }
}
