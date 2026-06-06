import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatMinutes } from '../lib/stats'
import { STATUS_LABELS, type DsaProblem } from '../types'
import type { Difficulty } from '@/types'

const difficultyVariant: Record<Difficulty, 'success' | 'warning' | 'destructive'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'destructive',
}

const statusVariant: Record<DsaProblem['status'], 'outline' | 'warning' | 'success' | 'primary'> = {
  pending: 'outline',
  in_progress: 'warning',
  solved: 'success',
  revisit: 'primary',
}

interface ProblemTableViewProps {
  problems: DsaProblem[]
  onEdit: (problem: DsaProblem) => void
  onDelete: (id: string) => void
}

export function ProblemTableView({ problems, onEdit, onDelete }: ProblemTableViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Problem</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Topic</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Attempts</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Notes</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr
                key={problem.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{problem.problemName}</div>
                  <div className="text-xs text-muted-foreground">{problem.platform}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={difficultyVariant[problem.difficulty]}>
                    {problem.difficulty}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {problem.topic ? (
                    <Badge variant="outline">{problem.topic}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">{problem.attempts}</td>
                <td className="px-4 py-3 tabular-nums">
                  {problem.timeTakenMinutes != null
                    ? formatMinutes(problem.timeTakenMinutes)
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[problem.status]}>
                    {STATUS_LABELS[problem.status]}
                  </Badge>
                </td>
                <td className="max-w-[180px] px-4 py-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {problem.notes || '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {problem.problemUrl ? (
                      <a
                        href={problem.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open problem link"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(problem)}
                      aria-label="Edit problem"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void onDelete(problem.id)}
                      aria-label="Delete problem"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
