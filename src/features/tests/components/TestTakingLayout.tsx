import { Badge, Button } from '@/components/ui'
import { TestTimer } from './TestTimer'
import { QuestionMcq } from './QuestionMcq'
import { QuestionSubjective } from './QuestionSubjective'
import { QuestionCoding } from './QuestionCoding'
import type { AttemptAnswers, TestQuestion } from '../types'

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
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (index: number) => void
  onPrev: () => void
  onNext: () => void
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
  onAnswer,
  onSelectQuestion,
  onPrev,
  onNext,
  onSubmit,
}: TestTakingLayoutProps) {
  const question = questions[currentIndex]
  if (!question) return null

  const answerValue = answers[question.id]?.value ?? ''

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length} · {answeredCount} answered
          </p>
        </div>
        <TestTimer
          formattedTime={formattedTime}
          progressPercent={timerProgress}
          isLowTime={remainingSeconds <= 300}
        />
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-wrap gap-2 lg:flex-col">
          {questions.map((q, index) => {
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
                onChange={(v) => onAnswer(question.id, v)}
                disabled={submitting}
              />
            ) : null}
            {question.questionType === 'subjective' ? (
              <QuestionSubjective
                value={answerValue}
                onChange={(v) => onAnswer(question.id, v)}
                rubric={question.rubric}
                disabled={submitting}
              />
            ) : null}
            {question.questionType === 'coding' ? (
              <QuestionCoding
                value={answerValue}
                onChange={(v) => onAnswer(question.id, v)}
                starterCode={question.starterCode}
                metadata={question.metadata}
                disabled={submitting}
              />
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0 || submitting}>
              Previous
            </Button>
            <div className="flex gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button onClick={onNext} disabled={submitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Test'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
