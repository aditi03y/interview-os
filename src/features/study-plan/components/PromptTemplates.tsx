import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui'
import { toast } from '@/lib/toast'
import type { PromptTemplate } from '../types'

interface PromptTemplatesProps {
  templates: PromptTemplate[]
}

export function PromptTemplates({ templates }: PromptTemplatesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (template: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.prompt)
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Prompt copied to clipboard.')
    } catch {
      toast.error('Could not copy to clipboard.', 'Copy failed')
    }
  }

  if (!templates.length) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">AI Prompt Templates</h4>
      <ul className="space-y-2">
        {templates.map((template) => (
          <li
            key={template.id}
            className="rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{template.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {template.prompt}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCopy(template)}
                aria-label={`Copy prompt: ${template.title}`}
              >
                {copiedId === template.id ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
