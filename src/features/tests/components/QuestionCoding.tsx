import { Textarea } from '@/components/ui'
import type { CodingMetadata } from '../types'

interface QuestionCodingProps {
  value: string
  onChange: (value: string) => void
  starterCode?: string | null
  metadata?: CodingMetadata | Record<string, unknown>
  disabled?: boolean
}

export function QuestionCoding({
  value,
  onChange,
  starterCode,
  metadata,
  disabled,
}: QuestionCodingProps) {
  const codingMeta = metadata as CodingMetadata | undefined
  const testCaseCount = codingMeta?.testCases?.length ?? 0

  return (
    <div className="space-y-3">
      {testCaseCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          {testCaseCount} automated test case{testCaseCount === 1 ? '' : 's'} will run on submit.
        </p>
      ) : null}
      <Textarea
        value={value || starterCode || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={16}
        className="font-mono text-sm leading-relaxed"
        spellCheck={false}
      />
    </div>
  )
}
