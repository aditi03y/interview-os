import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { Badge, Button, Input, Textarea } from '@/components/ui'
import {
  CODING_LANGUAGES,
  DEFAULT_CODING_LANGUAGE,
  DEFAULT_CODING_LANGUAGES,
  getStarterCode,
  getSupportedLanguages,
  getVisibleTestCases,
  runCodingTestSuite,
  supportsBrowserTestExecution,
  type CodingLanguageId,
} from '../lib/codingRunner'
import type { CodingMetadata, CodingTestCaseResult, QuestionAnswer } from '../types'
import { isCodingMetadata } from '../types'
import { TestCaseResultsPanel } from './TestCaseResultsPanel'

interface QuestionCodingProps {
  answer: QuestionAnswer
  onChange: (patch: Partial<QuestionAnswer> & { value: string }) => void
  starterCode?: string | null
  metadata?: CodingMetadata | Record<string, unknown>
  disabled?: boolean
  showHiddenResults?: boolean
}

export function QuestionCoding({
  answer,
  onChange,
  starterCode,
  metadata,
  disabled,
  showHiddenResults = false,
}: QuestionCodingProps) {
  const meta = isCodingMetadata(metadata ?? {}) ? (metadata as CodingMetadata) : null
  const languages = meta ? getSupportedLanguages(meta) : DEFAULT_CODING_LANGUAGES
  const language =
    (answer.language as CodingLanguageId) ?? languages[0] ?? DEFAULT_CODING_LANGUAGE
  const canRunSamples = supportsBrowserTestExecution(language)

  const [runResults, setRunResults] = useState<CodingTestCaseResult[] | null>(null)
  const [running, setRunning] = useState(false)

  const code = answer.value || (meta ? getStarterCode({ starterCode: starterCode ?? null, metadata: meta }, language) : starterCode ?? '')

  const visibleCases = meta ? getVisibleTestCases(meta) : []

  const displayResults = useMemo(() => {
    if (showHiddenResults && answer.testResults?.length) return answer.testResults
    return runResults
  }, [answer.testResults, runResults, showHiddenResults])

  const handleLanguageChange = (next: CodingLanguageId) => {
    if (!meta) return
    const nextCode = getStarterCode({ starterCode: starterCode ?? null, metadata: meta }, next)
    onChange({ value: nextCode, language: next })
    setRunResults(null)
  }

  const handleRunVisible = () => {
    if (!meta) return
    setRunning(true)
    const run = runCodingTestSuite(code, meta, { includeHidden: false, language })
    setRunResults(run.results)
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Language</span>
          <select
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={language}
            disabled={disabled}
            onChange={(e) => handleLanguageChange(e.target.value as CodingLanguageId)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {CODING_LANGUAGES.find((l) => l.id === lang)?.label ?? lang}
              </option>
            ))}
          </select>
        </label>
        {!showHiddenResults && visibleCases.length > 0 && canRunSamples ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || running}
            onClick={handleRunVisible}
          >
            <Play className="h-3.5 w-3.5" />
            Run sample tests ({visibleCases.length})
          </Button>
        ) : null}
        {!canRunSamples ? (
          <Badge variant="outline" className="text-xs">
            Submit to grade complexity; test cases are stored for review
          </Badge>
        ) : null}
      </div>

      <Textarea
        value={code}
        onChange={(e) => onChange({ value: e.target.value, language })}
        disabled={disabled}
        rows={16}
        className="font-mono text-sm leading-relaxed"
        spellCheck={false}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Time complexity"
          placeholder="e.g. O(n)"
          value={answer.timeComplexity ?? ''}
          onChange={(e) => onChange({ value: code, timeComplexity: e.target.value, language })}
          disabled={disabled}
        />
        <Input
          label="Space complexity"
          placeholder="e.g. O(1)"
          value={answer.spaceComplexity ?? ''}
          onChange={(e) => onChange({ value: code, spaceComplexity: e.target.value, language })}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        1 mark each for correct time and space complexity (validated on submit).
      </p>

      {displayResults?.length ? (
        <TestCaseResultsPanel
          results={displayResults}
          title={showHiddenResults ? 'All test cases (including hidden)' : 'Sample test results'}
        />
      ) : null}

      {!showHiddenResults && meta && getVisibleTestCases(meta).length < (meta.testCases?.length ?? 0) ? (
        <p className="text-xs text-muted-foreground">
          {(meta.testCases?.length ?? 0) - getVisibleTestCases(meta).length} hidden test case
          {(meta.testCases?.length ?? 0) - getVisibleTestCases(meta).length === 1 ? '' : 's'} run on
          submit — results shown after you finish the test.
        </p>
      ) : null}
    </div>
  )
}
