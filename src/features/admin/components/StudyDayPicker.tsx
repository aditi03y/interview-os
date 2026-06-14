import { useStudyPlanContent } from '@/features/study-plan/hooks/useStudyPlanContent'

export type StudyDayPickerPurpose = 'generation' | 'student-filter'

interface StudyDayPickerProps {
  label?: string
  value: number[]
  onChange: (days: number[]) => void
  purpose?: StudyDayPickerPurpose
  required?: boolean
}

const PURPOSE_HINT: Record<StudyDayPickerPurpose, { empty: string; selected: string }> = {
  generation: {
    empty: 'Select study days — AI will generate questions from their theory, DSA, and assignment topics.',
    selected: 'AI generation will use curriculum content from these days.',
  },
  'student-filter': {
    empty: 'No study days selected — all questions in this test are included when students start it.',
    selected: 'Students see questions tagged with these study days only.',
  },
}

export function StudyDayPicker({
  label = 'Study days to include',
  value,
  onChange,
  purpose = 'generation',
  required = false,
}: StudyDayPickerProps) {
  const { days: planDays, loading } = useStudyPlanContent()
  const availableDays = planDays.map((day) => day.day)
  const titleByDay = new Map(planDays.map((day) => [day.day, day.title]))

  const toggle = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day).sort((a, b) => a - b))
      return
    }
    onChange([...value, day].sort((a, b) => a - b))
  }

  const hints = PURPOSE_HINT[purpose]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="text-primary hover:underline disabled:opacity-50"
            disabled={!availableDays.length}
            onClick={() => onChange([...availableDays])}
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
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading study plan days…</p>
      ) : availableDays.length ? (
        <div className="flex flex-wrap gap-2">
          {availableDays.map((day) => {
            const selected = value.includes(day)
            const title = titleByDay.get(day)
            return (
              <button
                key={day}
                type="button"
                title={title ? `Day ${day}: ${title}` : `Day ${day}`}
                onClick={() => toggle(day)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                }`}
              >
                <span>{day}</span>
                {title ? (
                  <span className={`ml-1 max-w-[120px] truncate ${selected ? 'opacity-90' : 'opacity-70'}`}>
                    · {title}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No study plan days configured yet. Add days in Admin → Study Plan Curriculum.
        </p>
      )}
      {value.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Selected: day{value.length === 1 ? '' : 's'}{' '}
          {value
            .map((day) => {
              const title = titleByDay.get(day)
              return title ? `${day} (${title})` : `${day}`
            })
            .join(', ')}
          {' — '}
          {hints.selected}
        </p>
      ) : (
        <p className={`text-xs ${required ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
          {hints.empty}
        </p>
      )}
    </div>
  )
}
