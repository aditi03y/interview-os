import { Textarea } from '@/components/ui'

interface QuestionSubjectiveProps {
  value: string
  onChange: (value: string) => void
  rubric?: string | null
  disabled?: boolean
}

export function QuestionSubjective({ value, onChange, rubric, disabled }: QuestionSubjectiveProps) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-3">
      {rubric ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Grading rubric: </span>
          {rubric}
        </p>
      ) : null}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Write your explanation here…"
        rows={10}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">{wordCount} words · Aim for 80+ words for full credit</p>
    </div>
  )
}
