import { useState } from 'react'
import { Check, ChevronDown, Copy, Star } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { CATEGORY_META } from '../lib/categories'
import type { LibraryPrompt } from '../types'

interface PromptCardProps {
  prompt: LibraryPrompt
  isFavorite: boolean
  isCopied: boolean
  onToggleFavorite: (id: string) => void
  onCopy: (id: string, text: string) => void
}

export function PromptCard({
  prompt,
  isFavorite,
  isCopied,
  onToggleFavorite,
  onCopy,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[prompt.category]
  const Icon = meta.icon

  return (
    <article className="rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                  meta.color,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
              {prompt.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="mt-2 text-base font-semibold text-foreground">{prompt.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{prompt.description}</p>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(prompt.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(isFavorite && 'text-amber-500')}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void onCopy(prompt.id, prompt.prompt)}
              aria-label={`Copy prompt: ${prompt.title}`}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted/50"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Hide prompt' : 'View full prompt'}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {expanded ? (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {prompt.prompt}
            </pre>
            <Button
              className="mt-4"
              size="sm"
              onClick={() => void onCopy(prompt.id, prompt.prompt)}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>
        ) : (
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{prompt.prompt}</p>
        )}
      </div>
    </article>
  )
}
