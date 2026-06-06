import { Search, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'

interface PromptSearchProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  resultCount: number
  totalCount: number
}

export function PromptSearch({
  value,
  onChange,
  onClear,
  resultCount,
  totalCount,
}: PromptSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search prompts by title, description, tags..."
          className="pl-9 pr-10"
        />
        {value ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={onClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {resultCount} of {totalCount} prompts
      </p>
    </div>
  )
}
