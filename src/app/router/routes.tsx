import type { RouteObject } from 'react-router-dom'
import { AdminRoute, ProtectedRoute, PublicRoute } from '@/components/auth'
import { NotFoundPage, RouteErrorPage } from '@/components/errors'
import { AppLayout } from '@/components/layout'
import { ROUTES } from './paths'
import {
  AiMentorPage,
  ReadinessPage,
  AnalyticsPage,
  AuthLayout,
  DashboardPage,
  DsaTrackerPage,
  GithubEvaluatorPage,
  LoginPage,
  PromptLibraryPage,
  SettingsPage,
  SignUpPage,
  StudyPlanPage,
  TestsPage,
  TestTakingPage,
  TestResultsPage,
  TestHistoryPage,
  DsaPracticePage,
  DsaPracticeSessionPage,
  ViolationDashboardPage,
  AdminDashboardPage,
  AdminTestsPage,
  AdminTestDetailPage,
  AdminPromptsPage,
  AdminResourcesPage,
  AdminCurriculumPage,
} from './lazyPages'

export const appRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: ROUTES.dashboard,
        element: <AppLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: ROUTES.studyPlan.slice(1), element: <StudyPlanPage /> },
          { path: ROUTES.dsaTracker.slice(1), element: <DsaTrackerPage /> },
          { path: ROUTES.tests.slice(1), element: <TestsPage /> },
          { path: ROUTES.testHistory.slice(1), element: <TestHistoryPage /> },
          { path: 'tests/practice', element: <DsaPracticePage /> },
          { path: 'tests/practice/:questionId', element: <DsaPracticeSessionPage /> },
          { path: ROUTES.testViolations.slice(1), element: <ViolationDashboardPage /> },
          { path: 'tests/attempt/:attemptId/results', element: <TestResultsPage /> },
          { path: 'tests/attempt/:attemptId', element: <TestTakingPage /> },
          { path: ROUTES.readiness.slice(1), element: <ReadinessPage /> },
          { path: ROUTES.analytics.slice(1), element: <AnalyticsPage /> },
          { path: ROUTES.aiMentor.slice(1), element: <AiMentorPage /> },
          { path: ROUTES.githubEvaluator.slice(1), element: <GithubEvaluatorPage /> },
          { path: ROUTES.promptLibrary.slice(1), element: <PromptLibraryPage /> },
          { path: ROUTES.settings.slice(1), element: <SettingsPage /> },
          {
            path: ROUTES.admin.root.slice(1),
            element: <AdminRoute />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'tests', element: <AdminTestsPage /> },
              { path: 'tests/new', element: <AdminTestDetailPage /> },
              { path: 'tests/:testId', element: <AdminTestDetailPage /> },
              { path: 'prompts', element: <AdminPromptsPage /> },
              { path: 'resources', element: <AdminResourcesPage /> },
              { path: 'curriculum', element: <AdminCurriculumPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]
