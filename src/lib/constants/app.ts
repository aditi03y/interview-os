export const APP_NAME = 'InterviewOS'
export const APP_TAGLINE = 'AI-powered SDE Interview Preparation'

export const STORAGE_KEYS = {
  theme: 'interviewos-theme',
  sidebarCollapsed: 'interviewos-sidebar-collapsed',
  promptFavorites: 'interviewos-prompt-favorites',
  studyProgress: (userId: string) => `interviewos-study-progress-${userId}`,
  studyTimer: (userId: string, dayNumber: number) =>
    `interviewos-study-timer-${userId}-${dayNumber}`,
  testTimer: (attemptId: string) => `interviewos-test-timer-${attemptId}`,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const
