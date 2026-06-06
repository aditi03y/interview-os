import { memo } from 'react'
import {
  Gauge,
  Rocket,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { ScoreStatCard } from '@/features/dashboard/components/StatCard'
import { scoreColorClass, velocityColorClass } from '@/lib/utils/scoreColor'
import type { AnalyticsSnapshot } from '../types'

interface MetricScoreCardsProps {
  snapshot: AnalyticsSnapshot
}

export const MetricScoreCards = memo(function MetricScoreCards({
  snapshot,
}: MetricScoreCardsProps) {
  const cards = [
    {
      label: 'Readiness Score',
      value: snapshot.readinessScore,
      icon: Target,
      color: scoreColorClass(snapshot.readinessScore),
    },
    {
      label: 'Learning Velocity',
      value: snapshot.learningVelocity,
      icon: Rocket,
      color: velocityColorClass(snapshot.learningVelocity),
      signed: true,
    },
    {
      label: 'Confidence Score',
      value: snapshot.confidenceScore,
      icon: Shield,
      color: scoreColorClass(snapshot.confidenceScore),
    },
    {
      label: 'Completion Rate',
      value: snapshot.completionRate,
      icon: Gauge,
      color: scoreColorClass(snapshot.completionRate),
    },
    {
      label: 'Avg Test Score',
      value: snapshot.averageTestScore,
      icon: TrendingUp,
      color: scoreColorClass(snapshot.averageTestScore),
    },
    {
      label: 'Violations',
      value: snapshot.violationCount,
      suffix: '',
      icon: Zap,
      invert: true,
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <ScoreStatCard
          key={card.label}
          label={card.label}
          value={card.value}
          suffix={'suffix' in card ? card.suffix : '%'}
          icon={card.icon}
          signed={'signed' in card ? card.signed : false}
          invert={'invert' in card ? card.invert : false}
          valueClassName={'color' in card ? card.color : undefined}
        />
      ))}
    </div>
  )
})
