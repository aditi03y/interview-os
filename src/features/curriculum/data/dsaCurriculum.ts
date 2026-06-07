import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import type { Difficulty } from '@/types'

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

const DAY_TOPIC_MAP: Record<number, string> = {
  1: 'Arrays',
  2: 'Hash Map',
  3: 'Two Pointers',
  4: 'Sliding Window',
  5: 'Stack',
  6: 'Binary Search',
  7: 'Linked List',
  8: 'Trees',
  9: 'Graphs',
  10: 'Heap',
  11: 'Dynamic Programming',
  12: 'Greedy',
  13: 'Backtracking',
  14: 'Trie',
  15: 'Mixed Review',
}

function extractLeetcodeSlug(url: string | undefined): string | null {
  if (!url) return null
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/)
  return match?.[1] ?? null
}

function inferDifficulty(day: number): Difficulty {
  if (day >= 11) return 'Hard'
  if (day >= 7) return 'Medium'
  return 'Easy'
}

export const DSA_CURRICULUM: CurriculumDsaItem[] = SDE_ROADMAP_15_DAYS.flatMap((day) =>
  day.dsa.map((item) => {
    const problemResource = item.resources?.find((r) => r.type === 'problem')
    const problemUrl = problemResource?.url ?? null

    return {
      id: item.id,
      dayNumber: day.day,
      dayTitle: day.title,
      title: item.title,
      topic: DAY_TOPIC_MAP[day.day] ?? 'General',
      difficulty: inferDifficulty(day.day),
      platform: problemUrl?.includes('leetcode.com') ? 'LeetCode' : 'Other',
      problemUrl,
      leetcodeSlug: extractLeetcodeSlug(problemUrl ?? undefined),
    }
  }),
)

const CURRICULUM_BY_ID = new Map(DSA_CURRICULUM.map((item) => [item.id, item]))

export function getCurriculumDsaItem(id: string): CurriculumDsaItem | undefined {
  return CURRICULUM_BY_ID.get(id)
}

export function getCurriculumForDay(dayNumber: number): CurriculumDsaItem[] {
  return DSA_CURRICULUM.filter((item) => item.dayNumber === dayNumber)
}
