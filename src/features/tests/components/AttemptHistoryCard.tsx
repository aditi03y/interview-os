import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/ui'
import { fetchAttemptQuestions } from '../services/testService'
import type { TestAttempt, TestQuestion } from '../types'
import { QuestionResultDetail } from './QuestionResultDetail'

interface AttemptHistoryCardProps {
  attempt: TestAttempt
  defaultExpanded?: boolean
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AttemptHistoryCard({ attempt, defaultExpanded = false }: AttemptHistoryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const reviewable = attempt.status === 'completed' || attempt.status === 'auto_submitted'
  const pct =
    attempt.score != null && attempt.maxScore > 0
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : null

  useEffect(() => {
    if (!reviewable || loaded) return

    let cancelled = false
    const load = async () => {
      setLoading(true)
      const result = await fetchAttemptQuestions(attempt)
      if (cancelled) return
      setQuestions(result.data ?? [])
      setLoaded(true)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [attempt, loaded, reviewable])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              {attempt.definition?.title ?? 'Test attempt'}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatWhen(attempt.completedAt ?? attempt.startedAt)}
              {attempt.autoSubmitted ? ' · Auto-submitted' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pct != null ? (
              <Badge variant={pct >= 60 ? 'success' : 'destructive'}>{pct}%</Badge>
            ) : null}
            <Badge variant="outline">
              {attempt.score ?? 0}/{attempt.maxScore} pts
            </Badge>
            {reviewable ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded((open) => !open)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide answers
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      View answers
                    </>
                  )}
                </Button>
                <Link to={ROUTES.testResults(attempt.id)}>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                    Full page
                  </Button>
                </Link>
              </>
            ) : (
              <Link to={ROUTES.testAttempt(attempt.id)}>
                <Button size="sm">Resume</Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && reviewable ? (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Your responses and correct answers for all {questions.length || '…'} questions.
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : questions.length ? (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionResultDetail
                  key={question.id}
                  question={question}
                  answer={attempt.answers[question.id]}
                  index={index}
                />
              ))}
            </div>
          ) : loaded ? (
            <p className="text-sm text-muted-foreground">No questions found for this attempt.</p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
