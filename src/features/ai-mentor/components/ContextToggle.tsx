import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  providerName?: string
  providerConfigured?: boolean
}

export function ContextToggle({
  enabled,
  onChange,
  providerName,
  providerConfigured,
}: ContextToggleProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border accent-primary"
        />
        <div>
          <p className="text-sm font-medium">Inject study context</p>
          <p className="text-xs text-muted-foreground">
            Include your profile, study plan, and DSA progress in the system prompt
          </p>
        </div>
      </label>

      {providerName ? (
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
            providerConfigured
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning-foreground',
          )}
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            Provider: <strong>{providerName}</strong>
            {!providerConfigured ? ' — API key not configured' : ''}
          </span>
        </div>
      ) : null}
    </div>
  )
}
