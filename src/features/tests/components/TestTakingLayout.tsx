import { Badge, Button } from '@/components/ui'
import { TestTimer } from './TestTimer'
import { QuestionMcq } from './QuestionMcq'
import { QuestionSubjective } from './QuestionSubjective'
import { QuestionCoding } from './QuestionCoding'
import type { AttemptAnswers, QuestionAnswer, TestQuestion } from '../types'
import type { SectionPlanItem } from '../lib/sectionPlan'

interface TestTakingLayoutProps {
  title: string
  questions: TestQuestion[]
  currentIndex: number
  answers: AttemptAnswers
  formattedTime: string
  timerProgress: number
  remainingSeconds: number
  answeredCount: number
  submitting: boolean
  sectionTimersEnabled?: boolean
  currentSectionLabel?: string
  sectionIndex?: number
  sectionCount?: number
  overallFormattedTime?: string
  overallTimerProgress?: number
  overallRemainingSeconds?: number
  sectionPlan?: SectionPlanItem[]
  canAdvanceSectionEarly?: boolean
  onAnswer: (questionId: string, patch: Partial<QuestionAnswer> & { value: string }) => void
  onSelectQuestion: (index: number) => void
  onPrev: () => void
  onNext: () => void
  onAdvanceSection?: () => void
  onSubmit: () => void
}

export function TestTakingLayout({
  title,
  questions,
  currentIndex,
  answers,
  formattedTime,
  timerProgress,
  remainingSeconds,
  answeredCount,
  submitting,
  sectionTimersEnabled = false,
  currentSectionLabel,
  sectionIndex = 0,
  sectionCount = 1,
  overallFormattedTime,
  overallTimerProgress = 100,
  overallRemainingSeconds = 0,
  sectionPlan = [],
  canAdvanceSectionEarly = false,
  onAnswer,
  onSelectQuestion,
  onPrev,
  onNext,
  onAdvanceSection,
  onSubmit,
}: TestTakingLayoutProps) {
  const question = questions[currentIndex]
  if (!question) return null

  const answerValue = answers[question.id]?.value ?? ''

  const navigableIndices = sectionTimersEnabled
    ? (sectionPlan[sectionIndex]?.questionIndices ?? [])
    : questions.map((_, index) => index)

  const sectionStart = navigableIndices[0] ?? 0
  const sectionEnd = navigableIndices[navigableIndices.length - 1] ?? questions.length - 1
  const isLastQuestionInSection = currentIndex >= sectionEnd
  const isLastQuestionOverall = currentIndex >= questions.length - 1
  const sectionAnsweredCount = navigableIndices.filter((index) =>
    Boolean(answers[questions[index]!.id]?.value?.trim()),
  ).length

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {sectionTimersEnabled && currentSectionLabel ? (
            <p className="text-sm font-medium text-foreground">
              Section {sectionIndex + 1} of {sectionCount}: {currentSectionLabel}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
            {sectionTimersEnabled
              ? ` · ${sectionAnsweredCount}/${navigableIndices.length} answered in this section`
              : ` · ${answeredCount} answered`}
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-end gap-4">
          {sectionTimersEnabled && overallFormattedTime ? (
            <TestTimer
              formattedTime={overallFormattedTime}
              progressPercent={overallTimerProgress}
              isLowTime={overallRemainingSeconds <= 300}
              label="Overall time"
            />
          ) : null}
          <TestTimer
            formattedTime={formattedTime}
            progressPercent={timerProgress}
            isLowTime={remainingSeconds <= 300}
            label={sectionTimersEnabled ? 'Section time' : undefined}
          />
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-wrap gap-2 lg:flex-col">
          {navigableIndices.map((index) => {
            const q = questions[index]!
            const answered = Boolean(answers[q.id]?.value?.trim())
            const active = index === currentIndex
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestion(index)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <span>Q{index + 1}</span>
                <Badge variant={answered ? 'success' : 'outline'} className="text-xs">
                  {q.questionType}
                </Badge>
              </button>
            )
          })}
        </nav>

        <div className="flex flex-col rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2 capitalize">
                {question.questionType}
              </Badge>
              <h2 className="text-base font-semibold">{question.title}</h2>
              {question.topic ? (
                <p className="mt-1 text-xs text-muted-foreground">{question.topic}</p>
              ) : null}
            </div>
            <Badge variant="outline">{question.points} pts</Badge>
          </div>

          {question.body ? (
            <p className="mb-4 text-sm text-muted-foreground">{question.body}</p>
          ) : null}

          <div className="flex-1">
            {question.questionType === 'mcq' && question.options ? (
              <QuestionMcq
                options={question.options}
                value={answerValue}
                onChange={(v) => onAnswer(question.id, { value: v })}
                disabled={submitting}
              />
            ) : null}
            {question.questionType === 'subjective' ? (
              <QuestionSubjective
                value={answerValue}
                onChange={(v) => onAnswer(question.id, { value: v })}
                rubric={question.rubric}
                disabled={submitting}
              />
            ) : null}
            {question.questionType === 'coding' ? (
              <QuestionCoding
                answer={answers[question.id] ?? { value: answerValue }}
                onChange={(patch) => onAnswer(question.id, patch)}
                starterCode={question.starterCode}
                metadata={question.metadata}
                disabled={submitting}
              />
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={currentIndex <= sectionStart || submitting}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {!isLastQuestionInSection ? (
                <Button onClick={onNext} disabled={submitting}>
                  Next
                </Button>
              ) : canAdvanceSectionEarly ? (
                <Button onClick={onAdvanceSection} disabled={submitting}>
                  Next section
                </Button>
              ) : isLastQuestionOverall ? (
                <Button onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Test'}
                </Button>
              ) : (
                <Button onClick={onNext} disabled={submitting}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
