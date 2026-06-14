import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { useAuth } from '@/hooks/auth'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Spinner,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import { DEFAULT_CODING_LANGUAGE } from '../lib/codingRunner'
import { QuestionCoding } from '../components/QuestionCoding'
import { TestCaseResultsPanel } from '../components/TestCaseResultsPanel'
import type { QuestionAnswer, TestQuestion } from '../types'
import {
  fetchPracticeAttempts,
  fetchPracticeQuestion,
  submitPracticeAttempt,
  type PracticeAttemptRecord,
} from '../services/practiceService'

export function DsaPracticeSessionPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const { user } = useAuth()

  const [question, setQuestion] = useState<TestQuestion | null>(null)
  const [answer, setAnswer] = useState<QuestionAnswer>({ value: '', language: DEFAULT_CODING_LANGUAGE })
  const [history, setHistory] = useState<PracticeAttemptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [latest, setLatest] = useState<PracticeAttemptRecord | null>(null)

  const load = useCallback(async () => {
    if (!user || !questionId) return
    setLoading(true)
    const [qResult, hResult] = await Promise.all([
      fetchPracticeQuestion(questionId),
      fetchPracticeAttempts(user.id, questionId),
    ])
    if (qResult.data) setQuestion(qResult.data)
    if (hResult.data) setHistory(hResult.data)
    setLoading(false)
  }, [questionId, user])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async () => {
    if (!user || !question) return
    if (!answer.value.trim() || !answer.timeComplexity?.trim() || !answer.spaceComplexity?.trim()) {
      toast.error('Submit code plus time and space complexity.')
      return
    }

    setSubmitting(true)
    const result = await submitPracticeAttempt({
      userId: user.id,
      question,
      code: answer.value,
      language: answer.language ?? DEFAULT_CODING_LANGUAGE,
      timeComplexity: answer.timeComplexity,
      spaceComplexity: answer.spaceComplexity,
    })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    setLatest(result.data)
    toast.success('Practice attempt saved with AI analysis.')
    void load()
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!question) {
    return (
      <EmptyState title="Question not found" description="This practice question may have been removed." />
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={ROUTES.dsaPractice}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          All practice questions
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{question.title}</CardTitle>
          {question.body ? (
            <p className="text-sm text-muted-foreground">{question.body}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <QuestionCoding
            answer={answer}
            onChange={(patch) => setAnswer((prev) => ({ ...prev, ...patch }))}
            starterCode={question.starterCode}
            metadata={question.metadata}
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={() => void handleSubmit()} isLoading={submitting}>
              Submit & analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {latest ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Latest attempt — {latest.score}/{latest.maxScore} pts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TestCaseResultsPanel
              results={[...latest.visibleResults, ...latest.hiddenResults]}
              title="All test cases"
            />
            {latest.aiAnalysis ? (
              <div className="rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {latest.aiAnalysis}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI analysis unavailable — check Gemini API key in settings.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Attempt history</h2>
          {history.map((attempt) => (
            <Card key={attempt.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium">
                    {new Date(attempt.createdAt).toLocaleString()}
                  </CardTitle>
                  <Badge variant="outline">
                    {attempt.score}/{attempt.maxScore} · {attempt.language}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <TestCaseResultsPanel
                  results={[...attempt.visibleResults, ...attempt.hiddenResults]}
                />
                <details className="text-sm">
                  <summary className="cursor-pointer text-primary">View submitted code</summary>
                  <pre className="mt-2 overflow-x-auto rounded bg-muted/40 p-3 text-xs">
                    {attempt.code}
                  </pre>
                </details>
                {attempt.aiAnalysis ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary">AI analysis</summary>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                      {attempt.aiAnalysis}
                    </p>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  )
}
