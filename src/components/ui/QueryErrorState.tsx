import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

export interface QueryErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function QueryErrorState({
  title = 'Unable to load data',
  description,
  onRetry,
}: QueryErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<AlertCircle className="h-10 w-10 text-destructive" aria-hidden />}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        ) : undefined
      }
    />
  )
}
