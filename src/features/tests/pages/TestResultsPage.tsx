import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, RotateCcw, ShieldAlert, Trophy, XCircle } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { ViolationLog, useViolations } from '@/features/anti-cheat'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import {
  countCompletedAttempts,
  fetchAttemptById,
  fetchAttemptQuestions,
  fetchLeaderboard,
} from '../services/testService'
import { LeaderboardPanel } from '../components/LeaderboardPanel'
import { QuestionResultDetail } from '../components/QuestionResultDetail'
import type { LeaderboardEntry, TestAttempt, TestQuestion } from '../types'

export function TestResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const user = useAuthStore((s) => s.user)

  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { violations: attemptViolations, loading: violationsLoading } = useViolations({
    attemptId,
    limit: 50,
  })

  useEffect(() => {
    async function load() {
      if (!user?.id || !attemptId) return
      setLoading(true)

      const attemptResult = await fetchAttemptById(attemptId, user.id)
      if (attemptResult.error || !attemptResult.data) {
        setError(attemptResult.error?.message ?? 'Results not found')
        setLoading(false)
        return
      }

      const loaded = attemptResult.data
      setAttempt(loaded)

      const [questionsResult, leaderboardResult, used] = await Promise.all([
        fetchAttemptQuestions(loaded),
        fetchLeaderboard(loaded.testDefinitionId),
        countCompletedAttempts(user.id, loaded.testDefinitionId),
      ])

      if (questionsResult.data) setQuestions(questionsResult.data)
      if (leaderboardResult.data) setLeaderboard(leaderboardResult.data)
      setAttemptsUsed(used)
      setLoading(false)
    }

    void load()
  }, [attemptId, user?.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <EmptyState
        title="Results unavailable"
        description={error ?? 'Could not load test results.'}
      />
    )
  }

  const pct =
    attempt.score != null && attempt.maxScore > 0
      ? Math.round((attempt.score / attempt.maxScore) * 100)
      : 0
  const passed = pct >= 60
  const maxAttempts = attempt.definition?.maxAttempts ?? null
  const canRetake =
    maxAttempts == null || attemptsUsed < maxAttempts

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link to={ROUTES.testHistory}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Test History
          </Button>
        </Link>
        <Link to={ROUTES.tests}>
          <Button variant="ghost" size="sm">
            All Tests
          </Button>
        </Link>
        {canRetake ? (
          <Link to={ROUTES.tests}>
            <Button size="sm" variant="outline">
              <RotateCcw className="h-4 w-4" />
              Retake test
            </Button>
          </Link>
        ) : null}
      </div>

      <Card className={passed ? 'border-success/50' : 'border-destructive/30'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{attempt.definition?.title ?? 'Test Results'}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {attempt.autoSubmitted ? 'Auto-submitted when time expired' : 'Submitted manually'}
              </p>
              {maxAttempts != null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Attempts used: {attemptsUsed}/{maxAttempts}
                </p>
              ) : null}
            </div>
            {passed ? (
              <CheckCircle2 className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="text-4xl font-bold tabular-nums">{pct}%</p>
              <p className="text-sm text-muted-foreground">
                {attempt.score}/{attempt.maxScore} points
              </p>
            </div>
            {attempt.timeSpentSeconds != null ? (
              <Badge variant="outline">
                {Math.round(attempt.timeSpentSeconds / 60)} min spent
              </Badge>
            ) : null}
            <Badge variant={passed ? 'success' : 'destructive'}>
              {passed ? 'Pass' : 'Needs improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your responses</h2>
        <p className="text-sm text-muted-foreground">
          Full answers, test cases (including hidden), and complexity grading are shown below.
        </p>
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
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning-foreground" />
            <h2 className="text-lg font-semibold">Proctoring Violations</h2>
          </div>
          <Link to={ROUTES.testViolations}>
            <Badge variant="outline">Full Dashboard</Badge>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            {violationsLoading ? (
              <p className="text-sm text-muted-foreground">Loading violations…</p>
            ) : (
              <ViolationLog
                violations={attemptViolations}
                emptyMessage="No proctoring violations during this attempt."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning-foreground" />
          <h2 className="text-lg font-semibold">Leaderboard</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LeaderboardPanel entries={leaderboard} currentUserId={user?.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
