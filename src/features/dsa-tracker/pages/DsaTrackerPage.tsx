import { Plus, Search } from 'lucide-react'
import {
  Button,
  EmptyState,
  ErrorAlert,
  Input,
  PageHeader,
} from '@/components/ui'
import { StatsGridSkeleton } from '@/components/ui/PageSkeletons'
import { DsaCharts } from '../components/DsaCharts'
import { DsaMetricsCards } from '../components/DsaMetricsCards'
import { ProblemFormModal } from '../components/ProblemFormModal'
import { ProblemKanbanView } from '../components/ProblemKanbanView'
import { ProblemTableView } from '../components/ProblemTableView'
import { ViewToggle } from '../components/ViewToggle'
import { DIFFICULTIES } from '../types'
import { useDsaTracker } from '../hooks/useDsaTracker'

export function DsaTrackerPage() {
  const {
    problems,
    isLoading,
    isSaving,
    error,
    viewMode,
    setViewMode,
    search,
    setSearch,
    difficultyFilter,
    setDifficultyFilter,
    topicFilter,
    setTopicFilter,
    topics,
    metrics,
    dailySolves,
    topicDistribution,
    difficultyBreakdown,
    formOpen,
    editingProblem,
    openCreateForm,
    openEditForm,
    closeForm,
    saveProblem,
    changeStatus,
    removeProblem,
    reload,
  } = useDsaTracker()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="DSA Tracker" description="Log problems, track patterns, and monitor your solve rate." />
        <StatsGridSkeleton count={4} className="xl:grid-cols-4" />
        <StatsGridSkeleton count={2} className="lg:grid-cols-2" itemClassName="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="DSA Tracker"
        description="Log problems, track patterns, and monitor your solve rate."
        actions={
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Problem
          </Button>
        }
      />

      {error ? (
        <ErrorAlert message={error} onRetry={() => void reload()} />
      ) : null}

      <DsaMetricsCards metrics={metrics} />

      <DsaCharts
        dailySolves={dailySolves}
        topicDistribution={topicDistribution}
        difficultyBreakdown={difficultyBreakdown}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search problems, topics, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search problems"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Filter by topic"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {problems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description={
            search || difficultyFilter !== 'all' || topicFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Add your first DSA problem to start tracking progress.'
          }
          action={
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" aria-hidden />
              Add Problem
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <ProblemTableView
            problems={problems}
            onEdit={openEditForm}
            onDelete={removeProblem}
          />
        </div>
      ) : (
        <ProblemKanbanView
          problems={problems}
          onEdit={openEditForm}
          onDelete={removeProblem}
          onStatusChange={changeStatus}
        />
      )}

      <ProblemFormModal
        open={formOpen}
        onClose={closeForm}
        onSave={saveProblem}
        problem={editingProblem}
        isSaving={isSaving}
      />
    </div>
  )
}
