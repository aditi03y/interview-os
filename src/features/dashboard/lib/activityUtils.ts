function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function computeActivityStreak(activityDates: string[]): number {
  if (!activityDates.length) return 0

  const uniqueDays = [...new Set(activityDates.map((d) => d.slice(0, 10)))].sort().reverse()
  const today = toDateKey(new Date())

  let streak = 0
  let cursor = today

  for (const day of uniqueDays) {
    if (day === cursor) {
      streak += 1
      const prev = new Date(cursor)
      prev.setDate(prev.getDate() - 1)
      cursor = toDateKey(prev)
      continue
    }

    if (streak === 0 && day === toDateKey(new Date(Date.now() - 86_400_000))) {
      streak = 1
      const prev = new Date(day)
      prev.setDate(prev.getDate() - 1)
      cursor = toDateKey(prev)
      continue
    }

    break
  }

  return streak
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return new Date(iso).toLocaleDateString()
}
