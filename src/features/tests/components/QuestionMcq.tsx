import { Badge } from '@/components/ui'
import type { McqOption } from '../types'

interface QuestionMcqProps {
  options: McqOption[]
  value: string
  onChange: (optionId: string) => void
  disabled?: boolean
  /** When set with disabled, highlights the student's pick vs the correct option. */
  correctAnswer?: string | null
  showReview?: boolean
}

export function QuestionMcq({
  options,
  value,
  onChange,
  disabled,
  correctAnswer,
  showReview = false,
}: QuestionMcqProps) {
  const review = showReview && disabled && correctAnswer

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = value === option.id
        const isCorrect = review && option.id === correctAnswer
        const isWrongPick = review && selected && option.id !== correctAnswer

        let className =
          'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors '
        if (isCorrect) {
          className += 'border-success bg-success/10'
        } else if (isWrongPick) {
          className += 'border-destructive bg-destructive/10'
        } else if (selected) {
          className += 'border-primary bg-primary/10'
        } else {
          className += 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
        if (disabled) className += ' cursor-default'

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={className}
          >
            <Badge
              variant={isCorrect ? 'success' : isWrongPick ? 'destructive' : selected ? 'default' : 'outline'}
              className="shrink-0 uppercase"
            >
              {option.id}
            </Badge>
            <span className="text-sm">{option.label}</span>
            {isCorrect ? (
              <span className="ml-auto text-xs font-medium text-success">Correct</span>
            ) : null}
            {isWrongPick ? (
              <span className="ml-auto text-xs font-medium text-destructive">Your pick</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
