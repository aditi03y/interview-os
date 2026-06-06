export type { ThemeMode, ThemeState } from './theme'
export type { NavItem, NavGroup } from './navigation'
export type { ApiError, ApiResult, PaginatedResponse, LoadingState } from './api'
export { isApiSuccess, isApiError } from './api'
export type { NonEmptyArray, DeepReadonly, ValueOf } from './utility'
export { assertNever, isDefined } from './utility'
export type {
  Database,
  UserRow,
  UserUpdate,
  StudyProgressRow,
  DsaProgressRow,
  TestRow,
  NoteRow,
  GithubReviewRow,
  AnalyticsRow,
  StudyDayProgressRow,
  StudyDayProgressInsert,
  StudyDayProgressUpdate,
  StudyStatus,
  Difficulty,
  TestType,
  TestStatus,
} from './database'

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  college: string | null
  targetRole: string | null
  githubUsername: string | null
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  problemsSolved: number
  streakDays: number
  testsCompleted: number
  readinessScore: number
}
