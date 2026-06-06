export type CompanyId =
  | 'amazon'
  | 'google'
  | 'microsoft'
  | 'uber'
  | 'atlassian'
  | 'flipkart'
  | 'walmart'

export interface PillarScores {
  dsa: number
  tests: number
  study: number
  github: number
}

export interface TopicScore {
  topic: string
  score: number
  source: 'dsa' | 'study' | 'mixed'
}

export interface WeakArea {
  label: string
  score: number
  category: 'pillar' | 'topic'
  recommendation: string
}

export interface RecommendedTopic {
  topic: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  relatedCompanies: CompanyId[]
}

export interface CompanyReadiness {
  id: CompanyId
  name: string
  score: number
  tier: ReadinessTier
  pillarBreakdown: PillarScores
  topicAlignment: number
  gapAnalysis: string
}

export type ReadinessTier = 'strong' | 'competitive' | 'developing' | 'early'

export interface ReadinessSnapshot {
  overallScore: number
  overallTier: ReadinessTier
  pillars: PillarScores
  companies: CompanyReadiness[]
  weakAreas: WeakArea[]
  recommendedTopics: RecommendedTopic[]
  topicScores: TopicScore[]
  computedAt: string
}

export interface RawReadinessData {
  dsaProblems: DsaRow[]
  testAttempts: TestRow[]
  studyProgress: StudyRow[]
  githubReviews: GithubRow[]
}

export interface DsaRow {
  topic: string | null
  difficulty: string
  status: string
  attempts: number
}

export interface TestRow {
  score: number | null
  maxScore: number
  status: string
}

export interface StudyRow {
  dayNumber: number
  dayTitle: string
  progressPercent: number
  status: string
}

export interface GithubRow {
  qualityScore: number | null
  documentationScore: number | null
  structureScore: number | null
  engineeringScore: number | null
}
