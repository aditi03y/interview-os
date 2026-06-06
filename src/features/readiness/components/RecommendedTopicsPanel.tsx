import { BookOpen, Target } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { COMPANY_MAP } from '../data/companies'
import type { RecommendedTopic } from '../types'

interface RecommendedTopicsPanelProps {
  topics: RecommendedTopic[]
}

export function RecommendedTopicsPanel({ topics }: RecommendedTopicsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          Recommended Next Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!topics.length ? (
          <p className="text-sm text-muted-foreground">
            Complete more DSA problems and study days to unlock personalized recommendations.
          </p>
        ) : (
          topics.map((topic) => (
            <div key={topic.topic} className="rounded-lg border border-border px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{topic.topic}</span>
                </div>
                <Badge
                  variant={
                    topic.priority === 'high'
                      ? 'destructive'
                      : topic.priority === 'medium'
                        ? 'warning'
                        : 'outline'
                  }
                >
                  {topic.priority}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{topic.reason}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {topic.relatedCompanies.map((id) => (
                  <Badge key={id} variant="outline" className="text-xs">
                    {COMPANY_MAP.get(id)?.name ?? id}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
