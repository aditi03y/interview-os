import { beforeAll, describe, expect, it } from 'vitest'
import { SDE_ROADMAP_15_DAYS } from '@/features/study-plan/data/roadmap-days'
import { setStudyPlanContentForTests } from '@/features/study-plan/lib/studyPlanContentCache'
import { getDsaCurriculum } from '@/features/curriculum/data/dsaCurriculum'
import { verifyCurriculumConsistency } from '@/features/curriculum/lib/syncDsaProgress'

beforeAll(() => {
  setStudyPlanContentForTests({
    meta: {
      id: 'test-plan',
      slug: 'default',
      title: 'Test Plan',
      description: null,
    },
    days: SDE_ROADMAP_15_DAYS,
  })
})

describe('curriculum consistency', () => {
  it('matches roadmap DSA item count', () => {
    const result = verifyCurriculumConsistency()
    expect(result.valid).toBe(true)
    expect(result.curriculumCount).toBe(45)
    expect(result.roadmapDsaCount).toBe(45)
    expect(result.mismatches).toHaveLength(0)
  })

  it('has unique curriculum ids', () => {
    const ids = getDsaCurriculum().map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
