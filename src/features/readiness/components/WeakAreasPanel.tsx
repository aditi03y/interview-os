import { AlertTriangle } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { PillarScores, WeakArea } from '../types'

interface PillarBreakdownProps {
  pillars: PillarScores
}

export function PillarBreakdown({ pillars }: PillarBreakdownProps) {
  const items = [
    { label: 'DSA', score: pillars.dsa, key: 'dsa' },
    { label: 'Tests', score: pillars.tests, key: 'tests' },
    { label: 'Study', score: pillars.study, key: 'study' },
    { label: 'GitHub', score: pillars.github, key: 'github' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Input Pillars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-mono tabular-nums">{item.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  item.score >= 70
                    ? 'bg-success'
                    : item.score >= 50
                      ? 'bg-primary'
                      : 'bg-destructive'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface WeakAreasPanelProps {
  areas: WeakArea[]
}

export function WeakAreasPanel({ areas }: WeakAreasPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Weak Areas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!areas.length ? (
          <p className="text-sm text-muted-foreground">No critical weak areas detected. Keep practicing!</p>
        ) : (
          areas.map((area) => (
            <div key={`${area.category}-${area.label}`} className="rounded-lg border border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{area.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {area.category}
                  </Badge>
                  <span className="font-mono text-sm tabular-nums text-destructive">{area.score}%</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{area.recommendation}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
