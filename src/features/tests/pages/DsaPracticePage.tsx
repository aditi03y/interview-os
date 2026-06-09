import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, History } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { useAuth } from '@/hooks/auth'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorAlert,
  PageHeader,
  Spinner,
} from '@/components/ui'
import {
  fetchPracticeQuestions,
  type PracticeQuestionSummary,
} from '../services/practiceService'

export function DsaPracticePage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const run = async () => {
      setLoading(true)
      const result = await fetchPracticeQuestions(user.id)
      if (cancelled) return
      if (result.error) setError(result.error.message)
      else setQuestions(result.data ?? [])
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="DSA Practice"
        description="Practice coding questions from your test bank. Track every attempt, test cases, and AI feedback."
      />

      {error ? <ErrorAlert message={error} /> : null}

      {questions.length === 0 ? (
        <EmptyState
          icon={<Code2 className="h-10 w-10" />}
          title="No practice questions yet"
          description="Publish tests with coding questions in the admin console."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {questions.map((q) => (
            <Card key={q.id} className="transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">{q.title}</CardTitle>
                <CardDescription>{q.testTitle}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{q.points} pts + 2 complexity</Badge>
                  {q.topic ? <Badge variant="outline">{q.topic}</Badge> : null}
                  <Badge variant="outline">
                    <History className="mr-1 h-3 w-3" />
                    {q.attemptCount} attempt{q.attemptCount === 1 ? '' : 's'}
                  </Badge>
                </div>
                <Link to={ROUTES.dsaPracticeQuestion(q.id)}>
                  <Badge variant="default" className="cursor-pointer">
                    Practice →
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
