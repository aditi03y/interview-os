export const ROUTES = {
  dashboard: '/',
  studyPlan: '/study-plan',
  dsaTracker: '/dsa-tracker',
  tests: '/tests',
  testHistory: '/tests/history',
  testViolations: '/tests/violations',
  testAttempt: (attemptId: string) => `/tests/attempt/${attemptId}`,
  testResults: (attemptId: string) => `/tests/attempt/${attemptId}/results`,
  dsaPractice: '/tests/practice',
  dsaPracticeQuestion: (questionId: string) => `/tests/practice/${questionId}`,
  readiness: '/readiness',
  analytics: '/analytics',
  aiMentor: '/ai-mentor',
  githubEvaluator: '/github-evaluator',
  promptLibrary: '/prompt-library',
  settings: '/settings',
  admin: {
    root: '/admin',
    tests: '/admin/tests',
    testNew: '/admin/tests/new',
    testDetail: (testId: string) => `/admin/tests/${testId}`,
    prompts: '/admin/prompts',
    resources: '/admin/resources',
    curriculum: '/admin/curriculum',
  },
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
  },
} as const

export type AppRoute =
  | typeof ROUTES.dashboard
  | typeof ROUTES.studyPlan
  | typeof ROUTES.dsaTracker
  | typeof ROUTES.tests
  | typeof ROUTES.readiness
  | typeof ROUTES.analytics
  | typeof ROUTES.aiMentor
  | typeof ROUTES.githubEvaluator
  | typeof ROUTES.promptLibrary
  | typeof ROUTES.settings

export const ROUTE_TITLES: Record<AppRoute, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.studyPlan]: 'Study Plan',
  [ROUTES.dsaTracker]: 'DSA Tracker',
  [ROUTES.tests]: 'Tests',
  [ROUTES.readiness]: 'Readiness',
  [ROUTES.analytics]: 'Analytics',
  [ROUTES.aiMentor]: 'AI Mentor',
  [ROUTES.githubEvaluator]: 'GitHub Evaluator',
  [ROUTES.promptLibrary]: 'Prompt Library',
  [ROUTES.settings]: 'Settings',
}
