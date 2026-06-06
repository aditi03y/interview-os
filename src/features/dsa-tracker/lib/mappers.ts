import type { DsaProgressRow, DsaProgressInsert } from '@/types/database'
import type { DsaProblem, DsaProblemInput, ProblemStatus } from '../types'

export function mapRowToProblem(row: DsaProgressRow): DsaProblem {
  const status = (row.status ?? (row.solved ? 'solved' : 'pending')) as ProblemStatus

  return {
    id: row.id,
    userId: row.user_id,
    problemName: row.problem_title,
    platform: row.platform,
    difficulty: row.difficulty,
    topic: row.pattern,
    problemUrl: row.problem_url,
    attempts: row.attempts ?? 1,
    timeTakenMinutes: row.time_taken_minutes,
    status,
    notes: row.notes,
    solvedAt: row.solved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapInputToRow(
  userId: string,
  input: DsaProblemInput,
): DsaProgressInsert {
  const status = input.status ?? 'pending'
  const solved = status === 'solved'

  return {
    user_id: userId,
    problem_title: input.problemName.trim(),
    platform: input.platform ?? 'LeetCode',
    difficulty: input.difficulty,
    pattern: input.topic?.trim() || null,
    problem_url: input.problemUrl?.trim() || null,
    attempts: input.attempts ?? 1,
    time_taken_minutes: input.timeTakenMinutes ?? null,
    status,
    solved,
    notes: input.notes?.trim() || null,
    solved_at: solved ? new Date().toISOString() : null,
  }
}

export function mapUpdateToRow(input: Partial<DsaProblemInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}

  if (input.problemName !== undefined) row.problem_title = input.problemName.trim()
  if (input.platform !== undefined) row.platform = input.platform
  if (input.difficulty !== undefined) row.difficulty = input.difficulty
  if (input.topic !== undefined) row.pattern = input.topic?.trim() || null
  if (input.problemUrl !== undefined) row.problem_url = input.problemUrl?.trim() || null
  if (input.attempts !== undefined) row.attempts = input.attempts
  if (input.timeTakenMinutes !== undefined) row.time_taken_minutes = input.timeTakenMinutes
  if (input.notes !== undefined) row.notes = input.notes?.trim() || null

  if (input.status !== undefined) {
    row.status = input.status
    row.solved = input.status === 'solved'
    row.solved_at = input.status === 'solved' ? new Date().toISOString() : null
  }

  return row
}
