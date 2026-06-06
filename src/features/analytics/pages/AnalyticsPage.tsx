import { RefreshCw } from 'lucide-react'
import { Button, EmptyState, PageHeader, QueryErrorState } from '@/components/ui'
import { AnalyticsPageSkeleton } from '@/components/ui/PageSkeletons'
import { useAnalytics } from '../hooks/useAnalytics'
import { MetricScoreCards } from '../components/MetricScoreCards'
import { WeakStrongTopicsPanel } from '../components/WeakStrongTopicsPanel'
import { TrendCharts } from '../components/TrendCharts'
import { TopicRadarChart } from '../components/TopicRadarChart'
import { ActivityHeatmap } from '../components/ActivityHeatmap'

export function AnalyticsPage() {
  const { snapshot, loading, error, hasData, reload } = useAnalytics()

  if (loading) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <QueryErrorState
        title="Analytics unavailable"
        description={error}
        onRetry={() => void reload()}
      />
    )
  }

  if (!snapshot) {
    return (
      <EmptyState
        title="No analytics data"
        description="Start studying, solving DSA problems, and taking tests to see insights."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Readiness, velocity, and topic insights from study time, tests, DSA, and proctoring data."
        actions={
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
        }
      />

      {!hasData ? (
        <EmptyState
          title="Building your profile"
          description="Complete study days, log DSA problems, and take tests to populate charts and scores."
        />
      ) : null}

      <MetricScoreCards snapshot={snapshot} />

      <WeakStrongTopicsPanel
        weakTopics={snapshot.weakTopics}
        strongTopics={snapshot.strongTopics}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicRadarChart data={snapshot.topicRadar} />
        <ActivityHeatmap cells={snapshot.heatmap} />
      </div>

      <section className="space-y-4" aria-labelledby="trend-graphs-heading">
        <h2 id="trend-graphs-heading" className="text-lg font-semibold">
          Trend Graphs
        </h2>
        <TrendCharts trends={snapshot.trends} />
      </section>
    </div>
  )
}
