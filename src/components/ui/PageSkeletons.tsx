import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

interface StatsGridSkeletonProps {
  count?: number
  className?: string
  itemClassName?: string
}

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
      <Skeleton className="hidden h-4 w-72 sm:block" />
    </div>
  )
}

export function StatsGridSkeleton({
  count = 4,
  className,
  itemClassName = 'h-24',
}: StatsGridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
      aria-busy="true"
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={cn('rounded-xl', itemClassName)} />
      ))}
    </div>
  )
}

export function ChartGridSkeleton({
  count = 2,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-6 lg:grid-cols-2', className)}
      aria-busy="true"
      aria-label="Loading charts"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-72 rounded-xl sm:h-80" />
      ))}
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-label="Loading table">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} className="sm:grid-cols-2 xl:grid-cols-4" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

export function ReadinessPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading readiness scores">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <ChartGridSkeleton />
    </div>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading analytics">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" />
      <ChartGridSkeleton />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

export function TestsPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading tests">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} className="md:grid-cols-4" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="mt-4 grid w-full max-w-md gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  )
}
