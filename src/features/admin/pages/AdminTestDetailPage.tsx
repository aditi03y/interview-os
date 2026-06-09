import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorAlert,
  Input,
  Modal,
  PageHeader,
  Textarea,
  DraftNumberInput,
  DraftNullableNumberInput,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import type { TestQuestion, QuestionType } from '@/features/tests/types'
import {
  createQuestionAdmin,
  createTestDefinitionAdmin,
  deleteQuestionAdmin,
  deleteTestDefinitionAdmin,
  fetchQuestionsForTestAdmin,
  fetchTestDefinitionAdmin,
  updateQuestionAdmin,
  updateTestDefinitionAdmin,
  type TestDefinitionInput,
  type TestQuestionInput,
} from '../services/adminTestService'
import { AiTestGeneratorPanel } from '../components/AiTestGeneratorPanel'
import { GenerateTestPromptModal } from '../components/GenerateTestPromptModal'
import { StudyDayPicker } from '../components/StudyDayPicker'
import { TestSectionsEditor } from '../components/TestSectionsEditor'
import { cloneSections, DEFAULT_TEST_SECTIONS, sectionTotalDuration, sectionTotalMaxScore, sectionTotalQuestions } from '../lib/testSections'
import { generateTestQuestionsWithAi } from '../services/testGenerationService'
import type { GeneratedTestQuestion } from '../lib/testGenerationPrompt'
import { commitGeneratedQuestionsAdmin } from '../services/testPublishService'

const TEST_TYPES = ['mcq', 'subjective', 'coding', 'mixed'] as const
const SCHEDULE_TYPES = ['revision_2d', 'cumulative_5d', 'manual'] as const
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
const QUESTION_TYPES = ['mcq', 'subjective', 'coding'] as const

const emptyDefinition: TestDefinitionInput = {
  title: '',
  description: '',
  testType: 'mixed',
  scheduleType: 'manual',
  durationMinutes: 30,
  difficulty: 'Medium',
  topics: [],
  maxScore: sectionTotalMaxScore(cloneSections(DEFAULT_TEST_SECTIONS)),
  isActive: true,
  coveredStudyDays: [],
  sections: cloneSections(DEFAULT_TEST_SECTIONS),
  maxAttempts: null,
}

function emptyQuestion(type: QuestionType = 'mcq'): TestQuestionInput {
  return {
    questionType: type,
    title: '',
    body: '',
    options: type === 'mcq' ? [{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }] : null,
    correctAnswer: type === 'mcq' ? 'a' : null,
    rubric: type === 'subjective' ? 'Full credit criteria...' : null,
    starterCode: type === 'coding' ? 'function solve(input) {\n  // your code\n}' : null,
    metadata: type === 'coding' ? { functionName: 'solve', testCases: [] } : {},
    points: 1,
    orderIndex: 0,
    studyDay: null,
    topic: null,
  }
}

export function AdminTestDetailPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const initialGeneratePrompt = location.state as {
    openGeneratePrompt?: boolean
    savedDefinition?: TestDefinitionInput
  } | null

  const [definition, setDefinition] = useState<TestDefinitionInput>(emptyDefinition)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(() => testId !== 'new')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState<TestQuestionInput>(emptyQuestion())
  const [generateModalOpen, setGenerateModalOpen] = useState(() =>
    Boolean(initialGeneratePrompt?.openGeneratePrompt),
  )
  const [publishProcessing, setPublishProcessing] = useState(false)
  const [publishStep, setPublishStep] = useState<'idle' | 'publishing'>('idle')
  const [savedDefinition, setSavedDefinition] = useState<TestDefinitionInput | null>(
    () => initialGeneratePrompt?.savedDefinition ?? null,
  )

  const isNew = testId === 'new'

  useEffect(() => {
    if (!initialGeneratePrompt?.openGeneratePrompt) return
    navigate(location.pathname, { replace: true, state: null })
  }, [initialGeneratePrompt?.openGeneratePrompt, location.pathname, navigate])

  useEffect(() => {
    if (!testId || isNew) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      const [defResult, qResult] = await Promise.all([
        fetchTestDefinitionAdmin(testId),
        fetchQuestionsForTestAdmin(testId),
      ])
      if (cancelled) return

      if (defResult.error) {
        setError(defResult.error.message)
        setLoading(false)
        return
      }

      const d = defResult.data
      const loadedSections = d.sections.length ? d.sections : cloneSections(DEFAULT_TEST_SECTIONS)
      setDefinition({
        title: d.title,
        description: d.description ?? '',
        testType: d.testType,
        scheduleType: d.scheduleType,
        durationMinutes: d.durationMinutes,
        difficulty: d.difficulty,
        topics: d.topics,
        maxScore: sectionTotalMaxScore(loadedSections),
        isActive: d.isActive,
        coveredStudyDays: d.coveredStudyDays,
        sections: loadedSections,
        maxAttempts: d.maxAttempts,
      })
      setQuestions(qResult.data ?? [])
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [isNew, testId])

  const openGeneratePrompt = (saved: TestDefinitionInput) => {
    setSavedDefinition(saved)
    setGenerateModalOpen(true)
  }

  const shouldPromptGeneration = (sections: TestDefinitionInput['sections']) =>
    sectionTotalQuestions(sections ?? []) > 0

  const maxScoreFromSections = (sections: TestDefinitionInput['sections']) =>
    sectionTotalMaxScore(sections ?? [])

  const maxScoreForSave = (sections: TestDefinitionInput['sections']) =>
    Math.max(1, maxScoreFromSections(sections))

  const reload = async () => {
    if (!testId || isNew) return
    const qResult = await fetchQuestionsForTestAdmin(testId)
    if (qResult.data) setQuestions(qResult.data)
  }

  const saveDefinition = async () => {
    if (!definition.title.trim()) {
      toast.error('Title is required.')
      return
    }

    setSaving(true)
    const topics = definition.topics ?? []
    const sections = definition.sections ?? []
    const durationMinutes =
      sectionTotalDuration(sections) > 0
        ? sectionTotalDuration(sections)
        : definition.durationMinutes
    const maxScore = maxScoreForSave(sections)

    if (isNew) {
      const result = await createTestDefinitionAdmin({
        ...definition,
        topics,
        sections,
        durationMinutes,
        maxScore,
      })
      setSaving(false)
      if (result.error) {
        toast.error(result.error.message, 'Save failed')
        return
      }
      toast.success('Test created.')
      const saved = { ...definition, topics, sections, durationMinutes, maxScore }
      if (shouldPromptGeneration(sections)) {
        navigate(ROUTES.admin.testDetail(result.data.id), {
          replace: true,
          state: { openGeneratePrompt: true, savedDefinition: saved },
        })
      } else {
        navigate(ROUTES.admin.testDetail(result.data.id), { replace: true })
      }
      return
    }

    const saved = { ...definition, topics, sections, durationMinutes, maxScore }
    const result = await updateTestDefinitionAdmin(testId!, saved)
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message, 'Save failed')
      return
    }
    toast.success('Test updated.')
    if (shouldPromptGeneration(sections)) {
      openGeneratePrompt(saved)
    }
  }

  const handleGeneratePreview = async (instruction: string) => {
    const def = savedDefinition ?? definition
    const sections = def.sections ?? []

    const result = await generateTestQuestionsWithAi(def, {
      instruction,
      sections,
      topics: def.topics ?? [],
      studyDays: def.coveredStudyDays ?? [],
    })

    if (result.error) {
      toast.error(result.error.message, 'Generation failed')
      return null
    }

    return result.data ?? null
  }

  const handleCommitGenerated = async (
    generated: GeneratedTestQuestion[],
    mode: 'replace' | 'append',
  ) => {
    if (!testId || isNew) {
      toast.error('Save the test structure first.')
      return
    }

    const def = savedDefinition ?? definition
    setPublishProcessing(true)
    setPublishStep('idle')

    const result = await commitGeneratedQuestionsAdmin(testId, def, generated, {
      mode,
      existingQuestionCount: questions.length,
      onPhase: () => setPublishStep('publishing'),
    })

    if (result.error) {
      setPublishProcessing(false)
      setPublishStep('idle')
      toast.error(result.error.message, 'Publish failed')
      return
    }

    setDefinition((d) => ({
      ...d,
      isActive: true,
      maxScore: maxScoreFromSections(def.sections),
    }))
    await reload()
    setPublishProcessing(false)
    setPublishStep('idle')
    setGenerateModalOpen(false)
    setSavedDefinition(null)
    toast.success(
      `Test published with ${result.data?.questionCount ?? 0} question${result.data?.questionCount === 1 ? '' : 's'} (${mode === 'replace' ? 'replaced' : 'appended'}).`,
      'Test submitted',
    )
  }

  const handleDeleteTest = async () => {
    if (isNew || !testId) return
    if (!window.confirm('Delete this test and all its questions?')) return

    const result = await deleteTestDefinitionAdmin(testId)
    if (result.error) {
      toast.error(result.error.message, 'Delete failed')
      return
    }
    toast.success('Test deleted.')
    navigate(ROUTES.admin.tests)
  }

  const openQuestionModal = (question?: TestQuestion) => {
    if (question) {
      setEditingQuestion(question)
      setQuestionForm({
        questionType: question.questionType,
        title: question.title,
        body: question.body,
        options: question.options as TestQuestionInput['options'],
        correctAnswer: question.correctAnswer,
        rubric: question.rubric,
        starterCode: question.starterCode,
        metadata: question.metadata as TestQuestionInput['metadata'],
        points: question.points,
        orderIndex: question.orderIndex,
        studyDay: question.studyDay,
        topic: question.topic,
      })
    } else {
      setEditingQuestion(null)
      setQuestionForm(emptyQuestion())
    }
    setQuestionModalOpen(true)
  }

  const saveQuestion = async () => {
    if (!testId || isNew) {
      toast.error('Save the test definition first.')
      return
    }
    if (!questionForm.title.trim()) {
      toast.error('Question title is required.')
      return
    }

    setSaving(true)
    const result = editingQuestion
      ? await updateQuestionAdmin(editingQuestion.id, questionForm)
      : await createQuestionAdmin(testId, {
          ...questionForm,
          orderIndex: questions.length,
        })
    setSaving(false)

    if (result.error) {
      toast.error(result.error.message, 'Question save failed')
      return
    }

    toast.success(editingQuestion ? 'Question updated.' : 'Question added.')
    setQuestionModalOpen(false)
    void reload()
  }

  const removeQuestion = async (id: string) => {
    if (!window.confirm('Delete this question?')) return
    const result = await deleteQuestionAdmin(id)
    if (result.error) {
      toast.error(result.error.message, 'Delete failed')
      return
    }
    toast.success('Question deleted.')
    void reload()
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading test…</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'New Test' : definition.title || 'Edit Test'}
        description="Configure test metadata and manage the question bank."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.admin.tests)}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => window.location.reload()} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            value={definition.title}
            onChange={(e) => setDefinition((d) => ({ ...d, title: e.target.value }))}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Type</span>
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={definition.testType}
              onChange={(e) =>
                setDefinition((d) => ({
                  ...d,
                  testType: e.target.value as TestDefinitionInput['testType'],
                }))
              }
            >
              {TEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Schedule</span>
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={definition.scheduleType}
              onChange={(e) =>
                setDefinition((d) => ({
                  ...d,
                  scheduleType: e.target.value as TestDefinitionInput['scheduleType'],
                }))
              }
            >
              {SCHEDULE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Difficulty</span>
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={definition.difficulty ?? ''}
              onChange={(e) =>
                setDefinition((d) => ({ ...d, difficulty: e.target.value || null }))
              }
            >
              <option value="">None</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <DraftNumberInput
            label="Duration (minutes)"
            min={1}
            emptyValue={30}
            value={definition.durationMinutes}
            onChange={(durationMinutes) =>
              setDefinition((d) => ({ ...d, durationMinutes }))
            }
          />
          <DraftNumberInput
            label="Max attempts per user"
            min={1}
            emptyValue={0}
            value={definition.maxAttempts ?? 0}
            onChange={(maxAttempts) =>
              setDefinition((d) => ({
                ...d,
                maxAttempts: maxAttempts > 0 ? maxAttempts : null,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Leave empty (0) for unlimited reattempts. Students see full answers after each submit.
          </p>
          <p className="text-xs text-muted-foreground md:col-span-2">
            Duration auto-sums section times on save when sections are configured.
          </p>
          <div className="md:col-span-2">
            <StudyDayPicker
              value={definition.coveredStudyDays ?? []}
              onChange={(days) => setDefinition((d) => ({ ...d, coveredStudyDays: days }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium">Test sections</p>
            <TestSectionsEditor
              sections={definition.sections ?? cloneSections(DEFAULT_TEST_SECTIONS)}
              onChange={(sections) =>
                setDefinition((d) => ({
                  ...d,
                  sections,
                  durationMinutes: sectionTotalDuration(sections) || d.durationMinutes,
                  maxScore: maxScoreFromSections(sections),
                }))
              }
            />
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm md:col-span-2">
            <p className="font-medium">Max score</p>
            <p className="mt-1 text-muted-foreground">
              {maxScoreFromSections(definition.sections)} points — auto-calculated from section
              question counts × points each
            </p>
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={definition.description ?? ''}
              onChange={(e) => setDefinition((d) => ({ ...d, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          <Input
            label="Topics (comma-separated)"
            value={(definition.topics ?? []).join(', ')}
            onChange={(e) =>
              setDefinition((d) => ({
                ...d,
                topics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              }))
            }
            className="md:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={definition.isActive ?? true}
              onChange={(e) => setDefinition((d) => ({ ...d, isActive: e.target.checked }))}
            />
            Active (visible to students)
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button onClick={() => void saveDefinition()} isLoading={saving}>
              {isNew ? 'Create test' : 'Save changes'}
            </Button>
            {!isNew ? (
              <Button variant="destructive" onClick={() => void handleDeleteTest()}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete test
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!isNew ? (
        <>
          <AiTestGeneratorPanel
            testId={testId!}
            definition={definition}
            existingQuestionCount={questions.length}
            onQuestionsAdded={() => void reload()}
          />

          <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
            <Button size="sm" onClick={() => openQuestionModal()}>
              <Plus className="h-4 w-4" aria-hidden />
              Add question
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{q.title}</p>
                      <Badge variant="outline">{q.questionType}</Badge>
                      <span className="text-xs text-muted-foreground">{q.points} pt</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{q.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => openQuestionModal(q)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => void removeQuestion(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Save the test first, then add MCQ, subjective, or coding questions.
        </p>
      )}

      <Modal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestion ? 'Edit question' : 'Add question'}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Question type</span>
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={questionForm.questionType}
              onChange={(e) => {
                const type = e.target.value as QuestionType
                setQuestionForm(emptyQuestion(type))
              }}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Title"
            value={questionForm.title}
            onChange={(e) => setQuestionForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Body / prompt"
            value={questionForm.body}
            onChange={(e) => setQuestionForm((f) => ({ ...f, body: e.target.value }))}
            className="min-h-[100px]"
          />
          {questionForm.questionType === 'mcq' ? (
            <>
              <Textarea
                label="Options (JSON array)"
                value={JSON.stringify(questionForm.options ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    setQuestionForm((f) => ({ ...f, options: JSON.parse(e.target.value) as TestQuestionInput['options'] }))
                  } catch {
                    // ignore invalid JSON while typing
                  }
                }}
                className="min-h-[120px] font-mono text-xs"
              />
              <Input
                label="Correct answer (option id)"
                value={questionForm.correctAnswer ?? ''}
                onChange={(e) => setQuestionForm((f) => ({ ...f, correctAnswer: e.target.value }))}
              />
            </>
          ) : null}
          {questionForm.questionType === 'subjective' ? (
            <Textarea
              label="Grading rubric"
              value={questionForm.rubric ?? ''}
              onChange={(e) => setQuestionForm((f) => ({ ...f, rubric: e.target.value }))}
            />
          ) : null}
          {questionForm.questionType === 'coding' ? (
            <>
              <Textarea
                label="Starter code"
                value={questionForm.starterCode ?? ''}
                onChange={(e) => setQuestionForm((f) => ({ ...f, starterCode: e.target.value }))}
                className="min-h-[120px] font-mono text-xs"
              />
              <Textarea
                label="Metadata (JSON)"
                value={JSON.stringify(questionForm.metadata ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setQuestionForm((f) => ({ ...f, metadata: JSON.parse(e.target.value) as TestQuestionInput['metadata'] }))
                  } catch {
                    // ignore
                  }
                }}
                className="min-h-[100px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Include functionName, testCases (set hidden: true for grading-only cases),
                expectedTimeComplexity, expectedSpaceComplexity, and optional languages array.
              </p>
            </>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <DraftNumberInput
              label="Points"
              min={0.5}
              step={0.5}
              emptyValue={1}
              value={questionForm.points ?? 1}
              onChange={(points) => setQuestionForm((f) => ({ ...f, points }))}
            />
            <DraftNullableNumberInput
              label="Study day"
              min={1}
              max={15}
              value={questionForm.studyDay ?? null}
              onChange={(studyDay) => setQuestionForm((f) => ({ ...f, studyDay }))}
            />
          </div>
          <Input
            label="Topic"
            value={questionForm.topic ?? ''}
            onChange={(e) => setQuestionForm((f) => ({ ...f, topic: e.target.value || null }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void saveQuestion()} isLoading={saving}>
              Save question
            </Button>
          </div>
        </div>
      </Modal>

      <GenerateTestPromptModal
        key={generateModalOpen ? `${testId}-generate` : 'closed'}
        open={generateModalOpen && !isNew}
        onClose={() => {
          setGenerateModalOpen(false)
          setSavedDefinition(null)
        }}
        definition={savedDefinition ?? definition}
        existingQuestionCount={questions.length}
        onGenerate={handleGeneratePreview}
        onCommit={handleCommitGenerated}
        isCommitting={publishProcessing}
        commitStep={publishStep}
      />
    </div>
  )
}
