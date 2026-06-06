import { memo } from 'react'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { formatRelativeTime } from '../lib/activityUtils'
import type { DashboardActivity } from '../types'

interface RecentActivityProps {
  activities: DashboardActivity[]
}

export const RecentActivity = memo(function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest learning sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent activity yet. Start solving problems or take a test.
          </p>
        ) : (
          <ul className="divide-y divide-border" aria-label="Recent activity">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.module} · {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
                <Badge
                  variant={activity.status === 'completed' ? 'success' : 'warning'}
                >
                  {activity.status === 'completed' ? 'Done' : 'In Progress'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})
