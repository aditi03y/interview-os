import { useCallback, useEffect, useState } from 'react'
import { FolderGit2, Lightbulb, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { toast } from '@/lib/toast'
import {
  evaluateAssignmentRepo,
  fetchAssignmentEvaluations,
} from '@/features/study-plan/services/assignmentEvaluationService'
import type { AssignmentEvaluation } from '@/features/study-plan/types/assignmentEvaluation'
import type { RepoEvaluationReport } from '@/features/github-evaluator/types'

interface AssignmentEvaluatorProps {
  dayNumber: number
  assignmentId: string
  assignmentTitle: string
}

function EvaluationSummary({ report }: { report: RepoEvaluationReport }) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold">
        Score: <span className="text-primary">{report.qualityScore}/100</span>
      </p>

      {report.strengths.length > 0 ? (
        <Card padding="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-success" aria-hidden />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {report.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {report.improvements.length > 0 ? (
        <Card padding="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-warning-foreground" aria-hidden />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {report.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export function AssignmentEvaluator({
  dayNumber,
  assignmentId,
  assignmentTitle,
}: AssignmentEvaluatorProps) {
  const { user } = useAuth()
  const [repoUrl, setRepoUrl] = useState('')
  const [history, setHistory] = useState<AssignmentEvaluation[]>([])
  const [report, setReport] = useState<RepoEvaluationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    const result = await fetchAssignmentEvaluations(user.id, dayNumber, assignmentId)
    if (result.data) setHistory(result.data)
    setHistoryLoading(false)
  }, [assignmentId, dayNumber, user])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      await loadHistory()
      if (cancelled) return
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [loadHistory])

  const handleEvaluate = async () => {
    if (!user || !repoUrl.trim()) return
    setLoading(true)
    setError(null)

    const result = await evaluateAssignmentRepo({
      userId: user.id,
      dayNumber,
      assignmentId,
      assignmentTitle,
      repoUrl,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      toast.error(result.error.message, 'Evaluation failed')
      return
    }

    if (result.data) {
      setReport(result.data)
      toast.success(
        `Assignment scored ${result.data.qualityScore}/100.`,
        'Evaluation complete',
      )
    }
    void loadHistory()
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <FolderGit2 className="h-4 w-4 text-primary" aria-hidden />
        <h5 className="text-sm font-semibold">GitHub Assignment Evaluation</h5>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          aria-label={`GitHub URL for ${assignmentTitle}`}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={() => void handleEvaluate()}
          isLoading={loading}
          disabled={!repoUrl.trim()}
        >
          Evaluate Repository
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {report ? <EvaluationSummary report={report} /> : null}

      {!historyLoading && history.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Evaluation history</p>
          <ul className="space-y-1">
            {history.slice(0, 5).map((item) => (
              <li key={item.id} className="text-xs text-muted-foreground">
                {item.repoUrl} — {item.qualityScore}/100 (
                {new Date(item.reviewedAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
