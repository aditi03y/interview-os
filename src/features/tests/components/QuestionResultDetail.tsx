import { Badge } from '@/components/ui'
import { maxPointsForQuestion } from '../lib/scoring'
import { isCodingMetadata, type QuestionAnswer, type TestQuestion } from '../types'
import { QuestionCoding } from './QuestionCoding'
import { QuestionMcq } from './QuestionMcq'

interface QuestionResultDetailProps {
  question: TestQuestion
  answer?: QuestionAnswer
  index: number
}

export function QuestionResultDetail({ question, answer, index }: QuestionResultDetailProps) {
  const earned = answer?.pointsEarned ?? 0
  const maxPts = maxPointsForQuestion(question)
  const meta = isCodingMetadata(question.metadata) ? question.metadata : null

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Q{index + 1} · {question.questionType}
            {question.studyDay ? ` · Day ${question.studyDay}` : ''}
            {question.topic ? ` · ${question.topic}` : ''}
          </p>
          <p className="font-medium">{question.title}</p>
        </div>
        <Badge
          variant={answer?.isCorrect ? 'success' : earned > 0 ? 'warning' : 'destructive'}
        >
          {earned}/{maxPts} pts
        </Badge>
      </div>

      {question.body ? (
        <p className="mt-2 text-sm text-muted-foreground">{question.body}</p>
      ) : null}

      <div className="mt-4 space-y-3">
        {question.questionType === 'mcq' && question.options ? (
          <>
            <QuestionMcq
              options={question.options}
              value={answer?.value ?? ''}
              onChange={() => {}}
              disabled
              correctAnswer={question.correctAnswer}
              showReview
            />
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Your answer:</span>
              {answer?.value ? (
                <Badge variant={answer.isCorrect ? 'success' : 'destructive'}>
                  {question.options.find((o) => o.id === answer.value)?.label ?? answer.value}
                </Badge>
              ) : (
                <Badge variant="outline">Not answered</Badge>
              )}
              {question.correctAnswer ? (
                <>
                  <span className="text-muted-foreground">Correct answer:</span>
                  <Badge variant="success">
                    {question.options.find((o) => o.id === question.correctAnswer)?.label ??
                      question.correctAnswer}
                  </Badge>
                </>
              ) : null}
            </div>
          </>
        ) : null}

        {question.questionType === 'subjective' ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Your answer</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3 text-sm">
                {answer?.value?.trim() || 'No answer submitted'}
              </pre>
            </div>
            {question.rubric ? (
              <div>
                <p className="text-sm font-medium">Expected answer (rubric)</p>
                <pre className="mt-1 whitespace-pre-wrap rounded-md border border-success/30 bg-success/5 p-3 text-sm">
                  {question.rubric}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}

        {question.questionType === 'coding' ? (
          <div className="space-y-3">
            <QuestionCoding
              answer={answer ?? { value: '' }}
              onChange={() => {}}
              starterCode={question.starterCode}
              metadata={question.metadata}
              disabled
              showHiddenResults
            />
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant={answer?.complexityTimeCorrect ? 'success' : 'outline'}>
                Your time: {answer?.timeComplexity || '—'}
                {meta?.expectedTimeComplexity
                  ? ` (expected ${meta.expectedTimeComplexity})`
                  : ''}{' '}
                {answer?.complexityTimeCorrect ? '✓' : '✗'}
              </Badge>
              <Badge variant={answer?.complexitySpaceCorrect ? 'success' : 'outline'}>
                Your space: {answer?.spaceComplexity || '—'}
                {meta?.expectedSpaceComplexity
                  ? ` (expected ${meta.expectedSpaceComplexity})`
                  : ''}{' '}
                {answer?.complexitySpaceCorrect ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
