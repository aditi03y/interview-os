import { SDE_ROADMAP_15_DAYS } from '../data/roadmap-days'
import type { RoadmapItem } from '../types'

export interface RoadmapAssignmentContext {
  dayNumber: number
  dayTitle: string
  daySubtitle?: string
  assignment: RoadmapItem
}

export function getRoadmapAssignment(assignmentId: string): RoadmapAssignmentContext | null {
  for (const day of SDE_ROADMAP_15_DAYS) {
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
