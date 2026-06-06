import { Badge } from '@/components/ui'

interface ScoreGaugeProps {
  label: string
  score: number
  description?: string
}

export function ScoreGauge({ label, score, description }: ScoreGaugeProps) {
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${score * 3.6}deg, var(--muted) 0deg)`,
        }}
      >
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-card">
          <span className="text-xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Badge variant={scoreBadgeVariant(score)}>{scoreLabel(score)}</Badge>
    </div>
  )
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--success)'
  if (score >= 50) return 'var(--warning-foreground, #eab308)'
  return 'var(--destructive)'
}

function scoreBadgeVariant(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'destructive'
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Fair'
  return 'Needs Work'
}
