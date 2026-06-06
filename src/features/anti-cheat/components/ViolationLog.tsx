import { Badge } from '@/components/ui'
import {
  VIOLATION_EVENT_LABELS,
  type TestViolation,
  type ViolationEventType,
} from '../types'

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function eventVariant(type: ViolationEventType) {
  switch (type) {
    case 'copy_attempt':
    case 'paste_attempt':
      return 'destructive' as const
    case 'tab_switch':
    case 'window_blur':
      return 'warning' as const
    default:
      return 'outline' as const
  }
}

interface ViolationLogProps {
  violations: TestViolation[]
  showAttemptId?: boolean
  emptyMessage?: string
}

export function ViolationLog({
  violations,
  showAttemptId = false,
  emptyMessage = 'No violations recorded.',
}: ViolationLogProps) {
  if (!violations.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Timestamp</th>
            <th className="px-4 py-3 font-medium">Event Type</th>
            {showAttemptId ? (
              <th className="px-4 py-3 font-medium">Attempt</th>
            ) : null}
            <th className="px-4 py-3 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((violation) => (
            <tr key={violation.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-xs tabular-nums">
                {formatTimestamp(violation.occurredAt)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={eventVariant(violation.eventType)}>
                  {VIOLATION_EVENT_LABELS[violation.eventType]}
                </Badge>
              </td>
              {showAttemptId ? (
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {violation.testAttemptId?.slice(0, 8) ?? '—'}
                </td>
              ) : null}
              <td className="px-4 py-3 text-muted-foreground">
                {typeof violation.metadata.idleSeconds === 'number'
                  ? `Idle for ${violation.metadata.idleSeconds}s`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
