import {
  BarChart3,
  Bot,
  FolderGit2,
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  Sparkles,
  Target,
  TestTube2,
  TreePine,
} from 'lucide-react'
import type { NavGroup } from '@/types'
import { ROUTES } from '@/app/router/paths'

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: ROUTES.dashboard,
        icon: LayoutDashboard,
        description: 'Overview and quick stats',
      },
      {
        id: 'study-plan',
        label: 'Study Plan',
        path: ROUTES.studyPlan,
        icon: Map,
        description: 'Structured learning roadmap',
      },
      {
        id: 'dsa-tracker',
        label: 'DSA Tracker',
        path: ROUTES.dsaTracker,
        icon: TreePine,
        description: 'Track problems and patterns',
      },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    items: [
      {
        id: 'tests',
        label: 'Tests',
        path: ROUTES.tests,
        icon: TestTube2,
        description: 'MCQ and coding assessments',
      },
      {
        id: 'readiness',
        label: 'Readiness',
        path: ROUTES.readiness,
        icon: Target,
        description: 'Company-wise interview readiness scores',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: ROUTES.analytics,
        icon: BarChart3,
        description: 'Progress and insights',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      {
        id: 'ai-mentor',
        label: 'AI Mentor',
        path: ROUTES.aiMentor,
        icon: Bot,
        description: 'Personalized AI guidance',
      },
      {
        id: 'prompt-library',
        label: 'Prompt Library',
        path: ROUTES.promptLibrary,
        icon: Sparkles,
        description: 'Reusable AI interview prompts',
      },
      {
        id: 'github-evaluator',
        label: 'GitHub Evaluator',
        path: ROUTES.githubEvaluator,
        icon: FolderGit2,
        description: 'Analyze your projects',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        path: ROUTES.settings,
        icon: Settings,
        description: 'Profile and preferences',
      },
    ],
  },
]

export const ADMIN_NAV_GROUP: NavGroup = {
  id: 'admin',
  label: 'Admin',
  items: [
    {
      id: 'admin-console',
      label: 'Admin Console',
      path: ROUTES.admin.root,
      icon: Shield,
      description: 'Manage tests, prompts, and content',
    },
  ],
}

export function getNavigationGroups(isAdmin: boolean): NavGroup[] {
  if (!isAdmin) return NAVIGATION_GROUPS
  return [...NAVIGATION_GROUPS, ADMIN_NAV_GROUP]
}

export const ALL_NAV_ITEMS = NAVIGATION_GROUPS.flatMap((group) => group.items)
