import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { Badge, Card, CardContent, CardHeader, CardTitle, ErrorAlert } from '@/components/ui'
import { PageHeaderSkeleton, StatsGridSkeleton, TableSkeleton } from '@/components/ui/PageSkeletons'
import { ViolationLog } from '../components/ViolationLog'
import { ViolationStatsCards, ViolationTypeBreakdown } from '../components/ViolationStatsCards'
import { useViolations } from '../hooks/useViolations'
import { VIOLATION_EVENT_LABELS, type ViolationEventType } from '../types'

const FILTER_OPTIONS: Array<{ value: ViolationEventType | 'all'; label: string }> = [
  { value: 'all', label: 'All Events' },
  ...Object.entries(VIOLATION_EVENT_LABELS).map(([value, label]) => ({
    value: value as ViolationEventType,
    label,
  })),
]

export function ViolationDashboardPage() {
  const [eventFilter, setEventFilter] = useState<ViolationEventType | 'all'>('all')
  const { violations, summary, attemptSummaries, loading, error, reload } = useViolations({
    eventType: eventFilter,
    limit: 100,
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeaderSkeleton />
        <StatsGridSkeleton count={3} className="sm:grid-cols-3" />
        <TableSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Violation Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor proctoring events across all your test attempts.
          </p>
        </div>
        <Link
          to={ROUTES.tests}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Badge variant="outline">Back to Tests</Badge>
        </Link>
      </div>

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      <ViolationStatsCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ViolationTypeBreakdown summary={summary} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flagged Test Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!attemptSummaries.length ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No violations linked to test attempts yet.
              </p>
            ) : (
              attemptSummaries.slice(0, 8).map((item) => (
                <div
                  key={item.attemptId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.attemptTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.total} violation{item.total === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Link to={ROUTES.testResults(item.attemptId)}>
                    <Badge variant="outline">View</Badge>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4" aria-labelledby="violation-log-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="violation-log-heading" className="text-lg font-semibold">
            Violation Log
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter violations">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={eventFilter === option.value}
                onClick={() => setEventFilter(option.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  eventFilter === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <ViolationLog violations={violations} showAttemptId />
        </div>
      </section>
    </div>
  )
}
