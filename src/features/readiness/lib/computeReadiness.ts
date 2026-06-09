import type { RoadmapDay } from '@/features/study-plan/types'
import { COMPANY_MAP, TARGET_COMPANIES, TOPIC_ALIASES } from '../data/companies'
import type {
  CompanyReadiness,
  PillarScores,
  RawReadinessData,
  ReadinessSnapshot,
  ReadinessTier,
  RecommendedTopic,
  TopicScore,
  WeakArea,
} from '../types'

export function computeReadiness(data: RawReadinessData, days: RoadmapDay[]): ReadinessSnapshot {
  const pillars = computePillarScores(data, days)
  const topicScores = buildTopicScores(data)
  const topicMap = new Map(topicScores.map((t) => [normalizeTopicKey(t.topic), t.score]))

  const companies = TARGET_COMPANIES.map((profile) =>
    computeCompanyReadiness(profile.id, pillars, topicMap, profile, days),
  )

  const overallScore = Math.round(
    companies.reduce((sum, c) => sum + c.score, 0) / companies.length,
  )

  const weakAreas = buildWeakAreas(pillars, topicScores, companies)
  const recommendedTopics = buildRecommendations(topicScores, companies, data, days)

  return {
    overallScore,
    overallTier: scoreToTier(overallScore),
    pillars,
    companies,
    weakAreas,
    recommendedTopics,
    topicScores,
    computedAt: new Date().toISOString(),
  }
}

function computePillarScores(data: RawReadinessData, days: RoadmapDay[]): PillarScores {
  return {
    dsa: computeDsaScore(data),
    tests: computeTestScore(data),
    study: computeStudyScore(data, days),
    github: computeGithubScore(data),
  }
}

function computeDsaScore(data: RawReadinessData): number {
  const problems = data.dsaProblems
  if (!problems.length) return 0

  const solved = problems.filter((p) => p.status === 'solved')
  const successRate = (solved.length / problems.length) * 100

  const volumeBonus = Math.min(100, (solved.length / 40) * 100)
  const hardSolved = solved.filter((p) => p.difficulty === 'Hard').length
  const mediumSolved = solved.filter((p) => p.difficulty === 'Medium').length
  const difficultyBonus = Math.min(
    100,
    hardSolved * 12 + mediumSolved * 6,
  )

  return Math.round(successRate * 0.45 + volumeBonus * 0.3 + difficultyBonus * 0.25)
}

function computeTestScore(data: RawReadinessData): number {
  const completed = data.testAttempts.filter(
    (a) =>
      (a.status === 'completed' || a.status === 'auto_submitted') &&
      a.score != null &&
      a.maxScore > 0,
  )
  if (!completed.length) return 0

  const avg =
    completed.reduce((s, a) => s + (Number(a.score) / Number(a.maxScore)) * 100, 0) /
    completed.length

  const volumeBonus = Math.min(15, completed.length * 3)
  return Math.round(Math.min(100, avg + volumeBonus))
}

function computeStudyScore(data: RawReadinessData, days: RoadmapDay[]): number {
  const totalDays = days.length
  if (!totalDays) return 0

  const completed = data.studyProgress.filter((d) => d.status === 'completed').length
  const avgProgress = data.studyProgress.length
    ? data.studyProgress.reduce((s, d) => s + d.progressPercent, 0) / data.studyProgress.length
    : 0

  return Math.round((completed / totalDays) * 55 + avgProgress * 0.45)
}

function computeGithubScore(data: RawReadinessData): number {
  if (!data.githubReviews.length) return 0

  const scores = data.githubReviews
    .map((r) => r.qualityScore)
    .filter((s): s is number => s != null)

  if (!scores.length) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function buildTopicScores(data: RawReadinessData): TopicScore[] {
  const map = new Map<string, { total: number; weighted: number; source: TopicScore['source'] }>()

  for (const p of data.dsaProblems) {
    const topic = p.topic?.trim() || 'Uncategorized'
    const entry = map.get(topic) ?? { total: 0, weighted: 0, source: 'dsa' as const }
    entry.total += 1
    let pts = p.status === 'solved' ? 85 : p.status === 'in_progress' ? 40 : 15
    if (p.difficulty === 'Hard' && p.status === 'solved') pts = 95
    entry.weighted += pts
    map.set(topic, entry)
  }

  for (const day of data.studyProgress) {
    const topic = day.dayTitle
    const existing = map.get(topic)
    if (existing) {
      const avg = (existing.weighted / existing.total + day.progressPercent) / 2
      map.set(topic, { total: existing.total + 1, weighted: avg * (existing.total + 1), source: 'mixed' })
    } else {
      map.set(topic, { total: 1, weighted: day.progressPercent, source: 'study' })
    }
  }

  return Array.from(map.entries()).map(([topic, e]) => ({
    topic,
    score: e.total > 0 ? Math.round(e.weighted / e.total) : 0,
    source: e.source,
  }))
}

function computeCompanyReadiness(
  id: CompanyReadiness['id'],
  pillars: PillarScores,
  topicMap: Map<string, number>,
  profile: (typeof TARGET_COMPANIES)[number],
  days: RoadmapDay[],
): CompanyReadiness {
  const base =
    pillars.dsa * profile.weights.dsa +
    pillars.tests * profile.weights.tests +
    pillars.study * profile.weights.study +
    pillars.github * profile.weights.github

  const topicAlignment = computeTopicAlignment(profile.priorityTopics, topicMap, days)
  const alignedScore = Math.round(base * 0.75 + topicAlignment * 0.25)

  const gap = profile.benchmark - alignedScore
  const gapAnalysis =
    gap <= 0
      ? `At or above the typical ${profile.name} benchmark (${profile.benchmark}%).`
      : `${gap} points below the ${profile.name} benchmark (${profile.benchmark}%). Focus: ${profile.focusLabel}.`

  return {
    id,
    name: profile.name,
    score: alignedScore,
    tier: scoreToTier(alignedScore),
    pillarBreakdown: pillars,
    topicAlignment,
    gapAnalysis,
  }
}

function computeTopicAlignment(
  priorityTopics: string[],
  topicMap: Map<string, number>,
  days: RoadmapDay[],
): number {
  const scores: number[] = []

  for (const topic of priorityTopics) {
    const matched = findTopicScore(topic, topicMap, days)
    scores.push(matched ?? 0)
  }

  if (!scores.length) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function findTopicScore(
  canonicalTopic: string,
  topicMap: Map<string, number>,
  days: RoadmapDay[],
): number | null {
  const key = normalizeTopicKey(canonicalTopic)
  if (topicMap.has(key)) return topicMap.get(key)!

  const aliases = TOPIC_ALIASES[canonicalTopic] ?? []
  for (const [mapKey, score] of topicMap) {
    if (aliases.some((a) => mapKey.includes(a) || a.includes(mapKey))) return score
    if (mapKey.includes(key) || key.includes(mapKey)) return score
  }

  for (const day of days) {
    if (day.title.toLowerCase().includes(key) || key.includes(day.title.toLowerCase())) {
      const dayScore = topicMap.get(normalizeTopicKey(day.title))
      if (dayScore != null) return dayScore
    }
  }

  return null
}

function buildWeakAreas(
  pillars: PillarScores,
  topicScores: TopicScore[],
  companies: CompanyReadiness[],
): WeakArea[] {
  const areas: WeakArea[] = []

  const pillarMeta: Array<{ key: keyof PillarScores; label: string; rec: string }> = [
    { key: 'dsa', label: 'DSA Progress', rec: 'Solve 3–5 medium problems per week in weak patterns.' },
    { key: 'tests', label: 'Test Performance', rec: 'Take scheduled revision and cumulative tests.' },
    { key: 'study', label: 'Study Plan Completion', rec: 'Complete pending roadmap days in the study plan.' },
    { key: 'github', label: 'GitHub Portfolio', rec: 'Evaluate and improve a flagship repo via GitHub Evaluator.' },
  ]

  for (const meta of pillarMeta) {
    const score = pillars[meta.key]
    if (score < 60) {
      areas.push({
        label: meta.label,
        score,
        category: 'pillar',
        recommendation: meta.rec,
      })
    }
  }

  const weakTopics = [...topicScores].filter((t) => t.score < 55).sort((a, b) => a.score - b.score)

  for (const topic of weakTopics.slice(0, 6)) {
    const relevantCompanies = companies
      .filter((c) => {
        const profile = COMPANY_MAP.get(c.id)!
        return profile.priorityTopics.some(
          (pt) =>
            normalizeTopicKey(pt) === normalizeTopicKey(topic.topic) ||
            topic.topic.toLowerCase().includes(pt.toLowerCase()),
        )
      })
      .map((c) => c.name)

    areas.push({
      label: topic.topic,
      score: topic.score,
      category: 'topic',
      recommendation:
        relevantCompanies.length > 0
          ? `Priority for ${relevantCompanies.slice(0, 3).join(', ')}. Drill this pattern in DSA Tracker.`
          : 'Review this topic in the study plan and practice related problems.',
    })
  }

  return areas.sort((a, b) => a.score - b.score).slice(0, 8)
}

function buildRecommendations(
  topicScores: TopicScore[],
  companies: CompanyReadiness[],
  data: RawReadinessData,
  days: RoadmapDay[],
): RecommendedTopic[] {
  const recs: RecommendedTopic[] = []
  const topicMap = new Map(topicScores.map((t) => [normalizeTopicKey(t.topic), t.score]))

  for (const company of [...companies].sort((a, b) => a.score - b.score).slice(0, 4)) {
    const profile = COMPANY_MAP.get(company.id)!
    for (const topic of profile.priorityTopics) {
      const score = findTopicScore(topic, topicMap, days) ?? 0
      if (score >= 70) continue

      const existing = recs.find((r) => normalizeTopicKey(r.topic) === normalizeTopicKey(topic))
      if (existing) {
        if (!existing.relatedCompanies.includes(company.id)) {
          existing.relatedCompanies.push(company.id)
        }
        continue
      }

      recs.push({
        topic,
        reason: `Weak for ${profile.name} readiness (${score}% alignment). ${profile.focusLabel}.`,
        priority: score < 40 ? 'high' : score < 60 ? 'medium' : 'low',
        relatedCompanies: [company.id],
      })
    }
  }

  const incompleteDays = days.filter((day) => {
    const progress = data.studyProgress.find((d) => d.dayNumber === day.day)
    return !progress || progress.status !== 'completed'
  })

  for (const day of incompleteDays.slice(0, 3)) {
    if (recs.some((r) => r.topic.toLowerCase() === day.title.toLowerCase())) continue
    recs.push({
      topic: day.title,
      reason: `Study plan day ${day.day} not completed — unlocks fundamentals for multiple companies.`,
      priority: 'medium',
      relatedCompanies: TARGET_COMPANIES.slice(0, 3).map((c) => c.id),
    })
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recs
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 10)
}

function normalizeTopicKey(topic: string): string {
  return topic.trim().toLowerCase()
}

function scoreToTier(score: number): ReadinessTier {
  if (score >= 80) return 'strong'
  if (score >= 65) return 'competitive'
  if (score >= 45) return 'developing'
  return 'early'
}

export function tierLabel(tier: ReadinessTier): string {
  switch (tier) {
    case 'strong':
      return 'Strong'
    case 'competitive':
      return 'Competitive'
    case 'developing':
      return 'Developing'
    case 'early':
      return 'Early Stage'
  }
}

export function tierColorClass(tier: ReadinessTier): string {
  switch (tier) {
    case 'strong':
      return 'text-success'
    case 'competitive':
      return 'text-primary'
    case 'developing':
      return 'text-warning-foreground'
    case 'early':
      return 'text-destructive'
  }
}
