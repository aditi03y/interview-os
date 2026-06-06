import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  className?: string
  title?: string
}

export function ErrorAlert({
  message,
  onRetry,
  className,
  title = 'Something went wrong',
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p className="mt-0.5 text-sm text-destructive/90">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 border-destructive/30 hover:bg-destructive/10"
        >
          Retry
        </Button>
      ) : null}
    </div>
  )
}
