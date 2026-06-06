import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  valueClassName?: string
  iconClassName?: string
  className?: string
  /** Accessible label when value alone is not descriptive */
  ariaLabel?: string
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  valueClassName,
  iconClassName,
  className,
  ariaLabel,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon ? (
          <div
            className={cn(
              'rounded-lg bg-primary/10 p-2 text-primary',
              iconClassName,
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <p
          className={cn('text-2xl font-bold tabular-nums', valueClassName)}
          aria-label={ariaLabel ?? `${label}: ${value}`}
        >
          {value}
        </p>
        {subtext ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
