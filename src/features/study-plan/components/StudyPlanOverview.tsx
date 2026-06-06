import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { formatStudyTime } from '../lib/progress'
import type { StudyPlanStats } from '../types'

interface StudyPlanOverviewProps {
  stats: StudyPlanStats
}

export function StudyPlanOverview({ stats }: StudyPlanOverviewProps) {
  const cards = [
    {
      label: 'Overall Progress',
      value: `${stats.overallPercent}%`,
      icon: TrendingUp,
      sub: `${stats.completedDays}/${stats.totalDays} days complete`,
    },
    {
      label: 'Days Completed',
      value: stats.completedDays,
      icon: CheckCircle2,
      sub: `${stats.inProgressDays} in progress`,
    },
    {
      label: 'Total Study Time',
      value: formatStudyTime(stats.totalTimeMinutes),
      icon: Clock,
      sub: 'Across all days',
    },
    {
      label: 'Roadmap',
      value: `${stats.totalDays} Days`,
      icon: Target,
      sub: 'SDE Intern Track',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Roadmap Progress</span>
          <span className="text-sm font-bold text-primary">{stats.overallPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${stats.overallPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} padding="md">
              <CardContent className="flex items-start justify-between p-0">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
