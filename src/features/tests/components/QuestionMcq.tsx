import { Badge } from '@/components/ui'
import type { McqOption } from '../types'

interface QuestionMcqProps {
  options: McqOption[]
  value: string
  onChange: (optionId: string) => void
  disabled?: boolean
}

export function QuestionMcq({ options, value, onChange, disabled }: QuestionMcqProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              selected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <Badge variant={selected ? 'default' : 'outline'} className="shrink-0 uppercase">
              {option.id}
            </Badge>
            <span className="text-sm">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
