import { LayoutGrid, Table2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ViewMode } from '../types'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border p-1">
      <Button
        variant={mode === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('table')}
        className={cn('gap-1.5', mode === 'table' && 'shadow-sm')}
      >
        <Table2 className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant={mode === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('kanban')}
        className={cn('gap-1.5', mode === 'kanban' && 'shadow-sm')}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </Button>
    </div>
  )
}
