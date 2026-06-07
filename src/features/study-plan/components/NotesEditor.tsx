import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Eye, FileText } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface NotesEditorProps {
  dayNumber: number
  onSave: (notes: string) => Promise<void>
  isSaving: boolean
  /** Initial value from server — only used on first mount */
  initialNotes: string
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

function saveSelection(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return null
  return { start: textarea.selectionStart, end: textarea.selectionEnd }
}

function restoreSelection(
  textarea: HTMLTextAreaElement | null,
  selection: { start: number; end: number } | null,
) {
  if (!textarea || !selection) return
  if (document.activeElement !== textarea) {
    textarea.focus({ preventScroll: true })
  }
  textarea.setSelectionRange(selection.start, selection.end)
}

export const NotesEditor = memo(function NotesEditor({
  onSave,
  isSaving,
  initialNotes,
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [dirty, setDirty] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const onSaveRef = useRef(onSave)
  const notesRef = useRef(notes)
  const savingRef = useRef(false)
  const lastPersistedRef = useRef(initialNotes)
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  const persistNotes = useCallback(async () => {
    if (savingRef.current) return

    const value = notesRef.current
    if (value === lastPersistedRef.current) {
      setDirty(false)
      return
    }

    savingRef.current = true
    const selection = saveSelection(textareaRef.current)

    try {
      await onSaveRef.current(value)
      lastPersistedRef.current = value
      setDirty(false)
    } finally {
      savingRef.current = false
      requestAnimationFrame(() => restoreSelection(textareaRef.current, selection))
    }
  }, [])

  useEffect(() => {
    if (!dirty) return

    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null
      void persistNotes()
    }, 2000)

    return () => {
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [notes, dirty, persistNotes])

  const handleBlur = useCallback(() => {
    if (!dirty || savingRef.current) return
    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    void persistNotes()
  }, [dirty, persistNotes])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">Notes</h4>
        <div className="flex gap-1">
          <Button
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            Preview
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <Textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setDirty(true)
          }}
          onBlur={handleBlur}
          placeholder="Write markdown notes... (supports **bold**, *italic*, `code`, # headings, - lists)"
          className="min-h-[140px] font-mono text-xs"
          aria-label="Day notes"
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

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {isSaving ? 'Saving...' : dirty ? 'Unsaved changes — auto-saving...' : 'Saved'}
      </p>
    </div>
  )
})
