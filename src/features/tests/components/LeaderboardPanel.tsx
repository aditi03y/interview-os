import { Trophy } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { LeaderboardEntry } from '../types'

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[]
  loading?: boolean
  currentUserId?: string
}

export function LeaderboardPanel({ entries, loading, currentUserId }: LeaderboardPanelProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
        <Trophy className="h-8 w-8 opacity-40" />
        <p>No scores yet. Be the first to complete this test!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const pct = Math.round((entry.score / entry.maxScore) * 100)
        const isCurrentUser = entry.userId === currentUserId

        return (
          <div
            key={`${entry.userId}-${entry.completedAt}`}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
              isCurrentUser ? 'border-primary/50 bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-mono text-sm text-muted-foreground">
                #{entry.rank}
              </span>
              <span className="text-sm font-medium">
                {entry.fullName ?? 'Anonymous'}
                {isCurrentUser ? (
                  <Badge variant="outline" className="ml-2 text-xs">
                    You
                  </Badge>
                ) : null}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono tabular-nums">{pct}%</span>
              {entry.timeSpentSeconds != null ? (
                <span className="text-muted-foreground">
                  {Math.round(entry.timeSpentSeconds / 60)}m
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
