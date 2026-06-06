import { Pencil, Trash2 } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { formatMinutes } from '../lib/stats'
import { STATUS_LABELS, type DsaProblem, type ProblemStatus } from '../types'
import type { Difficulty } from '@/types'

const difficultyVariant: Record<Difficulty, 'success' | 'warning' | 'destructive'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'destructive',
}

interface KanbanCardProps {
  problem: DsaProblem
  onEdit: (problem: DsaProblem) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ProblemStatus) => void
}

function KanbanCard({ problem, onEdit, onDelete, onStatusChange }: KanbanCardProps) {
  return (
    <Card padding="sm" className="group cursor-grab active:cursor-grabbing">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{problem.problemName}</p>
          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(problem)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => void onDelete(problem.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant={difficultyVariant[problem.difficulty]} className="text-[10px]">
            {problem.difficulty}
          </Badge>
          {problem.topic ? (
            <Badge variant="outline" className="text-[10px]">
              {problem.topic}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}</span>
          {problem.timeTakenMinutes != null ? (
            <span>{formatMinutes(problem.timeTakenMinutes)}</span>
          ) : null}
        </div>

        {problem.notes ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{problem.notes}</p>
        ) : null}

        <select
          value={problem.status}
          onChange={(e) => void onStatusChange(problem.id, e.target.value as ProblemStatus)}
          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {(['pending', 'in_progress', 'solved', 'revisit'] as ProblemStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </Card>
  )
}

interface ProblemKanbanViewProps {
  problems: DsaProblem[]
  onEdit: (problem: DsaProblem) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ProblemStatus) => void
}

const COLUMN_STYLES: Record<ProblemStatus, string> = {
  pending: 'border-muted-foreground/20 bg-muted/20',
  in_progress: 'border-warning/30 bg-warning/5',
  solved: 'border-success/30 bg-success/5',
  revisit: 'border-primary/30 bg-primary/5',
}

export function ProblemKanbanView({
  problems,
  onEdit,
  onDelete,
  onStatusChange,
}: ProblemKanbanViewProps) {
  const columns: ProblemStatus[] = ['pending', 'in_progress', 'solved', 'revisit']

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((status) => {
        const columnProblems = problems.filter((p) => p.status === status)
        return (
          <div
            key={status}
            className={cn('rounded-xl border p-3', COLUMN_STYLES[status])}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
              <Badge variant="outline">{columnProblems.length}</Badge>
            </div>
            <div className="space-y-2">
              {columnProblems.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No problems</p>
              ) : (
                columnProblems.map((problem) => (
                  <KanbanCard
                    key={problem.id}
                    problem={problem}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
