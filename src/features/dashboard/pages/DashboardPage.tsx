import { Flame, Target, TestTube2, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import { ErrorAlert, PageHeader, QueryErrorState } from '@/components/ui'
import { DashboardPageSkeleton } from '@/components/ui/PageSkeletons'
import { useDashboard } from '../hooks/useDashboard'
import { StatCard } from '../components/StatCard'
import { QuickActions } from '../components/QuickActions'
import { RecentActivity } from '../components/RecentActivity'

export function DashboardPage() {
  const { snapshot, isLoading, error, reload } = useDashboard()

  if (isLoading) {
    return <DashboardPageSkeleton />
  }

  if (error) {
    return (
      <QueryErrorState
        title="Dashboard unavailable"
        description={error}
        onRetry={() => void reload()}
      />
    )
  }

  const stats = [
    {
      id: 'problems',
      label: 'Problems Solved',
      value: snapshot?.problemsSolved ?? 0,
      change:
        (snapshot?.problemsThisWeek ?? 0) > 0
          ? `+${snapshot?.problemsThisWeek} this week`
          : 'No solves this week',
      icon: Target,
      trend: (snapshot?.problemsThisWeek ?? 0) > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: snapshot?.currentStreak ?? 0,
      change: 'days active',
      icon: Flame,
      trend: (snapshot?.currentStreak ?? 0) > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      id: 'tests',
      label: 'Tests Completed',
      value: snapshot?.testsCompleted ?? 0,
      change:
        (snapshot?.testsPending ?? 0) > 0
          ? `${snapshot?.testsPending} in progress`
          : 'All caught up',
      icon: TestTube2,
      trend: 'neutral' as const,
    },
    {
      id: 'readiness',
      label: 'Readiness Score',
      value: `${snapshot?.readinessScore ?? 0}%`,
      change: 'View company breakdown',
      icon: TrendingUp,
      trend:
        (snapshot?.readinessScore ?? 0) >= 65
          ? ('up' as const)
          : (snapshot?.readinessScore ?? 0) >= 45
            ? ('neutral' as const)
            : ('down' as const),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your interview prep at a glance. Track progress and stay on course."
      />

      {!snapshot ? (
        <ErrorAlert
          message="No dashboard data available yet."
          onRetry={() => void reload()}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) =>
          stat.id === 'readiness' ? (
            <Link
              key={stat.id}
              to={ROUTES.readiness}
              className="block rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="View readiness breakdown"
            >
              <StatCard {...stat} />
            </Link>
          ) : (
            <StatCard key={stat.id} {...stat} />
          ),
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={snapshot?.recentActivities ?? []} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
