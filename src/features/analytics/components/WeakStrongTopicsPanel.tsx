import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { TopicInsight } from '../types'

interface WeakStrongTopicsPanelProps {
  weakTopics: TopicInsight[]
  strongTopics: TopicInsight[]
}

export function WeakStrongTopicsPanel({ weakTopics, strongTopics }: WeakStrongTopicsPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-destructive">Weak Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakTopics.length ? (
            weakTopics.map((topic) => (
              <TopicRow key={topic.topic} topic={topic} variant="weak" />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No weak areas detected — keep going!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-success">Strong Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {strongTopics.length ? (
            strongTopics.map((topic) => (
              <TopicRow key={topic.topic} topic={topic} variant="strong" />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete more DSA problems and study days to identify strengths.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TopicRow({
  topic,
  variant,
}: {
  topic: TopicInsight
  variant: 'weak' | 'strong'
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{topic.topic}</p>
        <p className="text-xs text-muted-foreground">{topic.detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="text-xs capitalize">
          {topic.source}
        </Badge>
        <span
          className={`font-mono text-sm tabular-nums ${
            variant === 'weak' ? 'text-destructive' : 'text-success'
          }`}
        >
          {topic.score}%
        </span>
      </div>
    </div>
  )
}
