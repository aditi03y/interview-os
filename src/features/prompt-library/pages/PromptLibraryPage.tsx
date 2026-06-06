import { Sparkles } from 'lucide-react'
import { Badge, EmptyState, PageHeader } from '@/components/ui'
import { CategoryFilterBar } from '../components/CategoryFilterBar'
import { PromptCard } from '../components/PromptCard'
import { PromptSearch } from '../components/PromptSearch'
import { useCopyPrompt } from '../hooks/useCopyPrompt'
import { usePromptLibrary } from '../hooks/usePromptLibrary'

export function PromptLibraryPage() {
  const {
    prompts,
    search,
    setSearch,
    category,
    setCategory,
    categoryCounts,
    stats,
    toggleFavorite,
    isFavorite,
    clearFilters,
  } = usePromptLibrary()

  const { copiedId, copyPrompt } = useCopyPrompt()

  const hasActiveFilters = search.length > 0 || category !== 'all'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prompt Library"
        description="Reusable AI prompts for DSA, CS fundamentals, LLD, and behavioral interviews."
        actions={
          <Badge variant="primary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            v{stats.version}
          </Badge>
        }
      />

      <PromptSearch
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        resultCount={stats.filtered}
        totalCount={stats.total}
      />

      <CategoryFilterBar
        active={category}
        onChange={setCategory}
        categoryCounts={categoryCounts}
        favoritesCount={stats.favorites}
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="No prompts found"
          description={
            category === 'favorites'
              ? 'Star prompts to add them to your favorites.'
              : 'Try adjusting your search or category filter.'
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isFavorite={isFavorite(prompt.id)}
              isCopied={copiedId === prompt.id}
              onToggleFavorite={toggleFavorite}
              onCopy={copyPrompt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
