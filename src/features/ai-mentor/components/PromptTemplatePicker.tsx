import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PromptTemplate } from '../types'

interface PromptTemplatePickerProps {
  templates: PromptTemplate[]
  onSelect: (prompt: string) => void
  variant?: 'inline' | 'grid'
}

export function PromptTemplatePicker({
  templates,
  onSelect,
  variant = 'inline',
}: PromptTemplatePickerProps) {
  if (variant === 'grid') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            className="h-auto justify-start px-3 py-2 text-left"
            onClick={() => onSelect(template.prompt)}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs">{template.label}</span>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((template) => (
        <Button
          key={template.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(template.prompt)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {template.label}
        </Button>
      ))}
    </div>
  )
}

export function PromptTemplateBar({
  templates,
  onSelect,
  className,
}: PromptTemplatePickerProps & { className?: string }) {
  return (
    <div className={cn('overflow-x-auto border-b border-border px-4 py-2', className)}>
      <div className="flex min-w-max gap-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => onSelect(template.prompt)}
          >
            <Sparkles className="h-3 w-3" />
            {template.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
