import { FolderGit2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorAlert,
  Input,
  PageHeader,
  Spinner,
} from '@/components/ui'
import { useGithubEvaluator } from '../hooks/useGithubEvaluator'
import { EvaluationReport } from '../components/EvaluationReport'
import { ReviewHistoryPanel } from '../components/ReviewHistoryPanel'

export function GithubEvaluatorPage() {
  const {
    repoUrl,
    setRepoUrl,
    report,
    history,
    loading,
    historyLoading,
    error,
    evaluate,
    loadReview,
  } = useGithubEvaluator()

  return (
    <div className="space-y-8">
      <PageHeader
        title="GitHub Repository Evaluator"
        description="Analyze a public repository for interview-ready quality using GitHub data and Gemini AI."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Evaluate Repository</CardTitle>
            <CardDescription>
              Paste a GitHub URL (e.g. https://github.com/owner/repo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                void evaluate()
              }}
            >
              <Input
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
                disabled={loading}
                aria-label="GitHub repository URL"
              />
              <Button type="submit" isLoading={loading} disabled={!repoUrl.trim()}>
                <FolderGit2 className="h-4 w-4" aria-hidden />
                Evaluate
              </Button>
            </form>
            {error ? <ErrorAlert className="mt-3" message={error} title="Evaluation failed" /> : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Fetches metadata, README, commits, and languages · analyzed by Gemini
            </p>
          </CardContent>
        </Card>

        <ReviewHistoryPanel
          history={history}
          loading={historyLoading}
          activeId={report?.id}
          onSelect={(id) => void loadReview(id)}
        />
      </div>

      {loading ? (
        <div
          className="flex flex-col items-center gap-3 py-16"
          role="status"
          aria-live="polite"
          aria-label="Evaluating repository"
        >
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">
            Fetching repository data and generating AI report…
          </p>
        </div>
      ) : null}

      {!loading && !report && !error ? (
        <EmptyState
          icon={<FolderGit2 className="h-6 w-6" />}
          title="No evaluation yet"
          description="Enter a public GitHub repository URL to get a detailed quality report."
        />
      ) : null}

      {!loading && report ? <EvaluationReport report={report} /> : null}
    </div>
  )
}
