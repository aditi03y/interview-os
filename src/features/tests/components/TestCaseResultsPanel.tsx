import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { CodingTestCaseResult } from '../types'

interface TestCaseResultsPanelProps {
  results: CodingTestCaseResult[]
  title?: string
}

export function TestCaseResultsPanel({ results, title = 'Test results' }: TestCaseResultsPanelProps) {
  if (!results.length) return null

  const passed = results.filter((r) => r.passed).length

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <Badge variant={passed === results.length ? 'success' : 'warning'}>
          {passed}/{results.length} passed
        </Badge>
      </div>
      <ul className="space-y-2">
        {results.map((result) => (
          <li
            key={result.index}
            className="rounded-md border border-border bg-background p-2 text-xs"
          >
            <div className="mb-1 flex items-center gap-2">
              {result.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className="font-medium">
                Case {result.index + 1}
                {result.hidden ? ' (hidden)' : ''}
              </span>
            </div>
            <p className="text-muted-foreground">
              Input: <code>{JSON.stringify(result.input)}</code>
            </p>
            <p className="text-muted-foreground">
              Expected: <code>{JSON.stringify(result.expected)}</code>
            </p>
            {result.actual !== null && result.actual !== undefined ? (
              <p className="text-muted-foreground">
                Got: <code>{JSON.stringify(result.actual)}</code>
              </p>
            ) : null}
            {result.error ? <p className="text-destructive">{result.error}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
