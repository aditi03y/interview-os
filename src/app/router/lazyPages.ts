import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })),
)
export const StudyPlanPage = lazy(() =>
  import('@/features/study-plan').then((m) => ({ default: m.StudyPlanPage })),
)
export const DsaTrackerPage = lazy(() =>
  import('@/features/dsa-tracker').then((m) => ({ default: m.DsaTrackerPage })),
)
export const TestsPage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.TestsPage })),
)
export const TestTakingPage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.TestTakingPage })),
)
export const TestResultsPage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.TestResultsPage })),
)
export const TestHistoryPage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.TestHistoryPage })),
)
export const DsaPracticePage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.DsaPracticePage })),
)
export const DsaPracticeSessionPage = lazy(() =>
  import('@/features/tests').then((m) => ({ default: m.DsaPracticeSessionPage })),
)
export const ViolationDashboardPage = lazy(() =>
  import('@/features/anti-cheat').then((m) => ({ default: m.ViolationDashboardPage })),
)
export const ReadinessPage = lazy(() =>
  import('@/features/readiness').then((m) => ({ default: m.ReadinessPage })),
)
export const AnalyticsPage = lazy(() =>
  import('@/features/analytics').then((m) => ({ default: m.AnalyticsPage })),
)
export const AiMentorPage = lazy(() =>
  import('@/features/ai-mentor').then((m) => ({ default: m.AiMentorPage })),
)
export const GithubEvaluatorPage = lazy(() =>
  import('@/features/github-evaluator').then((m) => ({
    default: m.GithubEvaluatorPage,
  })),
)
export const PromptLibraryPage = lazy(() =>
  import('@/features/prompt-library').then((m) => ({ default: m.PromptLibraryPage })),
)
export const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage })),
)
export const LoginPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.LoginPage })),
)
export const SignUpPage = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.SignUpPage })),
)
export const AuthLayout = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.AuthLayout })),
)
export const AdminDashboardPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminDashboardPage })),
)
export const AdminTestsPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminTestsPage })),
)
export const AdminTestDetailPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminTestDetailRoute })),
)
export const AdminPromptsPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminPromptsPage })),
)
export const AdminResourcesPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminResourcesPage })),
)
export const AdminCurriculumPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminCurriculumPage })),
)
