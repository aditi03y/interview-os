import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, FolderGit2, Lightbulb, Sparkles, Target, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { toast } from '@/lib/toast'
import type { RepoEvaluationReport } from '@/features/github-evaluator/types'
import {
  evaluateAssignmentRepo,
  fetchAssignmentEvaluations,
} from '@/features/study-plan/services/assignmentEvaluationService'
import type { AssignmentEvaluation } from '@/features/study-plan/types/assignmentEvaluation'

interface AssignmentEvaluatorProps {
  dayNumber: number
  assignmentId: string
  assignmentTitle: string
  assignmentDescription?: string
}

function ScorePill({ label, score }: { label: string; score: number }) {
  const variant = score >= 75 ? 'success' : score >= 50 ? 'warning' : 'outline'
  return (
    <div className="rounded-lg border border-border bg-background/80 px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{score}</p>
      <Badge variant={variant} className="mt-1 text-[10px]">
        /100
      </Badge>
    </div>
  )
}

function EvaluationSummary({ report }: { report: RepoEvaluationReport }) {
  const assignment = report.assignmentEvaluation
  const primaryScore = assignment?.assignmentAccomplishmentScore ?? report.qualityScore

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary" className="text-sm">
          Assignment: {primaryScore}/100
        </Badge>
        <Badge variant="outline" className="text-sm">
          Repo quality: {report.qualityScore}/100
        </Badge>
      </div>

      {assignment ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ScorePill label="Problem solved" score={assignment.assignmentAccomplishmentScore} />
          <ScorePill label="Requirements" score={assignment.requirementsMetScore} />
          <ScorePill label="Functionality" score={assignment.functionalityScore} />
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>

      {assignment?.accomplishedCriteria.length ? (
        <Card padding="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
              What you accomplished
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {assignment.accomplishedCriteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {assignment?.missingRequirements.length ? (
        <Card padding="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-destructive" aria-hidden />
              Missing or incomplete
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {assignment.missingRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {report.sections.assignmentAccomplishment ? (
        <Card padding="sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" aria-hidden />
              Assignment analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {report.sections.assignmentAccomplishment}
          </CardContent>
        </Card>
      ) : null}

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
  assignmentDescription,
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
      assignmentDescription,
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
      const score =
        result.data.assignmentEvaluation?.assignmentAccomplishmentScore ?? result.data.qualityScore
      toast.success(
        `Assignment accomplishment: ${score}/100 · Repo quality: ${result.data.qualityScore}/100`,
        'Evaluation complete',
      )
    }
    void loadHistory()
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-primary" aria-hidden />
          <h5 className="text-sm font-semibold">Assignment GitHub Evaluation</h5>
        </div>
        <p className="text-xs text-muted-foreground">
          Grades how well your repo solves &ldquo;{assignmentTitle}&rdquo; plus repository quality.
        </p>
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
          Evaluate Assignment
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
                {item.repoUrl} — assignment {item.assignmentAccomplishmentScore}/100 · repo{' '}
                {item.qualityScore}/100 ({new Date(item.reviewedAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
