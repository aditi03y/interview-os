import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { Badge, Button } from '@/components/ui'
import type { TestAttempt } from '../types'

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface AttemptHistoryTableProps {
  attempts: TestAttempt[]
  showActions?: boolean
}

function statusVariant(status: TestAttempt['status']) {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'auto_submitted':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    default:
      return 'outline' as const
  }
}

function formatStatus(status: TestAttempt['status']) {
  return status.replace('_', ' ')
}

function isReviewable(status: TestAttempt['status']) {
  return status === 'completed' || status === 'auto_submitted'
}

export function AttemptHistoryTable({ attempts, showActions = false }: AttemptHistoryTableProps) {
  if (!attempts.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No attempts yet. Start your first test!
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Test</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">When</th>
            {showActions ? <th className="px-4 py-3 font-medium" /> : null}
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => {
            const pct =
              attempt.score != null && attempt.maxScore > 0
                ? Math.round((attempt.score / attempt.maxScore) * 100)
                : null
            const mins = attempt.timeSpentSeconds
              ? Math.round(attempt.timeSpentSeconds / 60)
              : null
            const reviewable = isReviewable(attempt.status)

            return (
              <tr key={attempt.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{attempt.definition?.title ?? 'Test'}</div>
                  {attempt.definition?.testType ? (
                    <span className="text-xs text-muted-foreground">{attempt.definition.testType}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {pct != null ? (
                    <span className="font-mono tabular-nums">{pct}%</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {mins != null ? `${mins} min` : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(attempt.status)}>{formatStatus(attempt.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeTime(attempt.completedAt ?? attempt.startedAt)}
                </td>
                {showActions ? (
                  <td className="px-4 py-3 text-right">
                    {reviewable ? (
                      <Link to={ROUTES.testResults(attempt.id)}>
                        <Button size="sm" variant="outline">
                          View answers
                        </Button>
                      </Link>
                    ) : (
                      <Link to={ROUTES.testAttempt(attempt.id)}>
                        <Button size="sm">Resume</Button>
                      </Link>
                    )}
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
