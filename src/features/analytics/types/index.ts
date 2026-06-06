export interface TrendPoint {
  date: string
  label: string
  value: number
}

export interface RadarPoint {
  topic: string
  score: number
  fullMark: number
}

export interface HeatmapCell {
  weekIndex: number
  dayIndex: number
  weekLabel: string
  dayLabel: string
  date: string
  intensity: number
  studyMinutes: number
  dsaSolves: number
  testsCompleted: number
}

export interface TopicInsight {
  topic: string
  score: number
  source: 'dsa' | 'study' | 'mixed'
  detail: string
}

export interface AnalyticsSnapshot {
  weakTopics: TopicInsight[]
  strongTopics: TopicInsight[]
  readinessScore: number
  learningVelocity: number
  confidenceScore: number
  completionRate: number
  totalStudyMinutes: number
  averageTestScore: number
  dsaSuccessRate: number
  violationCount: number
  dsaSolvedCount: number
  testsCompleted: number
  trends: {
    studyTime: TrendPoint[]
    testScores: TrendPoint[]
    dsaSolves: TrendPoint[]
    violations: TrendPoint[]
  }
  topicRadar: RadarPoint[]
  heatmap: HeatmapCell[]
}

export interface RawAnalyticsData {
  studyProgress: StudyProgressRow[]
  dsaProblems: DsaProblemRow[]
  testAttempts: TestAttemptRow[]
  violations: ViolationRow[]
}

export interface StudyProgressRow {
  dayNumber: number
  dayTitle: string
  timeSpentMinutes: number
  progressPercent: number
  status: string
  updatedAt: string
}

export interface DsaProblemRow {
  topic: string | null
  difficulty: string
  status: string
  attempts: number
  solvedAt: string | null
  updatedAt: string
}

export interface TestAttemptRow {
  score: number | null
  maxScore: number
  status: string
  completedAt: string | null
  startedAt: string
}

export interface ViolationRow {
  eventType: string
  occurredAt: string
}
