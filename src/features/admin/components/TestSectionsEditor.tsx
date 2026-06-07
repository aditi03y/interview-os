import type { TestSectionConfig } from '@/features/tests/types'
import { DraftNumberInput } from '@/components/ui'
import { sectionTotalDuration, sectionTotalMaxScore, sectionTotalQuestions } from '../lib/testSections'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const

interface TestSectionsEditorProps {
  sections: TestSectionConfig[]
  onChange: (sections: TestSectionConfig[]) => void
  showSummary?: boolean
}

export function TestSectionsEditor({ sections, onChange, showSummary = true }: TestSectionsEditorProps) {
  const updateSection = (index: number, patch: Partial<TestSectionConfig>) => {
    onChange(
      sections.map((section, i) =>
        i === index
          ? {
              ...section,
              ...patch,
              negativeMarking:
                patch.negativeMarking != null
                  ? { ...section.negativeMarking, ...patch.negativeMarking }
                  : section.negativeMarking,
            }
          : section,
      ),
    )
  }

  const totalQuestions = sectionTotalQuestions(sections)
  const totalDuration = sectionTotalDuration(sections)
  const totalMaxScore = sectionTotalMaxScore(sections)

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id} className="rounded-lg border border-border p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{section.label}</p>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {section.questionType}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DraftNumberInput
              label="Questions"
              min={0}
              emptyValue={0}
              value={section.questionCount}
              onChange={(questionCount) => updateSection(index, { questionCount })}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Difficulty</span>
              <select
                className="h-10 rounded-lg border border-border bg-background px-3"
                value={section.difficulty}
                onChange={(e) =>
                  updateSection(index, {
                    difficulty: e.target.value as TestSectionConfig['difficulty'],
                  })
                }
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <DraftNumberInput
              label="Time (minutes)"
              min={1}
              emptyValue={1}
              value={section.durationMinutes}
              onChange={(durationMinutes) => updateSection(index, { durationMinutes })}
            />
            <DraftNumberInput
              label="Points each"
              min={0.5}
              step={0.5}
              emptyValue={1}
              value={section.pointsPerQuestion}
              onChange={(pointsPerQuestion) => updateSection(index, { pointsPerQuestion })}
            />
          </div>

          {section.questionType === 'mcq' ? (
            <div className="mt-3 rounded-md bg-muted/40 p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={section.negativeMarking.enabled}
                  onChange={(e) =>
                    updateSection(index, {
                      negativeMarking: {
                        ...section.negativeMarking,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
                Negative marking for wrong MCQ answers
              </label>
              {section.negativeMarking.enabled ? (
                <div className="mt-2 max-w-xs">
                  <DraftNumberInput
                    label="Penalty per wrong answer"
                    min={0}
                    step={0.25}
                    emptyValue={0}
                    value={section.negativeMarking.penaltyPerWrong}
                    onChange={(penaltyPerWrong) =>
                      updateSection(index, {
                        negativeMarking: {
                          ...section.negativeMarking,
                          penaltyPerWrong,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}

      {showSummary ? (
        <p className="text-sm text-muted-foreground">
          Section totals: {totalQuestions} question{totalQuestions === 1 ? '' : 's'},{' '}
          {totalDuration} minute{totalDuration === 1 ? '' : 's'}, {totalMaxScore} max score
        </p>
      ) : null}
    </div>
  )
}
