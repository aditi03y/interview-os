import { ChevronDown, Clock } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  calculateDayProgressPercent,
  EMPTY_COMPLETED_ITEMS,
  formatStudyTime,
} from '../lib/progress'
import { DaySection } from './DaySection'
import { NotesEditor } from './NotesEditor'
import { PromptTemplates } from './PromptTemplates'
import { TimeTracker } from './TimeTracker'
import type { DayWithProgress, StudySection } from '../types'

interface DayCardProps {
  day: DayWithProgress
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleItem: (dayNumber: number, section: StudySection, itemId: string) => void
  onSaveNotes: (dayNumber: number, notes: string) => Promise<void>
  onAddTime: (dayNumber: number, minutes: number) => Promise<void>
  isSaving: boolean
}

export function DayCard({
  day,
  isExpanded,
  onToggleExpand,
  onToggleItem,
  onSaveNotes,
  onAddTime,
  isSaving,
}: DayCardProps) {
  const completed = day.progress?.completedItems ?? { ...EMPTY_COMPLETED_ITEMS }
  const progressPercent =
    day.progress?.progressPercent ?? calculateDayProgressPercent(day, completed)
  const timeSpent = day.progress?.timeSpentMinutes ?? 0
  const notes = day.progress?.notes ?? ''

  const statusVariant =
    progressPercent === 100 ? 'success' : progressPercent > 0 ? 'warning' : 'outline'

  const statusLabel =
    progressPercent === 100 ? 'Complete' : progressPercent > 0 ? 'In Progress' : 'Not Started'

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30 sm:p-5"
        aria-expanded={isExpanded}
      >
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
            progressPercent === 100
              ? 'bg-success/10 text-success'
              : 'bg-primary/10 text-primary',
          )}
        >
          {day.day}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold sm:text-lg">{day.title}</h3>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{day.subtitle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex min-w-[120px] flex-1 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {progressPercent}%
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatStudyTime(timeSpent)} / ~{formatStudyTime(day.estimatedMinutes)}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {isExpanded ? (
        <div className="space-y-6 border-t border-border p-4 sm:p-5">
          <TimeTracker
            totalMinutes={timeSpent}
            onAddTime={(minutes) => onAddTime(day.day, minutes)}
            isSaving={isSaving}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DaySection
              title="Theory"
              section="theory"
              items={day.theory}
              completedItems={completed}
              onToggle={(section, itemId) => onToggleItem(day.day, section, itemId)}
              disabled={isSaving}
            />
            <DaySection
              title="DSA"
              section="dsa"
              items={day.dsa}
              completedItems={completed}
              onToggle={(section, itemId) => onToggleItem(day.day, section, itemId)}
              disabled={isSaving}
            />
          </div>

          <DaySection
            title="Assignment"
            section="assignment"
            items={day.assignment}
            completedItems={completed}
            onToggle={(section, itemId) => onToggleItem(day.day, section, itemId)}
            disabled={isSaving}
          />

          <PromptTemplates templates={day.promptTemplates} />

          <NotesEditor
            key={`notes-${day.day}-${notes}`}
            dayNumber={day.day}
            initialNotes={notes}
            onSave={(n) => onSaveNotes(day.day, n)}
            isSaving={isSaving}
          />
        </div>
      ) : null}
    </article>
  )
}
