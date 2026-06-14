import { Badge, Button, EmptyState, ErrorAlert, PageHeader } from '@/components/ui'
import { StatsGridSkeleton } from '@/components/ui/PageSkeletons'
import { useAuth } from '@/hooks/auth'
import { DayCard } from '../components/DayCard'
import { StudyPlanOverview } from '../components/StudyPlanOverview'
import { useStudyPlan } from '../hooks/useStudyPlan'
import { Map, RefreshCw } from 'lucide-react'

function StudyPlanContent({ userId }: { userId: string }) {
  const {
    days,
    stats,
    planMeta,
    isLoading,
    error,
    expandedDay,
    setExpandedDay,
    toggleItem,
    saveNotes,
    addStudyTime,
    savingDay,
    notesSavingDay,
    reload,
  } = useStudyPlan(userId)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={planMeta?.title ?? 'Study Plan'}
          description={
            planMeta?.description ??
            'Theory, DSA, assignments, and notes — configured from the admin curriculum console.'
          }
          actions={<Badge variant="primary">{stats.totalDays} Days</Badge>}
        />
        <StatsGridSkeleton count={4} className="xl:grid-cols-4" />
        <StatsGridSkeleton count={5} className="grid-cols-1" itemClassName="h-20" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={planMeta?.title ?? 'Study Plan'}
        description={
          planMeta?.description ??
          'Theory, DSA, assignments, and notes — configured from the admin curriculum console.'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void reload()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Badge variant="primary">
              {stats.totalDays} Day{stats.totalDays === 1 ? '' : 's'}
            </Badge>
          </div>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      <StudyPlanOverview stats={stats} />

      {days.length === 0 ? (
        <EmptyState
          icon={<Map className="h-6 w-6" aria-hidden />}
          title="No roadmap data"
          description="The study plan could not be loaded."
        />
      ) : (
        <div className="space-y-4" role="list" aria-label="Study plan days">
          {days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              isExpanded={expandedDay === day.day}
              onToggleExpand={() =>
                setExpandedDay((current) => (current === day.day ? null : day.day))
              }
              onToggleItem={toggleItem}
              onSaveNotes={saveNotes}
              onAddTime={addStudyTime}
              isSaving={savingDay === day.day}
              notesSaving={notesSavingDay === day.day}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function StudyPlanPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Study Plan"
          description="Theory, DSA, assignments, and notes."
        />
        <StatsGridSkeleton count={4} className="xl:grid-cols-4" />
      </div>
    )
  }

  return <StudyPlanContent key={user.id} userId={user.id} />
}
