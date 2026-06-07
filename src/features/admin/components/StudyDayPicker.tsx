import { STUDY_PLAN_DAYS } from '../lib/testSections'

interface StudyDayPickerProps {
  label?: string
  value: number[]
  onChange: (days: number[]) => void
}

export function StudyDayPicker({ label = 'Study days to include', value, onChange }: StudyDayPickerProps) {
  const toggle = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day).sort((a, b) => a - b))
      return
    }
    onChange([...value, day].sort((a, b) => a - b))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => onChange([...STUDY_PLAN_DAYS])}
          >
            All
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:underline"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {STUDY_PLAN_DAYS.map((day) => {
          const selected = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium transition-colors ${
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
      {value.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Selected: day{value.length === 1 ? '' : 's'} {value.join(', ')} — students see questions
          tagged with these study days only.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          No study days selected — all questions in this test are included when students start it.
        </p>
      )}
    </div>
  )
}
