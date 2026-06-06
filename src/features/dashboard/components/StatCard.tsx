import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard'
import { scoreColorClass, trendColorClass } from '@/lib/utils/scoreColor'

export interface StatCardProps {
  label: string
  value: string | number
  change: string
  icon: LucideIcon
  trend: 'up' | 'down' | 'neutral'
}

export const StatCard = memo(function StatCard({
  label,
  value,
  change,
  icon,
  trend,
}: StatCardProps) {
  return (
    <MetricCard
      label={label}
      value={value}
      subtext={change}
      icon={icon}
      valueClassName={trendColorClass(trend)}
    />
  )
})

export interface ScoreStatCardProps {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  signed?: boolean
  invert?: boolean
  valueClassName?: string
}

export const ScoreStatCard = memo(function ScoreStatCard({
  label,
  value,
  suffix = '%',
  icon,
  signed = false,
  invert = false,
  valueClassName,
}: ScoreStatCardProps) {
  const colorClass =
    valueClassName ??
    (invert
      ? value > 5
        ? 'text-destructive'
        : 'text-muted-foreground'
      : scoreColorClass(value))

  const displayValue = `${signed && value > 0 ? '+' : ''}${value}${suffix}`

  return (
    <MetricCard
      label={label}
      value={displayValue}
      icon={icon}
      iconClassName={colorClass}
      valueClassName={colorClass}
    />
  )
})
