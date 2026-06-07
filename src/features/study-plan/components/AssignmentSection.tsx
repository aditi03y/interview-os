import { CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { isItemCompleted } from '../lib/progress'
import { ResourceLinks } from './ResourceLinks'
import { AssignmentEvaluator } from './AssignmentEvaluator'
import type { CompletedItems, RoadmapItem, StudySection } from '../types'

interface AssignmentSectionProps {
  dayNumber: number
  items: RoadmapItem[]
  completedItems: CompletedItems
  onToggle: (section: StudySection, itemId: string) => void
  disabled?: boolean
}

export function AssignmentSection({
  dayNumber,
  items,
  completedItems,
  onToggle,
  disabled,
}: AssignmentSectionProps) {
  const section: StudySection = 'assignment'
  const doneCount = items.filter((item) =>
    isItemCompleted(completedItems, section, item.id),
  ).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Assignment</h4>
        <Badge variant="outline">
          {doneCount}/{items.length}
        </Badge>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const done = isItemCompleted(completedItems, section, item.id)

          return (
            <li
              key={item.id}
              className={cn(
                'rounded-lg border border-border p-3 transition-colors',
                done ? 'border-success/20 bg-success/5' : 'hover:bg-muted/30',
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggle(section, item.id)}
                className="flex w-full items-start gap-3 text-left disabled:opacity-50"
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      done && 'text-muted-foreground line-through',
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </button>

              <ResourceLinks resources={item.resources} />

              <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <AssignmentEvaluator
                  dayNumber={dayNumber}
                  assignmentId={item.id}
                  assignmentTitle={item.title}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
