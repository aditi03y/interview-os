import { RefreshCw } from 'lucide-react'
import { Button, EmptyState, PageHeader, QueryErrorState } from '@/components/ui'
import { ReadinessPageSkeleton } from '@/components/ui/PageSkeletons'
import { useReadiness } from '../hooks/useReadiness'
import { OverallScoreHero } from '../components/OverallScoreHero'
import { CompanyScoreGrid } from '../components/CompanyScoreGrid'
import { PillarBreakdown, WeakAreasPanel } from '../components/WeakAreasPanel'
import { RecommendedTopicsPanel } from '../components/RecommendedTopicsPanel'

export function ReadinessPage() {
  const { snapshot, loading, error, reload } = useReadiness()

  if (loading) {
    return <ReadinessPageSkeleton />
  }

  if (error) {
    return (
      <QueryErrorState
        title="Readiness engine unavailable"
        description={error}
        onRetry={() => void reload()}
      />
    )
  }

  if (!snapshot) {
    return (
      <EmptyState
        title="No readiness data"
        description="Log DSA problems, complete tests, and study plan days to generate scores."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interview Readiness Engine"
        description="Company-specific readiness from your DSA, tests, study plan, and GitHub portfolio."
        actions={
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <OverallScoreHero score={snapshot.overallScore} tier={snapshot.overallTier} />
        <PillarBreakdown pillars={snapshot.pillars} />
      </div>

      <CompanyScoreGrid companies={snapshot.companies} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeakAreasPanel areas={snapshot.weakAreas} />
        <RecommendedTopicsPanel topics={snapshot.recommendedTopics} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Last computed {new Date(snapshot.computedAt).toLocaleString()}
      </p>
    </div>
  )
}
