import type { Difficulty } from '@/types'

export type ProblemStatus = 'pending' | 'in_progress' | 'solved' | 'revisit'

export type ViewMode = 'table' | 'kanban'

export interface DsaProblem {
  id: string
  userId: string
  problemName: string
  platform: string
  difficulty: Difficulty
  topic: string | null
  problemUrl: string | null
  attempts: number
  timeTakenMinutes: number | null
  status: ProblemStatus
  notes: string | null
  solvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DsaProblemInput {
  problemName: string
  platform?: string
  difficulty: Difficulty
  topic?: string | null
  problemUrl?: string | null
  attempts?: number
  timeTakenMinutes?: number | null
  status?: ProblemStatus
  notes?: string | null
}

export interface DsaMetrics {
  total: number
  solvedCount: number
  successRate: number
  averageSolveTimeMinutes: number
  inProgressCount: number
  pendingCount: number
}

export interface DailySolvePoint {
  date: string
  label: string
  count: number
}

export interface TopicDistributionPoint {
  topic: string
  count: number
}

export interface DifficultyBreakdownPoint {
  difficulty: Difficulty
  count: number
  solved: number
}

export const PROBLEM_STATUSES: ProblemStatus[] = [
  'pending',
  'in_progress',
  'solved',
  'revisit',
]

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  solved: 'Solved',
  revisit: 'Revisit',
}

export const KANBAN_COLUMNS: ProblemStatus[] = [
  'pending',
  'in_progress',
  'solved',
  'revisit',
]

export const DSA_TOPICS = [
  'Arrays',
  'Hash Map',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Queue',
  'Binary Search',
  'Linked List',
  'Trees',
  'Graphs',
  'Heap',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Trie',
  'Union Find',
  'Sorting',
  'Math',
  'Bit Manipulation',
] as const

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

export const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'GFG', 'CodeStudio', 'Other'] as const
