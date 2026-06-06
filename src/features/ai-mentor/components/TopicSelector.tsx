import { cn } from '@/lib/utils'
import type { MentorTopic } from '../types'

interface TopicSelectorProps {
  topics: MentorTopic[]
  selected: string
  onChange: (topicId: string) => void
}

export function TopicSelector({ topics, selected, onChange }: TopicSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Topic
      </p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onChange(topic.id)}
            title={topic.description}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              selected === topic.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-accent',
            )}
          >
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  )
}
