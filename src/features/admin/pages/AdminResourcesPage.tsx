import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorAlert,
  Input,
  PageHeader,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import {
  deleteResourceCatalogItem,
  fetchResourceCatalogAdmin,
  upsertResourceCatalogItem,
  type ResourceCatalogItem,
} from '../services/adminResourceService'

const STATUSES = ['active', 'deprecated', 'broken', 'unknown'] as const

export function AdminResourcesPage() {
  const [items, setItems] = useState<ResourceCatalogItem[]>([])
  const [selected, setSelected] = useState<ResourceCatalogItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      const result = await fetchResourceCatalogAdmin()
      if (cancelled) return
      if (result.error) setError(result.error.message)
      else setItems(result.data ?? [])
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
    const result = await fetchResourceCatalogAdmin()
    if (result.error) setError(result.error.message)
    else setItems(result.data ?? [])
    setLoading(false)
  }

  const newItem = () => {
    setSelected({
      id: `resource-${Date.now()}`,
      title: '',
      url: '',
      provider: 'other',
      category: 'general',
      status: 'active',
      fallbackUrl: null,
      fallbackTitle: null,
      updatedAt: new Date().toISOString(),
    })
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    const result = await upsertResourceCatalogItem({
      id: selected.id,
      title: selected.title,
      url: selected.url,
      provider: selected.provider,
      category: selected.category,
      status: selected.status,
      fallbackUrl: selected.fallbackUrl,
      fallbackTitle: selected.fallbackTitle,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message, 'Save failed')
      return
    }
    toast.success('Resource saved.')
    void reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Resources"
        description="Manage URLs and fallbacks used in the study plan resource links."
        actions={
          <Button size="sm" onClick={newItem}>
            <Plus className="h-4 w-4" aria-hidden />
            Add resource
          </Button>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected({ ...item })}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit resource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label="ID"
                  value={selected.id}
                  onChange={(e) => setSelected((s) => (s ? { ...s, id: e.target.value } : s))}
                />
                <Input
                  label="Title"
                  value={selected.title}
                  onChange={(e) => setSelected((s) => (s ? { ...s, title: e.target.value } : s))}
                />
                <Input
                  label="URL"
                  value={selected.url}
                  onChange={(e) => setSelected((s) => (s ? { ...s, url: e.target.value } : s))}
                />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Status</span>
                  <select
                    className="h-10 rounded-lg border border-border bg-background px-3"
                    value={selected.status}
                    onChange={(e) =>
                      setSelected((s) =>
                        s ? { ...s, status: e.target.value as ResourceCatalogItem['status'] } : s,
                      )
                    }
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Fallback URL"
                  value={selected.fallbackUrl ?? ''}
                  onChange={(e) =>
                    setSelected((s) => (s ? { ...s, fallbackUrl: e.target.value || null } : s))
                  }
                />
                <Input
                  label="Fallback title"
                  value={selected.fallbackTitle ?? ''}
                  onChange={(e) =>
                    setSelected((s) =>
                      s ? { ...s, fallbackTitle: e.target.value || null } : s,
                    )
                  }
                />
                <div className="flex gap-2">
                  <Button onClick={() => void save()} isLoading={saving}>
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (!window.confirm('Delete this resource?')) return
                      void deleteResourceCatalogItem(selected.id).then((r) => {
                        if (r.error) toast.error(r.error.message)
                        else {
                          toast.success('Deleted.')
                          setSelected(null)
                          void reload()
                        }
                      })
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
