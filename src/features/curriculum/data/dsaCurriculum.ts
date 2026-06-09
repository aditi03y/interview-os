import { getCachedStudyPlanDays } from '@/features/study-plan/lib/studyPlanContentCache'
import type { Difficulty } from '@/types'
import { buildDsaCurriculumFromDays } from '../lib/buildDsaCurriculum'

export interface CurriculumDsaItem {
  id: string
  dayNumber: number
  dayTitle: string
  title: string
  topic: string
  difficulty: Difficulty
  platform: string
  problemUrl: string | null
  leetcodeSlug: string | null
}

export function getDsaCurriculum(): CurriculumDsaItem[] {
  return buildDsaCurriculumFromDays(getCachedStudyPlanDays())
}

export function getCurriculumDsaItem(id: string): CurriculumDsaItem | undefined {
  return getDsaCurriculum().find((item) => item.id === id)
}

export function getCurriculumForDay(dayNumber: number): CurriculumDsaItem[] {
  return getDsaCurriculum().filter((item) => item.dayNumber === dayNumber)
}
