import { AlertTriangle, Maximize2, ShieldAlert } from 'lucide-react'
import { Badge, Button } from '@/components/ui'

interface ProctorBannerProps {
  violationCount: number
  isFullscreen: boolean
  onEnterFullscreen: () => void
}

export function ProctorBanner({
  violationCount,
  isFullscreen,
  onEnterFullscreen,
}: ProctorBannerProps) {
  const flagged = violationCount > 0

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
        flagged
          ? 'border-destructive/50 bg-destructive/10'
          : 'border-warning/40 bg-warning/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {flagged ? (
          <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {flagged ? 'Proctoring violations detected' : 'Proctored test — activity is monitored'}
          </p>
          <p className="text-xs text-muted-foreground">
            Tab switches, copy/paste, idle time, and fullscreen exits are logged.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {violationCount > 0 ? (
          <Badge variant="destructive">{violationCount} violation{violationCount === 1 ? '' : 's'}</Badge>
        ) : null}
        {!isFullscreen ? (
          <Button variant="outline" size="sm" onClick={onEnterFullscreen}>
            <Maximize2 className="h-4 w-4" />
            Enter Fullscreen
          </Button>
        ) : (
          <Badge variant="success">Fullscreen</Badge>
        )}
      </div>
    </div>
  )
}
