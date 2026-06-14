import { useNavigate } from 'react-router-dom'
import { BarChart3, Code2, History, ShieldAlert, Target, Timer } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorAlert,
  PageHeader,
} from '@/components/ui'
import { TestsPageSkeleton } from '@/components/ui/PageSkeletons'
import { getNextScheduledEvent } from '../lib/scheduler'
import { useTests } from '../hooks/useTests'
import { ScheduledTestCard } from '../components/ScheduledTestCard'
import { TestCatalogCard } from '../components/TestCatalogCard'
import { AttemptHistoryTable } from '../components/AttemptHistoryTable'
import type { TestDefinition } from '../types'

export function TestsPage() {
  const navigate = useNavigate()
  const {
    loading,
    error,
    planDay,
    scheduledSlots,
    manualTests,
    summary,
    attempts,
    startingId,
    inProgressAttempt,
    startTest,
    reload,
  } = useTests()

  const nextEvent = getNextScheduledEvent(planDay)
  const recentAttempts = attempts.slice(0, 5)

  const handleStart = async (
    definition: TestDefinition,
    options?: { coveredStudyDays?: number[]; scheduleDay?: number },
  ) => {
    if (inProgressAttempt) {
      navigate(ROUTES.testAttempt(inProgressAttempt.id))
      return
    }
    const attempt = await startTest(definition, options)
    if (attempt) navigate(ROUTES.testAttempt(attempt.id))
  }

  if (loading) {
    return <TestsPageSkeleton />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Test Engine"
        description="Scheduled revision & cumulative tests with timed MCQ, subjective, and coding assessments."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.testViolations)}>
              <ShieldAlert className="h-4 w-4" />
              Violations
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.dsaPractice)}>
              <Code2 className="h-4 w-4" />
              DSA Practice
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.testHistory)}>
              <History className="h-4 w-4" />
              Full History
            </Button>
          </div>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      {inProgressAttempt ? (
        <div className="flex items-center justify-between rounded-lg border border-warning/50 bg-warning/10 px-4 py-3">
          <p className="text-sm">
            You have a test in progress: <strong>{inProgressAttempt.definition?.title}</strong>
          </p>
          <Button size="sm" onClick={() => navigate(ROUTES.testAttempt(inProgressAttempt.id))}>
            Resume
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Plan Day
            </CardDescription>
            <CardTitle className="text-2xl">{planDay}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Avg Score
            </CardDescription>
            <CardTitle className="text-2xl">{summary?.averageScore ?? 0}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Best Score
            </CardDescription>
            <CardTitle className="text-2xl">{summary?.bestScore ?? 0}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Time Spent
            </CardDescription>
            <CardTitle className="text-2xl">{summary?.totalTimeSpentMinutes ?? 0}m</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {scheduledSlots.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Due Today</h2>
            <p className="text-sm text-muted-foreground">
              Every 2 days: revision test · Every 5 days: cumulative test
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {scheduledSlots.map((slot) => (
              <ScheduledTestCard
                key={`${slot.definition.id}-${slot.planDay}`}
                slot={slot}
                starting={startingId === slot.definition.id}
                disabled={Boolean(inProgressAttempt)}
                onStart={() =>
                  handleStart(slot.definition, {
                    coveredStudyDays: slot.coveredStudyDays,
                    scheduleDay: slot.planDay,
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : nextEvent ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No scheduled tests due today. Next: <strong>{nextEvent.label}</strong> in{' '}
            {nextEvent.daysUntil} day{nextEvent.daysUntil === 1 ? '' : 's'}.
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Practice Tests</h2>
        {manualTests.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {manualTests.map((definition) => (
              <TestCatalogCard
                key={definition.id}
                definition={definition}
                starting={startingId === definition.id}
                disabled={Boolean(inProgressAttempt)}
                onStart={() => handleStart(definition)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No practice tests" description="Test catalog will appear once loaded from Supabase." />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Attempts</h2>
        <AttemptHistoryTable attempts={recentAttempts} showActions />
      </section>
    </div>
  )
}
