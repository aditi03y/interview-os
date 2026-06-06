import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import type {
  AnalyticsSnapshot,
  HeatmapCell,
  RadarPoint,
  RawAnalyticsData,
  TopicInsight,
  TrendPoint,
} from '../types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TREND_DAYS = 14
const HEATMAP_WEEKS = 12

export function computeAnalytics(data: RawAnalyticsData): AnalyticsSnapshot {
  const topicScores = buildTopicScores(data)
  const sorted = [...topicScores].sort((a, b) => a.score - b.score)
  const weakTopics = sorted.filter((t) => t.score < 55).slice(0, 5)
  const strongTopics = [...sorted].reverse().filter((t) => t.score >= 70).slice(0, 5)

  const completionRate = computeCompletionRate(data)
  const averageTestScore = computeAverageTestScore(data)
  const dsaSuccessRate = computeDsaSuccessRate(data)
  const violationCount = data.violations.length
  const totalStudyMinutes = data.studyProgress.reduce((s, d) => s + d.timeSpentMinutes, 0)
  const dsaSolvedCount = data.dsaProblems.filter((p) => p.status === 'solved').length
  const testsCompleted = data.testAttempts.filter(
    (a) => a.status === 'completed' || a.status === 'auto_submitted',
  ).length

  const learningVelocity = computeLearningVelocity(data)
  const confidenceScore = computeConfidenceScore(
    data,
    averageTestScore,
    violationCount,
    topicScores,
  )
  const readinessScore = computeReadinessScore({
    averageTestScore,
    dsaSuccessRate,
    completionRate,
    learningVelocity,
    violationCount,
    confidenceScore,
  })

  return {
    weakTopics,
    strongTopics,
    readinessScore,
    learningVelocity,
    confidenceScore,
    completionRate,
    totalStudyMinutes,
    averageTestScore,
    dsaSuccessRate,
    violationCount,
    dsaSolvedCount,
    testsCompleted,
    trends: {
      studyTime: buildStudyTimeTrend(data),
      testScores: buildTestScoreTrend(data),
      dsaSolves: buildDsaSolveTrend(data),
      violations: buildViolationTrend(data),
    },
    topicRadar: buildRadarData(topicScores),
    heatmap: buildHeatmap(data),
  }
}

function buildTopicScores(data: RawAnalyticsData): TopicInsight[] {
  const map = new Map<string, { total: number; weighted: number; source: TopicInsight['source'] }>()

  for (const problem of data.dsaProblems) {
    const topic = problem.topic?.trim() || 'Uncategorized'
    const entry = map.get(topic) ?? { total: 0, weighted: 0, source: 'dsa' as const }
    entry.total += 1

    let points = 0
    if (problem.status === 'solved') {
      points = 100
      if (problem.difficulty === 'Medium') points = 90
      if (problem.difficulty === 'Hard') points = 85
      if (problem.attempts > 3) points -= 15
      if (problem.attempts === 1) points += 10
    } else if (problem.status === 'in_progress') {
      points = 35
    } else if (problem.status === 'revisit') {
      points = 20
    }

    entry.weighted += Math.max(0, Math.min(100, points))
    map.set(topic, entry)
  }

  for (const day of data.studyProgress) {
    const topic = day.dayTitle
    const existing = map.get(topic)
    const studyScore = day.progressPercent

    if (existing) {
      const avg = (existing.weighted / existing.total + studyScore) / 2
      map.set(topic, {
        total: existing.total + 1,
        weighted: avg * (existing.total + 1),
        source: 'mixed',
      })
    } else {
      map.set(topic, { total: 1, weighted: studyScore, source: 'study' })
    }
  }

  const results: TopicInsight[] = []
  for (const [topic, entry] of map) {
    const score = entry.total > 0 ? Math.round(entry.weighted / entry.total) : 0
    results.push({
      topic,
      score,
      source: entry.source,
      detail:
        entry.source === 'dsa'
          ? `${entry.total} problem${entry.total === 1 ? '' : 's'} tracked`
          : entry.source === 'study'
            ? 'Study plan progress'
            : 'DSA + study plan combined',
    })
  }

  if (!results.length) {
    return SDE_ROADMAP_15_DAYS.slice(0, 6).map((day) => ({
      topic: day.title,
      score: 0,
      source: 'study' as const,
      detail: 'Not started yet',
    }))
  }

  return results
}

function computeCompletionRate(data: RawAnalyticsData): number {
  const totalDays = SDE_ROADMAP_15_DAYS.length
  if (!totalDays) return 0

  const completed = data.studyProgress.filter((d) => d.status === 'completed').length
  const partial = data.studyProgress.reduce((s, d) => s + d.progressPercent, 0)
  const avgPartial = data.studyProgress.length
    ? partial / data.studyProgress.length
    : 0

  return Math.round((completed / totalDays) * 60 + avgPartial * 0.4)
}

function computeAverageTestScore(data: RawAnalyticsData): number {
  const completed = data.testAttempts.filter(
    (a) =>
      (a.status === 'completed' || a.status === 'auto_submitted') &&
      a.score != null &&
      a.maxScore > 0,
  )
  if (!completed.length) return 0

  const percentages = completed.map((a) => (Number(a.score) / Number(a.maxScore)) * 100)
  return Math.round(percentages.reduce((s, p) => s + p, 0) / percentages.length)
}

function computeDsaSuccessRate(data: RawAnalyticsData): number {
  if (!data.dsaProblems.length) return 0
  const solved = data.dsaProblems.filter((p) => p.status === 'solved').length
  return Math.round((solved / data.dsaProblems.length) * 100)
}

function computeLearningVelocity(data: RawAnalyticsData): number {
  const now = Date.now()
  const weekMs = 7 * 86_400_000

  const recent = countActivity(data, now - weekMs, now)
  const prior = countActivity(data, now - 2 * weekMs, now - weekMs)

  if (prior === 0) return recent > 0 ? 100 : 0
  return Math.round(((recent - prior) / prior) * 100)
}

function countActivity(data: RawAnalyticsData, from: number, to: number): number {
  let score = 0

  for (const p of data.dsaProblems) {
    if (p.status !== 'solved' || !p.solvedAt) continue
    const t = new Date(p.solvedAt).getTime()
    if (t >= from && t < to) score += 2
  }

  for (const day of data.studyProgress) {
    const t = new Date(day.updatedAt).getTime()
    if (t >= from && t < to) score += Math.min(3, day.timeSpentMinutes / 30)
  }

  for (const attempt of data.testAttempts) {
    if (!attempt.completedAt) continue
    const t = new Date(attempt.completedAt).getTime()
    if (t >= from && t < to) score += 3
  }

  return Math.round(score)
}

function computeConfidenceScore(
  data: RawAnalyticsData,
  averageTestScore: number,
  violationCount: number,
  topicScores: TopicInsight[],
): number {
  const completed = data.testAttempts.filter(
    (a) =>
      (a.status === 'completed' || a.status === 'auto_submitted') &&
      a.score != null &&
      a.maxScore > 0,
  )

  let variancePenalty = 0
  if (completed.length >= 2) {
    const pcts = completed.map((a) => (Number(a.score!) / Number(a.maxScore)) * 100)
    const mean = pcts.reduce((s, v) => s + v, 0) / pcts.length
    const variance = pcts.reduce((s, v) => s + (v - mean) ** 2, 0) / pcts.length
    variancePenalty = Math.min(20, Math.round(Math.sqrt(variance) / 2))
  }

  const strongRatio =
    topicScores.length > 0
      ? topicScores.filter((t) => t.score >= 70).length / topicScores.length
      : 0

  const violationPenalty = Math.min(25, violationCount * 3)
  const base = averageTestScore * 0.4 + strongRatio * 100 * 0.35 + computeDsaSuccessRate(data) * 0.25

  return Math.max(0, Math.min(100, Math.round(base - variancePenalty - violationPenalty)))
}

function computeReadinessScore(input: {
  averageTestScore: number
  dsaSuccessRate: number
  completionRate: number
  learningVelocity: number
  violationCount: number
  confidenceScore: number
}): number {
  const velocityBonus = Math.max(-10, Math.min(10, input.learningVelocity / 10))
  const violationPenalty = Math.min(15, input.violationCount * 2)

  const raw =
    input.averageTestScore * 0.28 +
    input.dsaSuccessRate * 0.22 +
    input.completionRate * 0.22 +
    input.confidenceScore * 0.18 +
    50 * 0.1 +
    velocityBonus

  return Math.max(0, Math.min(100, Math.round(raw - violationPenalty)))
}

function buildDateRange(days: number): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function formatLabel(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildStudyTimeTrend(data: RawAnalyticsData): TrendPoint[] {
  const dates = buildDateRange(TREND_DAYS)
  const map = new Map(dates.map((d) => [d, 0]))

  for (const day of data.studyProgress) {
    const key = day.updatedAt.slice(0, 10)
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + day.timeSpentMinutes)
    }
  }

  return dates.map((date) => ({
    date,
    label: formatLabel(date),
    value: Math.round((map.get(date) ?? 0) / 60 * 10) / 10,
  }))
}

function buildTestScoreTrend(data: RawAnalyticsData): TrendPoint[] {
  const dates = buildDateRange(TREND_DAYS)
  const map = new Map(dates.map((d) => [d, { sum: 0, count: 0 }]))

  for (const attempt of data.testAttempts) {
    if (!attempt.completedAt || attempt.score == null || !attempt.maxScore) continue
    const key = attempt.completedAt.slice(0, 10)
    if (!map.has(key)) continue
    const entry = map.get(key)!
    entry.sum += (Number(attempt.score) / Number(attempt.maxScore)) * 100
    entry.count += 1
  }

  return dates.map((date) => {
    const entry = map.get(date)!
    return {
      date,
      label: formatLabel(date),
      value: entry.count > 0 ? Math.round(entry.sum / entry.count) : 0,
    }
  })
}

function buildDsaSolveTrend(data: RawAnalyticsData): TrendPoint[] {
  const dates = buildDateRange(TREND_DAYS)
  const map = new Map(dates.map((d) => [d, 0]))

  for (const p of data.dsaProblems) {
    if (p.status !== 'solved' || !p.solvedAt) continue
    const key = p.solvedAt.slice(0, 10)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }

  return dates.map((date) => ({
    date,
    label: formatLabel(date),
    value: map.get(date) ?? 0,
  }))
}

function buildViolationTrend(data: RawAnalyticsData): TrendPoint[] {
  const dates = buildDateRange(TREND_DAYS)
  const map = new Map(dates.map((d) => [d, 0]))

  for (const v of data.violations) {
    const key = v.occurredAt.slice(0, 10)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }

  return dates.map((date) => ({
    date,
    label: formatLabel(date),
    value: map.get(date) ?? 0,
  }))
}

function buildRadarData(topicScores: TopicInsight[]): RadarPoint[] {
  const top = [...topicScores].sort((a, b) => b.score - a.score).slice(0, 8)
  if (!top.length) {
    return SDE_ROADMAP_15_DAYS.slice(0, 6).map((day) => ({
      topic: day.title.length > 14 ? `${day.title.slice(0, 12)}…` : day.title,
      score: 0,
      fullMark: 100,
    }))
  }

  return top.map((t) => ({
    topic: t.topic.length > 14 ? `${t.topic.slice(0, 12)}…` : t.topic,
    score: t.score,
    fullMark: 100,
  }))
}

function buildHeatmap(data: RawAnalyticsData): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activityByDate = new Map<string, { study: number; dsa: number; tests: number }>()

  for (const day of data.studyProgress) {
    const key = day.updatedAt.slice(0, 10)
    const entry = activityByDate.get(key) ?? { study: 0, dsa: 0, tests: 0 }
    entry.study += day.timeSpentMinutes
    activityByDate.set(key, entry)
  }

  for (const p of data.dsaProblems) {
    if (p.status !== 'solved' || !p.solvedAt) continue
    const key = p.solvedAt.slice(0, 10)
    const entry = activityByDate.get(key) ?? { study: 0, dsa: 0, tests: 0 }
    entry.dsa += 1
    activityByDate.set(key, entry)
  }

  for (const attempt of data.testAttempts) {
    if (!attempt.completedAt) continue
    const key = attempt.completedAt.slice(0, 10)
    const entry = activityByDate.get(key) ?? { study: 0, dsa: 0, tests: 0 }
    entry.tests += 1
    activityByDate.set(key, entry)
  }

  const totalDays = HEATMAP_WEEKS * 7
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const dayIndex = d.getDay()
    const weekIndex = Math.floor((totalDays - 1 - i) / 7)
    const weekLabel = `W${weekIndex + 1}`

    const activity = activityByDate.get(date) ?? { study: 0, dsa: 0, tests: 0 }
    const intensity = Math.min(
      100,
      activity.study / 3 + activity.dsa * 20 + activity.tests * 25,
    )

    cells.push({
      weekIndex,
      dayIndex,
      weekLabel,
      dayLabel: DAY_LABELS[dayIndex]!,
      date,
      intensity: Math.round(intensity),
      studyMinutes: activity.study,
      dsaSolves: activity.dsa,
      testsCompleted: activity.tests,
    })
  }

  return cells
}

export function getHeatmapColor(intensity: number): string {
  if (intensity === 0) return 'var(--muted)'
  if (intensity < 25) return 'color-mix(in srgb, var(--primary) 20%, var(--muted))'
  if (intensity < 50) return 'color-mix(in srgb, var(--primary) 45%, var(--muted))'
  if (intensity < 75) return 'color-mix(in srgb, var(--primary) 70%, var(--muted))'
  return 'var(--primary)'
}
