import { AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui'

interface TestTimerProps {
  formattedTime: string
  progressPercent: number
  isExpired?: boolean
  isLowTime?: boolean
}

export function TestTimer({
  formattedTime,
  progressPercent,
  isExpired,
  isLowTime,
}: TestTimerProps) {
  const urgent = isLowTime || isExpired

  return (
    <div className="flex items-center gap-3">
      <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:block">
        <div
          className={`h-full transition-all ${urgent ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <Badge variant={urgent ? 'destructive' : 'outline'} className="gap-1.5 font-mono tabular-nums">
        {urgent ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        {formattedTime}
      </Badge>
    </div>
  )
}
