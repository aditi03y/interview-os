import { useCallback, useEffect, useState } from 'react'
import { Eye, FileText } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface NotesEditorProps {
  dayNumber: number
  initialNotes: string
  onSave: (notes: string) => Promise<void>
  isSaving: boolean
}

function renderMarkdownPreview(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-xs">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br />')
}

export function NotesEditor({ initialNotes, onSave, isSaving }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [dirty, setDirty] = useState(false)

  const handleSave = useCallback(async () => {
    await onSave(notes)
    setDirty(false)
  }, [notes, onSave])

  useEffect(() => {
    if (!dirty) return

    const timer = setTimeout(() => {
      void handleSave()
    }, 1500)

    return () => clearTimeout(timer)
  }, [notes, dirty, handleSave])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Notes</h4>
        <div className="flex gap-1">
          <Button
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
          >
            <FileText className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setDirty(true)
          }}
          onBlur={() => {
            if (dirty) void handleSave()
          }}
          placeholder="Write markdown notes... (supports **bold**, *italic*, `code`, # headings, - lists)"
          className="min-h-[140px] font-mono text-xs"
        />
      ) : (
        <div
          className={cn(
            'min-h-[140px] rounded-lg border border-border bg-muted/20 p-3 text-sm',
            !notes && 'text-muted-foreground italic',
          )}
          dangerouslySetInnerHTML={{
            __html: notes
              ? renderMarkdownPreview(notes)
              : 'No notes yet. Switch to Edit to add markdown notes.',
          }}
        />
      )}

      <p className="text-xs text-muted-foreground">
        {isSaving ? 'Saving...' : dirty ? 'Unsaved changes — auto-saving...' : 'Saved'}
      </p>
    </div>
  )
}
