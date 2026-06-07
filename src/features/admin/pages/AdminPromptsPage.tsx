import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorAlert,
  Input,
  PageHeader,
  Textarea,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import { useAuth } from '@/hooks/auth'
import {
  deleteContentPrompt,
  deletePromptLibraryItem,
  fetchContentPrompts,
  fetchPromptLibraryItemsAdmin,
  upsertContentPrompt,
  upsertPromptLibraryItem,
  type ContentPrompt,
  type PromptLibraryItem,
} from '../services/adminContentService'

export function AdminPromptsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'generation' | 'library'>('generation')
  const [prompts, setPrompts] = useState<ContentPrompt[]>([])
  const [library, setLibrary] = useState<PromptLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<ContentPrompt | null>(null)
  const [selectedLibrary, setSelectedLibrary] = useState<PromptLibraryItem | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      const [pResult, lResult] = await Promise.all([
        fetchContentPrompts(),
        fetchPromptLibraryItemsAdmin(),
      ])
      if (cancelled) return
      if (pResult.error) setError(pResult.error.message)
      else setPrompts(pResult.data ?? [])
      if (lResult.data) setLibrary(lResult.data)
      setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const reload = async () => {
    setLoading(true)
    setError(null)
    const [pResult, lResult] = await Promise.all([
      fetchContentPrompts(),
      fetchPromptLibraryItemsAdmin(),
    ])
    if (pResult.error) setError(pResult.error.message)
    else setPrompts(pResult.data ?? [])
    if (lResult.data) setLibrary(lResult.data)
    setLoading(false)
  }

  const saveGenerationPrompt = async () => {
    if (!user || !selectedPrompt) return
    setSaving(true)
    const result = await upsertContentPrompt(user.id, {
      id: selectedPrompt.id,
      category: selectedPrompt.category,
      title: selectedPrompt.title,
      description: selectedPrompt.description,
      promptText: selectedPrompt.promptText,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message, 'Save failed')
      return
    }
    toast.success('Prompt saved.')
    void reload()
  }

  const saveLibraryItem = async () => {
    if (!selectedLibrary) return
    setSaving(true)
    const result = await upsertPromptLibraryItem({
      id: selectedLibrary.id,
      title: selectedLibrary.title,
      category: selectedLibrary.category,
      description: selectedLibrary.description,
      prompt: selectedLibrary.prompt,
      tags: selectedLibrary.tags,
      isPublished: selectedLibrary.isPublished,
      sortOrder: selectedLibrary.sortOrder,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message, 'Save failed')
      return
    }
    toast.success('Library prompt saved.')
    void reload()
  }

  const newLibraryItem = () => {
    setSelectedLibrary({
      id: `custom-${Date.now()}`,
      title: '',
      category: 'General',
      description: '',
      prompt: '',
      tags: [],
      isPublished: true,
      sortOrder: library.length,
      updatedAt: new Date().toISOString(),
    })
    setTab('library')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content & Prompts"
        description="Edit test-generation guidance and manage prompts shown in the Prompt Library."
      />

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === 'generation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('generation')}
        >
          Test generation prompts
        </Button>
        <Button
          variant={tab === 'library' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('library')}
        >
          Prompt library items
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === 'generation' ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Guidance prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {prompts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrompt({ ...p })}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selectedPrompt?.id === p.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </CardContent>
          </Card>

          {selectedPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selectedPrompt.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Title"
                  value={selectedPrompt.title}
                  onChange={(e) =>
                    setSelectedPrompt((p) => (p ? { ...p, title: e.target.value } : p))
                  }
                />
                <Textarea
                  label="Description"
                  value={selectedPrompt.description ?? ''}
                  onChange={(e) =>
                    setSelectedPrompt((p) => (p ? { ...p, description: e.target.value } : p))
                  }
                />
                <Textarea
                  label="Prompt text"
                  value={selectedPrompt.promptText}
                  onChange={(e) =>
                    setSelectedPrompt((p) => (p ? { ...p, promptText: e.target.value } : p))
                  }
                  className="min-h-[200px] font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={() => void saveGenerationPrompt()} isLoading={saving}>
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!window.confirm('Delete this prompt?')) return
                      void deleteContentPrompt(selectedPrompt.id).then((r) => {
                        if (r.error) toast.error(r.error.message)
                        else {
                          toast.success('Deleted.')
                          setSelectedPrompt(null)
                          void reload()
                        }
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">Select a prompt to edit.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Library items</CardTitle>
              <Button size="sm" variant="outline" onClick={newLibraryItem}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {library.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No DB items — students still see bundled JSON prompts until you add items here.
                </p>
              ) : (
                library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLibrary({ ...item })}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selectedLibrary?.id === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {item.title}
                    {!item.isPublished ? (
                      <span className="ml-1 text-xs text-muted-foreground">(draft)</span>
                    ) : null}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {selectedLibrary ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit library prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="ID (unique slug)"
                  value={selectedLibrary.id}
                  onChange={(e) =>
                    setSelectedLibrary((p) => (p ? { ...p, id: e.target.value } : p))
                  }
                />
                <Input
                  label="Title"
                  value={selectedLibrary.title}
                  onChange={(e) =>
                    setSelectedLibrary((p) => (p ? { ...p, title: e.target.value } : p))
                  }
                />
                <Input
                  label="Category"
                  value={selectedLibrary.category}
                  onChange={(e) =>
                    setSelectedLibrary((p) => (p ? { ...p, category: e.target.value } : p))
                  }
                />
                <Textarea
                  label="Description"
                  value={selectedLibrary.description}
                  onChange={(e) =>
                    setSelectedLibrary((p) => (p ? { ...p, description: e.target.value } : p))
                  }
                />
                <Textarea
                  label="Prompt"
                  value={selectedLibrary.prompt}
                  onChange={(e) =>
                    setSelectedLibrary((p) => (p ? { ...p, prompt: e.target.value } : p))
                  }
                  className="min-h-[160px] font-mono text-xs"
                />
                <Input
                  label="Tags (comma-separated)"
                  value={selectedLibrary.tags.join(', ')}
                  onChange={(e) =>
                    setSelectedLibrary((p) =>
                      p
                        ? {
                            ...p,
                            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          }
                        : p,
                    )
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedLibrary.isPublished}
                    onChange={(e) =>
                      setSelectedLibrary((p) =>
                        p ? { ...p, isPublished: e.target.checked } : p,
                      )
                    }
                  />
                  Published (visible in Prompt Library)
                </label>
                <div className="flex gap-2">
                  <Button onClick={() => void saveLibraryItem()} isLoading={saving}>
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!window.confirm('Delete this library item?')) return
                      void deletePromptLibraryItem(selectedLibrary.id).then((r) => {
                        if (r.error) toast.error(r.error.message)
                        else {
                          toast.success('Deleted.')
                          setSelectedLibrary(null)
                          void reload()
                        }
                      })
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">Select or create a library prompt.</p>
          )}
        </div>
      )}
    </div>
  )
}
