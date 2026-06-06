import { Clock, Play, Shield } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import type { TestDefinition } from '../types'

interface TestCatalogCardProps {
  definition: TestDefinition
  starting: boolean
  disabled: boolean
  onStart: () => void
}

export function TestCatalogCard({ definition, starting, disabled, onStart }: TestCatalogCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{definition.title}</CardTitle>
          <Badge variant="outline">{definition.testType.toUpperCase()}</Badge>
        </div>
        {definition.description ? (
          <CardDescription>{definition.description}</CardDescription>
        ) : null}
        <CardDescription className="flex flex-wrap items-center gap-3 pt-2">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {definition.durationMinutes} min
          </span>
          {definition.questionCount != null ? (
            <span>{definition.questionCount} questions</span>
          ) : null}
          {definition.scheduleType !== 'manual' ? (
            <span className="inline-flex items-center gap-1 text-warning-foreground">
              <Shield className="h-3.5 w-3.5" />
              Timed
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between">
        {definition.difficulty ? (
          <Badge
            variant={
              definition.difficulty === 'Easy'
                ? 'success'
                : definition.difficulty === 'Medium'
                  ? 'warning'
                  : 'destructive'
            }
          >
            {definition.difficulty}
          </Badge>
        ) : (
          <span />
        )}
        <Button size="sm" onClick={onStart} disabled={disabled || starting}>
          <Play className="h-4 w-4" />
          {starting ? 'Starting…' : 'Start'}
        </Button>
      </CardContent>
    </Card>
  )
}
