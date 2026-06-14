import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import type { Json } from '@/types/database'
import type { GeneratedTestQuestion } from '../lib/testGenerationPrompt'
import {
  activeSections,
  pickStudyDayForQuestion,
  sectionTotalDuration,
  sectionTotalMaxScore,
  sectionTotalQuestions,
} from '../lib/testSections'
import { generateTestQuestionsWithAi } from '../services/testGenerationService'
import {
  createQuestionsBulkAdmin,
  type TestDefinitionInput,
} from '../services/adminTestService'
import { StudyDayPicker } from './StudyDayPicker'

interface AiTestGeneratorPanelProps {
  testId: string
  definition: TestDefinitionInput
  existingQuestionCount: number
  onQuestionsAdded: () => void
}

export function AiTestGeneratorPanel({
  testId,
  definition,
  existingQuestionCount,
  onQuestionsAdded,
}: AiTestGeneratorPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [studyDays, setStudyDays] = useState<number[]>(definition.coveredStudyDays ?? [])
  const sections = definition.sections ?? []

  useEffect(() => {
    setStudyDays(definition.coveredStudyDays ?? [])
  }, [definition.coveredStudyDays])

  const enabledSections = activeSections(sections)
  const totalQuestions = sectionTotalQuestions(sections)
  const totalDuration = sectionTotalDuration(sections)
  const totalMaxScore = sectionTotalMaxScore(sections)

  const exampleHint = useMemo(() => {
    const topics = definition.topics?.length ? definition.topics.join(', ') : 'arrays, trees, OS'
    const dayLabel = studyDays.length ? `days ${studyDays.join(', ')}` : 'selected study days'
    return `e.g. "Cover ${topics} from ${dayLabel}. MCQ section on theory; DSA section on implementation."`
  }, [definition.topics, studyDays])

  const [generating, setGenerating] = useState(false)
  const [adding, setAdding] = useState(false)
  const [preview, setPreview] = useState<GeneratedTestQuestion[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggleSelected = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
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
    setPreview([])
    setSelected(new Set())

    const result = await generateTestQuestionsWithAi(definition, {
      instruction,
      sections,
      topics: definition.topics ?? [],
      studyDays,
    })

    setGenerating(false)

    if (result.error) {
      toast.error(result.error.message, 'Generation failed')
      return
    }

    const questions = result.data ?? []
    setPreview(questions)
    setSelected(new Set(questions.map((_, i) => i)))
    toast.success(`Generated ${questions.length} question${questions.length === 1 ? '' : 's'}.`)
  }

  const addQuestions = async (indices: number[]) => {
    const toAdd = indices.map((i) => preview[i]).filter(Boolean)
    if (!toAdd.length) {
      toast.error('Select at least one question to add.')
      return
    }

    setAdding(true)
    const result = await createQuestionsBulkAdmin(
      testId,
      toAdd.map((q, offset) => ({
        questionType: q.questionType,
        title: q.title,
        body: q.body,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rubric: q.rubric,
        starterCode: q.starterCode,
        metadata: q.metadata as Json,
        points: q.points,
        studyDay:
          q.studyDay ?? pickStudyDayForQuestion(studyDays, existingQuestionCount + offset),
        topic: q.topic,
        orderIndex: existingQuestionCount + offset,
      })),
    )
    setAdding(false)

    if (result.error) {
      toast.error(result.error.message, 'Add failed')
      return
    }

    toast.success(`Added ${toAdd.length} question${toAdd.length === 1 ? '' : 's'} to the test.`)
    setPreview([])
    setSelected(new Set())
    onQuestionsAdded()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          AI question assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick study days below, then generate questions from their curriculum content.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <StudyDayPicker
          label="Study days for generation"
          value={studyDays}
          onChange={setStudyDays}
          purpose="generation"
          required
        />

        {enabledSections.length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Generation plan</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {enabledSections.map((section) => (
                <li key={section.id}>
                  {section.label}: {section.questionCount} {section.questionType} ·{' '}
                  {section.difficulty} · {section.durationMinutes} min
                  {section.questionType === 'mcq' && section.negativeMarking.enabled
                    ? ` · −${section.negativeMarking.penaltyPerWrong} per wrong`
                    : ''}
                </li>
              ))}
            </ul>
            {studyDays.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Study days: {studyDays.join(', ')}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Total: {totalQuestions} questions, {totalDuration} minutes, {totalMaxScore} max score
            </p>
          </div>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Configure sections in test settings and set question counts before generating.
          </p>
        )}

        <Textarea
          label="Additional instructions (optional)"
          placeholder={exampleHint}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="min-h-[90px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Ready to generate {totalQuestions} question{totalQuestions === 1 ? '' : 's'} across{' '}
            {enabledSections.length} section{enabledSections.length === 1 ? '' : 's'}.
          </p>
          <Button onClick={() => void handleGenerate()} isLoading={generating}>
            <Sparkles className="h-4 w-4" aria-hidden />
            Generate
          </Button>
        </div>

        {preview.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Preview ({preview.length})</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(new Set(preview.map((_, i) => i)))}
                >
                  Select all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => void addQuestions([...selected].sort((a, b) => a - b))}
                  isLoading={adding}
                  disabled={selected.size === 0}
                >
                  Add selected ({selected.size})
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void addQuestions(preview.map((_, i) => i))}
                  isLoading={adding}
                >
                  Add all
                </Button>
              </div>
            </div>

            {preview.map((q, index) => (
              <label
                key={`${q.sectionId}-${q.title}-${index}`}
                className="flex cursor-pointer gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(index)}
                  onChange={() => toggleSelected(index)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{q.title}</p>
                    <Badge variant="outline">{q.questionType}</Badge>
                    <span className="text-xs text-muted-foreground">{q.points} pt</span>
                    {q.studyDay ? (
                      <span className="text-xs text-muted-foreground">Day {q.studyDay}</span>
                    ) : null}
                    {q.topic ? (
                      <span className="text-xs text-muted-foreground">{q.topic}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{q.body}</p>
                </div>
              </label>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
