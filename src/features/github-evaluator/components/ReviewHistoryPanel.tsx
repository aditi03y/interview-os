import { History } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { GithubReviewHistoryItem } from '../types'

interface ReviewHistoryPanelProps {
  history: GithubReviewHistoryItem[]
  loading: boolean
  activeId?: string
  onSelect: (id: string) => void
}

export function ReviewHistoryPanel({
  history,
  loading,
  activeId,
  onSelect,
}: ReviewHistoryPanelProps) {
  if (loading) {
    return <Skeleton className="h-48" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Past Evaluations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!history.length ? (
          <p className="text-sm text-muted-foreground">No evaluations yet.</p>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                activeId === item.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.owner}/{item.repoName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.reviewedAt).toLocaleDateString()}
                </p>
              </div>
              {item.qualityScore != null ? (
                <Badge variant="outline">{item.qualityScore}</Badge>
              ) : null}
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
