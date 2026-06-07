import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TestTube2 } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import {
  Badge,
  Card,
  CardContent,
  ErrorAlert,
  PageHeader,
  TableSkeleton,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import { fetchAllTestDefinitionsAdmin, updateTestDefinitionAdmin } from '../services/adminTestService'
import type { TestDefinition } from '@/features/tests/types'

type StatusFilter = 'all' | 'active' | 'inactive'

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]

export function AdminTestsPage() {
  const [tests, setTests] = useState<TestDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filteredTests = useMemo(() => {
    if (statusFilter === 'active') return tests.filter((test) => test.isActive)
    if (statusFilter === 'inactive') return tests.filter((test) => !test.isActive)
    return tests
  }, [statusFilter, tests])

  const activeCount = useMemo(() => tests.filter((test) => test.isActive).length, [tests])
  const inactiveCount = tests.length - activeCount

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      const result = await fetchAllTestDefinitionsAdmin()
      if (cancelled) return
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }
      setTests(result.data ?? [])
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleTestActive = async (test: TestDefinition) => {
    const nextActive = !test.isActive
    setTogglingId(test.id)
    const result = await updateTestDefinitionAdmin(test.id, { isActive: nextActive })
    setTogglingId(null)

    if (result.error) {
      toast.error(result.error.message, 'Update failed')
      return
    }

    setTests((prev) =>
      prev.map((item) => (item.id === test.id ? { ...item, isActive: nextActive } : item)),
    )
    toast.success(nextActive ? 'Test is now active.' : 'Test is now inactive.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Tests"
        description="View and edit all test definitions and their question banks."
        actions={
          <Link
            to={ROUTES.admin.testNew}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Test
          </Link>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => window.location.reload()} /> : null}

      {!loading && tests.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-lg border border-border bg-muted/40 p-1"
            role="group"
            aria-label="Filter tests by status"
          >
            {STATUS_FILTERS.map((filter) => {
              const count =
                filter.id === 'all'
                  ? tests.length
                  : filter.id === 'active'
                    ? activeCount
                    : inactiveCount

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === filter.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.label} ({count})
                </button>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredTests.length} of {tests.length} tests
          </p>
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <TestTube2 className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">No tests found.</p>
            <Link
              to={ROUTES.admin.testNew}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create first test
            </Link>
          </CardContent>
        </Card>
      ) : filteredTests.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No {statusFilter === 'active' ? 'active' : 'inactive'} tests. Switch filter to see
            others.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Questions</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{test.title}</td>
                  <td className="px-4 py-3 capitalize">{test.testType}</td>
                  <td className="px-4 py-3">{test.scheduleType.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{test.difficulty ?? '—'}</td>
                  <td className="px-4 py-3">{test.questionCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={test.isActive}
                        disabled={togglingId === test.id}
                        onChange={() => void toggleTestActive(test)}
                        aria-label={`${test.isActive ? 'Deactivate' : 'Activate'} ${test.title}`}
                      />
                      <Badge variant={test.isActive ? 'success' : 'outline'}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={ROUTES.admin.testDetail(test.id)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-accent"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
