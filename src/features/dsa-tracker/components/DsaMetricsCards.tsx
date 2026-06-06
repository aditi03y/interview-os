import { memo } from 'react'
import { Clock, Percent, Target, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard'
import { formatMinutes } from '../lib/stats'
import type { DsaMetrics } from '../types'

interface DsaMetricsCardsProps {
  metrics: DsaMetrics
}

export const DsaMetricsCards = memo(function DsaMetricsCards({ metrics }: DsaMetricsCardsProps) {
  const cards = [
    {
      label: 'Solved Count',
      value: metrics.solvedCount,
      sub: `${metrics.total} total logged`,
      icon: Target,
      accent: 'text-success',
    },
    {
      label: 'Success Rate',
      value: `${metrics.successRate}%`,
      sub: `${metrics.inProgressCount} in progress`,
      icon: Percent,
      accent: 'text-primary',
    },
    {
      label: 'Avg Solve Time',
      value: metrics.averageSolveTimeMinutes > 0 ? formatMinutes(metrics.averageSolveTimeMinutes) : '—',
      sub: 'Among solved problems',
      icon: Clock,
      accent: 'text-foreground',
    },
    {
      label: 'Pending',
      value: metrics.pendingCount,
      sub: 'Not started yet',
      icon: TrendingUp,
      accent: 'text-muted-foreground',
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          subtext={card.sub}
          icon={card.icon}
          valueClassName={card.accent}
        />
      ))}
    </div>
  )
})
