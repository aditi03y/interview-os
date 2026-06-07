import type { TestQuestion, TestSectionConfig } from '../types'
import { getQuestionSectionId } from '../types'

export interface SectionPlanItem {
  section: TestSectionConfig
  questionIndices: number[]
}

export interface SectionTimerState {
  sectionIndex: number
  sectionExpiresAt: string
}

export function buildSectionPlan(
  sections: TestSectionConfig[],
  questions: TestQuestion[],
): SectionPlanItem[] {
  if (!sections.length || !questions.length) return []

  const assigned = new Set<string>()
  const plan: SectionPlanItem[] = []

  for (const section of sections) {
    const indices: number[] = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      if (assigned.has(question.id)) continue

      const sectionId = getQuestionSectionId(question)
      const matchesSection =
        sectionId === section.id ||
        (!sectionId && question.questionType === section.questionType)

      if (matchesSection) {
        indices.push(i)
        assigned.add(question.id)
      }
    }

    if (indices.length > 0) {
      plan.push({ section, questionIndices: indices })
    }
  }

  const unassignedIndices: number[] = []
  questions.forEach((question, index) => {
    if (!assigned.has(question.id)) unassignedIndices.push(index)
  })

  if (unassignedIndices.length > 0) {
    plan.push({
      section: {
        id: 'general',
        label: 'General',
        questionType: questions[unassignedIndices[0]!]!.questionType,
        questionCount: unassignedIndices.length,
        difficulty: 'Medium',
        durationMinutes: Math.max(10, Math.ceil(unassignedIndices.length * 2)),
        pointsPerQuestion: 1,
        negativeMarking: { enabled: false, penaltyPerWrong: 0 },
      },
      questionIndices: unassignedIndices,
    })
  }

  return plan
}

export function shouldUseSectionTimers(
  definitionSections: TestSectionConfig[],
  plan: SectionPlanItem[],
): boolean {
  if (!definitionSections.length || !plan.length) return false
  return plan.some((item) => item.section.durationMinutes > 0)
}

export function getSectionBounds(plan: SectionPlanItem[], sectionIndex: number) {
  const item = plan[sectionIndex]
  if (!item?.questionIndices.length) {
    return { start: 0, end: 0, indices: [] as number[] }
  }
  const indices = item.questionIndices
  return {
    start: indices[0]!,
    end: indices[indices.length - 1]!,
    indices,
  }
}

export function clampQuestionIndexToSection(
  index: number,
  plan: SectionPlanItem[],
  sectionIndex: number,
): number {
  const { start, end } = getSectionBounds(plan, sectionIndex)
  if (start === end && start === 0 && !plan[sectionIndex]) return index
  return Math.min(Math.max(index, start), end)
}

export function createSectionExpiresAt(durationMinutes: number, fromMs = Date.now()): string {
  return new Date(fromMs + durationMinutes * 60_000).toISOString()
}

/** Advance section index if stored expiry has passed (e.g. after tab away). */
export function reconcileSectionTimerState(
  plan: SectionPlanItem[],
  state: SectionTimerState,
  now = Date.now(),
): { state: SectionTimerState; expiredAll: boolean } {
  let sectionIndex = state.sectionIndex
  let sectionExpiresAt = state.sectionExpiresAt

  while (
    sectionIndex < plan.length &&
    new Date(sectionExpiresAt).getTime() <= now
  ) {
    if (sectionIndex >= plan.length - 1) {
      return { state: { sectionIndex, sectionExpiresAt }, expiredAll: true }
    }
    sectionIndex += 1
    sectionExpiresAt = createSectionExpiresAt(plan[sectionIndex]!.section.durationMinutes, now)
  }

  return {
    state: { sectionIndex, sectionExpiresAt },
    expiredAll: false,
  }
}

export function initialSectionTimerState(plan: SectionPlanItem[]): SectionTimerState {
  return {
    sectionIndex: 0,
    sectionExpiresAt: createSectionExpiresAt(plan[0]!.section.durationMinutes),
  }
}
