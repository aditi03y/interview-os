import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore, type Toast, type ToastVariant } from '@/stores/toastStore'

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    container: 'border-success/30 bg-success/10 text-success-foreground',
    icon: CheckCircle2,
    iconClass: 'text-success',
  },
  error: {
    container: 'border-destructive/30 bg-destructive/10 text-destructive',
    icon: XCircle,
    iconClass: 'text-destructive',
  },
  warning: {
    container: 'border-warning/40 bg-warning/15 text-warning-foreground',
    icon: AlertTriangle,
    iconClass: 'text-warning-foreground',
  },
  info: {
    container: 'border-primary/30 bg-primary/10 text-foreground',
    icon: Info,
    iconClass: 'text-primary',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const styles = VARIANT_STYLES[toast.variant]
  const Icon = styles.icon
  const isAssertive = toast.variant === 'error'

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration)
    return () => window.clearTimeout(timer)
  }, [dismiss, toast.duration, toast.id])

  return (
    <div
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        'animate-in slide-in-from-bottom-2 fade-in duration-200',
        styles.container,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', styles.iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        {toast.title ? (
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        ) : null}
        <p className={cn('text-sm', toast.title ? 'mt-0.5 text-muted-foreground' : 'text-foreground')}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
