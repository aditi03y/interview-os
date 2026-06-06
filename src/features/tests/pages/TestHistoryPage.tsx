import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Button, PageHeader, Skeleton } from '@/components/ui'
import { useTests } from '../hooks/useTests'
import { AttemptHistoryTable } from '../components/AttemptHistoryTable'

export function TestHistoryPage() {
  const { attempts, loading, summary } = useTests()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attempt History"
        description={`${summary?.completedAttempts ?? 0} completed · ${summary?.totalAttempts ?? 0} total attempts`}
        actions={
          <Link to={ROUTES.tests}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <AttemptHistoryTable attempts={attempts} />
    </div>
  )
}
