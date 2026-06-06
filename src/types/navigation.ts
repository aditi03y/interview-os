import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  description?: string
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}
