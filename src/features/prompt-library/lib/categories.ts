import {
  BookOpen,
  Brain,
  Code2,
  Database,
  Layers,
  MessageCircle,
  Network,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PromptCategory } from '../types'

export const CATEGORY_META: Record<
  PromptCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  DSA: {
    label: 'DSA',
    icon: Code2,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  OS: {
    label: 'OS',
    icon: Layers,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  DBMS: {
    label: 'DBMS',
    icon: Database,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  CN: {
    label: 'CN',
    icon: Network,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  OOP: {
    label: 'OOP',
    icon: BookOpen,
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  LLD: {
    label: 'LLD',
    icon: Brain,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  Behavioral: {
    label: 'Behavioral',
    icon: MessageCircle,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
}
