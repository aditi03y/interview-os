import type { StudyStatus } from '@/types'

export type StudySection = 'theory' | 'dsa' | 'assignment'

export interface ResourceLink {
  id: string
  title: string
  url: string
  type?: 'article' | 'video' | 'docs' | 'problem'
}

export interface RoadmapItem {
  id: string
  title: string
  description?: string
  resources?: ResourceLink[]
}

export interface PromptTemplate {
  id: string
  title: string
  prompt: string
}

export interface RoadmapDay {
  day: number
  title: string
  subtitle: string
  estimatedMinutes: number
  theory: RoadmapItem[]
  dsa: RoadmapItem[]
  assignment: RoadmapItem[]
  promptTemplates: PromptTemplate[]
}

export interface CompletedItems {
  theory: string[]
  dsa: string[]
  assignment: string[]
}

export interface DayProgress {
  id: string
  userId: string
  dayNumber: number
  notes: string
  timeSpentMinutes: number
  completedItems: CompletedItems
  status: StudyStatus
  progressPercent: number
  completedAt: string | null
  updatedAt: string
}

export interface DayWithProgress extends RoadmapDay {
  progress: DayProgress | null
}

export interface StudyPlanStats {
  overallPercent: number
  completedDays: number
  totalDays: number
  totalTimeMinutes: number
  inProgressDays: number
}
