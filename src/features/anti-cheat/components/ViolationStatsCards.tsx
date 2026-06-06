import { memo } from 'react'
import { MetricCard } from '@/components/ui/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { ViolationSummary } from '../types'
import { VIOLATION_EVENT_LABELS, type ViolationEventType } from '../types'

interface ViolationStatsCardsProps {
  summary: ViolationSummary | null
}

export const ViolationStatsCards = memo(function ViolationStatsCards({
  summary,
}: ViolationStatsCardsProps) {
  const items = [
    { label: 'Total Violations', value: summary?.total ?? 0 },
    { label: 'Last 24 Hours', value: summary?.last24Hours ?? 0 },
    { label: 'Flagged Attempts', value: summary?.flaggedAttempts ?? 0 },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <MetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          valueClassName={item.value > 0 ? 'text-destructive' : undefined}
        />
      ))}
    </div>
  )
})

interface ViolationTypeBreakdownProps {
  summary: ViolationSummary | null
}

export const ViolationTypeBreakdown = memo(function ViolationTypeBreakdown({
  summary,
}: ViolationTypeBreakdownProps) {
  const types = Object.keys(VIOLATION_EVENT_LABELS) as ViolationEventType[]
  const max = Math.max(1, ...types.map((t) => summary?.byType[t] ?? 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Violations by Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {types.map((type) => {
          const count = summary?.byType[type] ?? 0
          const width = `${(count / max) * 100}%`
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{VIOLATION_EVENT_LABELS[type]}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${VIOLATION_EVENT_LABELS[type]} violations`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
})
