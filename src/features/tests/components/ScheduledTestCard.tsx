import { CalendarClock, CheckCircle2, Play } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { ScheduledTestSlot } from '../types'

interface ScheduledTestCardProps {
  slot: ScheduledTestSlot
  starting: boolean
  disabled: boolean
  onStart: () => void
}

export function ScheduledTestCard({ slot, starting, disabled, onStart }: ScheduledTestCardProps) {
  const { definition, dueLabel, completedToday } = slot

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <Badge variant="default">Scheduled</Badge>
              {completedToday ? (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Done today
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-base">{definition.title}</CardTitle>
            <CardDescription className="mt-1">{dueLabel}</CardDescription>
          </div>
          <Badge variant="outline">{definition.testType.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{definition.durationMinutes} min</span>
        <Button size="sm" onClick={onStart} disabled={disabled || starting || completedToday}>
          <Play className="h-4 w-4" />
          {completedToday ? 'Completed' : starting ? 'Starting…' : 'Start'}
        </Button>
      </CardContent>
    </Card>
  )
}
