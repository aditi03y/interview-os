import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROMPT_CATEGORIES } from '../types'
import { CATEGORY_META } from '../lib/categories'
import type { CategoryFilter, PromptCategory } from '../types'

interface CategoryFilterBarProps {
  active: CategoryFilter
  onChange: (category: CategoryFilter) => void
  categoryCounts: Record<PromptCategory, number>
  favoritesCount: number
}

export function CategoryFilterBar({
  active,
  onChange,
  categoryCounts,
  favoritesCount,
}: CategoryFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        label="All"
        count={Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
        isActive={active === 'all'}
        onClick={() => onChange('all')}
      />

      <FilterChip
        label="Favorites"
        count={favoritesCount}
        isActive={active === 'favorites'}
        onClick={() => onChange('favorites')}
        icon={<Star className="h-3.5 w-3.5" />}
      />

      {PROMPT_CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat]
        const Icon = meta.icon
        return (
          <FilterChip
            key={cat}
            label={meta.label}
            count={categoryCounts[cat]}
            isActive={active === cat}
            onClick={() => onChange(cat)}
            icon={<Icon className="h-3.5 w-3.5" />}
          />
        )
      })}
    </div>
  )
}

function FilterChip({
  label,
  count,
  isActive,
  onClick,
  icon,
}: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-accent',
      )}
    >
      {icon}
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-xs',
          isActive ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  )
}
