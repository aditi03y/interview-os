import { describe, expect, it } from 'vitest'
import { verifyCurriculumConsistency } from '@/features/curriculum/lib/syncDsaProgress'
import { DSA_CURRICULUM } from '@/features/curriculum/data/dsaCurriculum'

describe('curriculum consistency', () => {
  it('matches roadmap DSA item count', () => {
    const result = verifyCurriculumConsistency()
    expect(result.valid).toBe(true)
    expect(result.curriculumCount).toBe(45)
    expect(result.roadmapDsaCount).toBe(45)
    expect(result.mismatches).toHaveLength(0)
  })

  it('has unique curriculum ids', () => {
    const ids = DSA_CURRICULUM.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
