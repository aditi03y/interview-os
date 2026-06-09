import { getCachedStudyPlanDays } from './studyPlanContentCache'
import type { RoadmapDay, RoadmapItem } from '../types'

export interface RoadmapAssignmentContext {
  dayNumber: number
  dayTitle: string
  daySubtitle: string
  assignment: RoadmapItem
}

export function getRoadmapAssignment(
  assignmentId: string,
  days: RoadmapDay[] = getCachedStudyPlanDays(),
): RoadmapAssignmentContext | null {
  for (const day of days) {
    const assignment = day.assignment.find((item) => item.id === assignmentId)
    if (assignment) {
      return {
        dayNumber: day.day,
        dayTitle: day.title,
        daySubtitle: day.subtitle,
        assignment,
      }
    }
  }
  return null
}
