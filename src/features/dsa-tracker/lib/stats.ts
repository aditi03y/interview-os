import type {
  DailySolvePoint,
  DifficultyBreakdownPoint,
  DsaMetrics,
  DsaProblem,
  TopicDistributionPoint,
} from '../types'
import type { Difficulty } from '@/types'

export function calculateMetrics(problems: DsaProblem[]): DsaMetrics {
  const total = problems.length
  const solved = problems.filter((p) => p.status === 'solved')
  const solvedCount = solved.length

  const successRate = total === 0 ? 0 : Math.round((solvedCount / total) * 100)

  const times = solved
    .map((p) => p.timeTakenMinutes)
    .filter((t): t is number => t !== null && t > 0)

  const averageSolveTimeMinutes =
    times.length === 0 ? 0 : Math.round(times.reduce((a, b) => a + b, 0) / times.length)

  return {
    total,
    solvedCount,
    successRate,
    averageSolveTimeMinutes,
    inProgressCount: problems.filter((p) => p.status === 'in_progress').length,
    pendingCount: problems.filter((p) => p.status === 'pending').length,
  }
}

export function buildDailySolves(problems: DsaProblem[], days = 14): DailySolvePoint[] {
  const solved = problems.filter((p) => p.status === 'solved' && p.solvedAt)

  const counts = new Map<string, number>()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    counts.set(key, 0)
  }

  for (const p of solved) {
    if (!p.solvedAt) continue
    const key = p.solvedAt.slice(0, 10)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({
    date,
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count,
  }))
}

export function buildTopicDistribution(problems: DsaProblem[]): TopicDistributionPoint[] {
  const map = new Map<string, number>()

  for (const p of problems) {
    const topic = p.topic?.trim() || 'Uncategorized'
    map.set(topic, (map.get(topic) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export function buildDifficultyBreakdown(problems: DsaProblem[]): DifficultyBreakdownPoint[] {
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']

  return difficulties.map((difficulty) => {
    const subset = problems.filter((p) => p.difficulty === difficulty)
    return {
      difficulty,
      count: subset.length,
      solved: subset.filter((p) => p.status === 'solved').length,
    }
  })
}

export function filterProblems(
  problems: DsaProblem[],
  search: string,
  difficultyFilter: Difficulty | 'all',
  topicFilter: string,
): DsaProblem[] {
  const q = search.trim().toLowerCase()

  return problems.filter((p) => {
    if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false
    if (topicFilter !== 'all' && (p.topic ?? 'Uncategorized') !== topicFilter) return false

    if (!q) return true

    const haystack = [
      p.problemName,
      p.topic ?? '',
      p.platform,
      p.notes ?? '',
      p.status,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
