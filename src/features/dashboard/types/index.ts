export interface DashboardActivity {
  id: string
  action: string
  module: string
  timestamp: string
  status: 'completed' | 'in-progress'
}

export interface DashboardSnapshot {
  problemsSolved: number
  problemsThisWeek: number
  currentStreak: number
  testsCompleted: number
  testsPending: number
  readinessScore: number
  recentActivities: DashboardActivity[]
}
