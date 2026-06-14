import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui'
import { useTests } from '../hooks/useTests'
import { AttemptHistoryCard } from '../components/AttemptHistoryCard'
import { AttemptHistoryTable } from '../components/AttemptHistoryTable'

export function TestHistoryPage() {
  const { attempts, loading, summary } = useTests()

  const reviewableAttempts = attempts.filter(
    (a) => a.status === 'completed' || a.status === 'auto_submitted',
  )
  const inProgressAttempts = attempts.filter((a) => a.status === 'in_progress')

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Test History"
        description={`${summary?.completedAttempts ?? 0} completed · ${summary?.totalAttempts ?? 0} total attempts`}
        actions={
          <Link to={ROUTES.tests}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Tests
            </Button>
          </Link>
        }
      />

      {reviewableAttempts.length === 0 && inProgressAttempts.length === 0 ? (
        <EmptyState
          title="No attempts yet"
          description="Complete a test to review your answers and correct solutions here."
        />
      ) : null}

      {reviewableAttempts.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Past results</h2>
            <p className="text-sm text-muted-foreground">
              Expand any attempt to see every question, your answer, and the correct solution.
            </p>
          </div>
          <div className="space-y-4">
            {reviewableAttempts.map((attempt) => (
              <AttemptHistoryCard key={attempt.id} attempt={attempt} defaultExpanded />
            ))}
          </div>
        </section>
      ) : null}

      {inProgressAttempts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">In progress</h2>
          <AttemptHistoryTable attempts={inProgressAttempts} showActions />
        </section>
      ) : null}
    </div>
  )
}
