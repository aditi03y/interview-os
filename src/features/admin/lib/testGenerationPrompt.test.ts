import { describe, expect, it } from 'vitest'
import { parseGeneratedTestQuestions } from '@/features/admin/lib/testGenerationPrompt'
import type { TestSectionConfig } from '@/features/tests/types'

const mcqSection: TestSectionConfig = {
  id: 'mcq',
  label: 'MCQ',
  questionType: 'mcq',
  questionCount: 1,
  difficulty: 'Medium',
  durationMinutes: 10,
  pointsPerQuestion: 1,
  negativeMarking: { enabled: false, penaltyPerWrong: 0.25 },
}

describe('parseGeneratedTestQuestions', () => {
  it('parses a valid MCQ payload', () => {
    const raw = JSON.stringify({
      questions: [
        {
          questionType: 'mcq',
          title: 'Array basics',
          body: 'What is the time complexity of index access?',
          options: [
            { id: 'a', label: 'O(1)' },
            { id: 'b', label: 'O(n)' },
            { id: 'c', label: 'O(log n)' },
            { id: 'd', label: 'O(n log n)' },
          ],
          correctAnswer: 'a',
          points: 1,
          topic: 'Arrays',
        },
      ],
    })

    const result = parseGeneratedTestQuestions(raw, mcqSection)
    expect(result).toHaveLength(1)
    expect(result[0]?.questionType).toBe('mcq')
    expect(result[0]?.correctAnswer).toBe('a')
    expect(result[0]?.sectionId).toBe('mcq')
  })

  it('extracts JSON from markdown fences', () => {
    const section: TestSectionConfig = {
      ...mcqSection,
      id: 'subjective',
      label: 'Subjective',
      questionType: 'subjective',
    }
    const raw = `\`\`\`json
{"questions":[{"questionType":"subjective","title":"Explain BFS","body":"Describe BFS.","rubric":"- Definition\\n- Example","points":2}]}
\`\`\``

    const result = parseGeneratedTestQuestions(raw, section)
    expect(result[0]?.questionType).toBe('subjective')
    expect(result[0]?.rubric).toContain('Definition')
  })
})
