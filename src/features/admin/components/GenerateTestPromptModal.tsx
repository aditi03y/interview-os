import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Badge, Button, Modal, Textarea } from '@/components/ui'
import { toast } from '@/lib/toast'
import type { GeneratedTestQuestion } from '../lib/testGenerationPrompt'
import type { TestDefinitionInput } from '../services/adminTestService'
import {
  activeSections,
  sectionTotalDuration,
  sectionTotalMaxScore,
  sectionTotalQuestions,
} from '../lib/testSections'
import { StudyDayPicker } from './StudyDayPicker'

type SaveMode = 'replace' | 'append'

interface GenerateTestPromptModalProps {
  open: boolean
  onClose: () => void
  definition: TestDefinitionInput
  existingQuestionCount: number
  onGenerate: (instruction: string, studyDays: number[]) => Promise<GeneratedTestQuestion[] | null>
  onCommit: (
    questions: GeneratedTestQuestion[],
    mode: SaveMode,
    studyDays: number[],
  ) => Promise<void>
  isCommitting: boolean
  commitStep: 'idle' | 'publishing'
}

export function GenerateTestPromptModal({
  open,
  onClose,
  definition,
  existingQuestionCount,
  onGenerate,
  onCommit,
  isCommitting,
  commitStep,
}: GenerateTestPromptModalProps) {
  const [instruction, setInstruction] = useState('')
  const [studyDays, setStudyDays] = useState<number[]>(definition.coveredStudyDays ?? [])
  const [phase, setPhase] = useState<'prompt' | 'preview'>('prompt')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<GeneratedTestQuestion[]>([])
  const [saveMode, setSaveMode] = useState<SaveMode>(() =>
    existingQuestionCount > 0 ? 'replace' : 'append',
  )

  useEffect(() => {
    if (!open) return
    setStudyDays(definition.coveredStudyDays ?? [])
    setPhase('prompt')
    setPreview([])
    setInstruction('')
  }, [open, definition.coveredStudyDays])

  const sections = definition.sections ?? []
  const enabledSections = activeSections(sections)
  const totalMaxScore = sectionTotalMaxScore(sections)
  const totalQuestions = sectionTotalQuestions(sections)

  const exampleHint = useMemo(() => {
    const topics = definition.topics?.length ? definition.topics.join(', ') : 'arrays, trees, OS'
    const dayLabel = studyDays.length ? `days ${studyDays.join(', ')}` : 'the selected study days'
    return `Optional: add focus areas, e.g. "Emphasize ${topics} from ${dayLabel}."`
  }, [definition.topics, studyDays])

  const handleClose = () => {
    if (generating || isCommitting) return
    onClose()
  }

  const handleGenerate = async () => {
    if (!enabledSections.length) {
      toast.error('Set a question count greater than 0 for at least one section.')
      return
    }
    if (!studyDays.length) {
      toast.error('Select at least one study day for question generation.')
      return
    }

    setGenerating(true)
    const questions = await onGenerate(instruction, studyDays)
    setGenerating(false)

    if (!questions?.length) return

    setPreview(questions)
    setPhase('preview')
    toast.success(`Generated ${questions.length} question${questions.length === 1 ? '' : 's'}.`)
  }

  const handleCommit = async () => {
    if (!preview.length) return
    await onCommit(preview, saveMode, studyDays)
  }

  const commitLabel =
    commitStep === 'publishing' ? 'Publishing test…' : 'Add to test & publish'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        phase === 'prompt'
          ? 'Generate questions from structure?'
          : 'Review generated questions'
      }
      description={
        phase === 'prompt'
          ? 'Pick study days, then generate AI questions matching each section.'
          : 'Choose whether to replace or append, then publish the test for students.'
      }
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="font-medium">Structure summary</p>
          {enabledSections.length > 0 ? (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {enabledSections.map((section) => (
                <li key={section.id}>
                  {section.label}: {section.questionCount} {section.questionType} ·{' '}
                  {section.difficulty} · {section.durationMinutes} min ·{' '}
                  {section.pointsPerQuestion} pt each
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-amber-600 dark:text-amber-400">
              No sections with questions configured. Close and set section counts first.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Total: {totalQuestions} questions · {sectionTotalDuration(sections)} minutes ·{' '}
            {totalMaxScore} max score
          </p>
        </div>

        {phase === 'prompt' ? (
          <>
            <StudyDayPicker
              label="Study days for this test"
              value={studyDays}
              onChange={setStudyDays}
              purpose="generation"
              required
            />

            <Textarea
              label="Additional AI instructions (optional)"
              placeholder={exampleHint}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[80px]"
              disabled={generating}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={generating}>
                Skip for now
              </Button>
              <Button onClick={() => void handleGenerate()} isLoading={generating}>
                <Sparkles className="h-4 w-4" aria-hidden />
                Generate questions
              </Button>
            </div>
          </>
        ) : (
          <>
            {studyDays.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Generated from study days: {studyDays.join(', ')}
              </p>
            ) : null}

            <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
              {preview.map((q, index) => (
                <div key={`${q.sectionId}-${q.title}-${index}`} className="rounded-md p-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{q.title}</p>
                    <Badge variant="outline">{q.questionType}</Badge>
                    <span className="text-xs text-muted-foreground">{q.points} pt</span>
                    {q.studyDay ? (
                      <span className="text-xs text-muted-foreground">Day {q.studyDay}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{q.body}</p>
                </div>
              ))}
            </div>

            {existingQuestionCount > 0 ? (
              <fieldset className="space-y-2 rounded-lg border border-border p-3 text-sm">
                <legend className="px-1 font-medium">Save generated questions</legend>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="saveMode"
                    className="mt-1"
                    checked={saveMode === 'replace'}
                    onChange={() => setSaveMode('replace')}
                    disabled={isCommitting}
                  />
                  <span>
                    <strong>Replace</strong> existing {existingQuestionCount} question
                    {existingQuestionCount === 1 ? '' : 's'}
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="saveMode"
                    className="mt-1"
                    checked={saveMode === 'append'}
                    onChange={() => setSaveMode('append')}
                    disabled={isCommitting}
                  />
                  <span>
                    <strong>Append</strong> after existing questions (keep all{' '}
                    {existingQuestionCount})
                  </span>
                </label>
              </fieldset>
            ) : (
              <p className="text-sm text-muted-foreground">
                These {preview.length} questions will be added to this test.
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPhase('prompt')}
                disabled={isCommitting}
              >
                Back
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isCommitting}>
                Cancel
              </Button>
              <Button onClick={() => void handleCommit()} isLoading={isCommitting}>
                {commitLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
