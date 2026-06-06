export type ScoreTone = 'success' | 'warning' | 'danger' | 'neutral'

export function scoreTone(value: number, thresholds = { good: 75, ok: 50 }): ScoreTone {
  if (value >= thresholds.good) return 'success'
  if (value >= thresholds.ok) return 'warning'
  return 'danger'
}

export function scoreColorClass(value: number, thresholds = { good: 75, ok: 50 }): string {
  const tone = scoreTone(value, thresholds)
  switch (tone) {
    case 'success':
      return 'text-success'
    case 'warning':
      return 'text-warning-foreground'
    case 'danger':
      return 'text-destructive'
    case 'neutral':
      return 'text-muted-foreground'
  }
}

export function velocityColorClass(value: number): string {
  if (value > 10) return 'text-success'
  if (value >= -10) return 'text-warning-foreground'
  return 'text-destructive'
}

export function trendColorClass(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up':
      return 'text-success'
    case 'down':
      return 'text-destructive'
    case 'neutral':
      return 'text-muted-foreground'
  }
}
