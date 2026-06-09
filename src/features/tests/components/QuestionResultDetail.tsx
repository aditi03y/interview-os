import { Badge } from '@/components/ui'
import { maxPointsForQuestion } from '../lib/scoring'
import type { QuestionAnswer, TestQuestion } from '../types'
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

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Q{index + 1} · {question.questionType}
          </p>
          <p className="font-medium">{question.title}</p>
        </div>
        <Badge
          variant={
            answer?.isCorrect ? 'success' : earned > 0 ? 'warning' : 'destructive'
          }
        >
          {earned}/{maxPts} pts
        </Badge>
      </div>

      {question.body ? (
        <p className="mt-2 text-sm text-muted-foreground">{question.body}</p>
      ) : null}

      <div className="mt-4">
        {question.questionType === 'mcq' && question.options ? (
          <div className="space-y-2">
            <QuestionMcq
              options={question.options}
              value={answer?.value ?? ''}
              onChange={() => {}}
              disabled
            />
            {question.correctAnswer ? (
              <p className="text-sm">
                Correct answer:{' '}
                <Badge variant="outline">
                  {question.options.find((o) => o.id === question.correctAnswer)?.label ??
                    question.correctAnswer}
                </Badge>
              </p>
            ) : null}
          </div>
        ) : null}

        {question.questionType === 'subjective' ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Your answer</p>
            <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
              {answer?.value?.trim() || 'No answer submitted'}
            </pre>
            {question.rubric ? (
              <p className="text-xs text-muted-foreground">Rubric: {question.rubric}</p>
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
                Time: {answer?.timeComplexity || '—'}{' '}
                {answer?.complexityTimeCorrect ? '✓' : '✗'} (1 mark)
              </Badge>
              <Badge variant={answer?.complexitySpaceCorrect ? 'success' : 'outline'}>
                Space: {answer?.spaceComplexity || '—'}{' '}
                {answer?.complexitySpaceCorrect ? '✓' : '✗'} (1 mark)
              </Badge>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
