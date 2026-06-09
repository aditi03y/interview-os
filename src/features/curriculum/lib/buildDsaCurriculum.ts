import type { Difficulty } from '@/types'
import type { RoadmapDay } from '@/features/study-plan/types'
import type { CurriculumDsaItem } from '../data/dsaCurriculum'

function extractLeetcodeSlug(url: string | undefined): string | null {
  if (!url) return null
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/)
  return match?.[1] ?? null
}

function inferDifficulty(day: number, itemDifficulty?: string | null): Difficulty {
  if (itemDifficulty === 'Easy' || itemDifficulty === 'Medium' || itemDifficulty === 'Hard') {
    return itemDifficulty
  }
  if (day >= 11) return 'Hard'
  if (day >= 7) return 'Medium'
  return 'Easy'
}

export function buildDsaCurriculumFromDays(days: RoadmapDay[]): CurriculumDsaItem[] {
  return days.flatMap((day) =>
    day.dsa.map((item) => {
      const problemResource = item.resources?.find((r) => r.type === 'problem')
      const problemUrl = problemResource?.url ?? null

      return {
        id: item.id,
        dayNumber: day.day,
        dayTitle: day.title,
        title: item.title,
        topic: day.title,
        difficulty: inferDifficulty(day.day),
        platform: problemUrl?.includes('leetcode.com') ? 'LeetCode' : 'Other',
        problemUrl,
        leetcodeSlug: extractLeetcodeSlug(problemUrl ?? undefined),
      }
    }),
  )
}
