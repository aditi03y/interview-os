import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
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
  Spinner,
  Textarea,
} from '@/components/ui'
import { DraftNumberInput } from '@/components/ui/DraftNumberInput'
import { toast } from '@/lib/toast'
import { invalidateStudyPlanContentCache } from '@/features/study-plan/lib/studyPlanContentCache'
import type { PromptTemplate, ResourceLink, RoadmapDay, RoadmapItem, StudySection } from '@/features/study-plan/types'
import {
  deleteItemResource,
  deleteStudyDay,
  deleteStudyItem,
  deleteStudyPrompt,
  fetchCurriculumAdmin,
  renameStudyDayTitle,
  renumberStudyPlanDays,
  updatePlanMeta,
  upsertItemResource,
  upsertStudyDay,
  upsertStudyItem,
  upsertStudyPrompt,
  type AdminStudyPlan,
} from '../services/adminCurriculumService'

const SECTIONS: StudySection[] = ['theory', 'dsa', 'assignment']

function sectionItems(day: RoadmapDay, section: StudySection): RoadmapItem[] {
  return day[section]
}

export function AdminCurriculumPage() {
  const [plan, setPlan] = useState<AdminStudyPlan | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [planTitle, setPlanTitle] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [dayDraft, setDayDraft] = useState<RoadmapDay | null>(null)
  const [renumbering, setRenumbering] = useState(false)
  const [renamingDay, setRenamingDay] = useState<number | null>(null)
  const [renameDraft, setRenameDraft] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await fetchCurriculumAdmin()
    if (result.error) {
      setError(result.error.message)
      setPlan(null)
      setLoading(false)
      return
    }
    const data = result.data!
    setPlan(data)
    setPlanTitle(data.title)
    setPlanDescription(data.description ?? '')
    const firstDay = data.days[0]?.day ?? null
    setSelectedDay((current) => current ?? firstDay)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const activeDay = useMemo(() => {
    if (!plan || selectedDay == null) return null
    return plan.days.find((d) => d.day === selectedDay) ?? null
  }, [plan, selectedDay])

  useEffect(() => {
    if (activeDay) setDayDraft(structuredClone(activeDay))
    else setDayDraft(null)
  }, [activeDay])

  const handleRenumberDays = async () => {
    setRenumbering(true)
    const result = await renumberStudyPlanDays()
    setRenumbering(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    invalidateStudyPlanContentCache()
    if (result.data && result.data > 0) {
      toast.success(`Renumbered ${result.data} day${result.data === 1 ? '' : 's'} to close gaps (now 1…N).`)
    } else {
      toast.success('Days are already numbered sequentially — no changes needed.')
    }
    setSelectedDay(null)
    setRenamingDay(null)
    void reload()
  }

  const startRenameDay = (day: RoadmapDay, event: MouseEvent) => {
    event.stopPropagation()
    setRenamingDay(day.day)
    setRenameDraft(day.title)
  }

  const commitRenameDay = async (dayNumber: number) => {
    const title = renameDraft.trim()
    if (!title) {
      toast.error('Day title cannot be empty.')
      return
    }
    setSaving(true)
    const result = await renameStudyDayTitle(dayNumber, title)
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    invalidateStudyPlanContentCache()
    setRenamingDay(null)
    toast.success(`Day ${dayNumber} renamed.`)
    void reload()
  }

  const savePlanMeta = async () => {
    setSaving(true)
    const result = await updatePlanMeta({ title: planTitle, description: planDescription })
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    invalidateStudyPlanContentCache()
    toast.success('Plan details saved.')
    void reload()
  }

  const saveDay = async () => {
    if (!dayDraft) return
    setSaving(true)

    const dayResult = await upsertStudyDay({
      dayNumber: dayDraft.day,
      title: dayDraft.title,
      subtitle: dayDraft.subtitle,
      estimatedMinutes: dayDraft.estimatedMinutes,
      sortOrder: dayDraft.day,
    })
    if (dayResult.error) {
      setSaving(false)
      toast.error(dayResult.error.message)
      return
    }

    for (const section of SECTIONS) {
      for (let index = 0; index < dayDraft[section].length; index++) {
        const item = dayDraft[section][index]!
        const itemResult = await upsertStudyItem(dayDraft.day, {
          id: item.id,
          section,
          title: item.title,
          description: item.description ?? null,
          sortOrder: index,
        })
        if (itemResult.error) {
          setSaving(false)
          toast.error(itemResult.error.message)
          return
        }

        for (let rIndex = 0; rIndex < (item.resources?.length ?? 0); rIndex++) {
          const resource = item.resources![rIndex]!
          const resourceResult = await upsertItemResource(item.id, {
            id: resource.id,
            title: resource.title,
            url: resource.url,
            resourceType: resource.type ?? null,
            sortOrder: rIndex,
          })
          if (resourceResult.error) {
            setSaving(false)
            toast.error(resourceResult.error.message)
            return
          }
        }
      }
    }

    for (let index = 0; index < dayDraft.promptTemplates.length; index++) {
      const prompt = dayDraft.promptTemplates[index]!
      const promptResult = await upsertStudyPrompt(dayDraft.day, {
        id: prompt.id,
        title: prompt.title,
        promptText: prompt.prompt,
        sortOrder: index,
      })
      if (promptResult.error) {
        setSaving(false)
        toast.error(promptResult.error.message)
        return
      }
    }

    setSaving(false)
    invalidateStudyPlanContentCache()
    toast.success(`Day ${dayDraft.day} saved.`)
    void reload()
  }

  const addDay = async () => {
    const nextDay = (plan?.days.at(-1)?.day ?? 0) + 1
    setSaving(true)
    const result = await upsertStudyDay({
      dayNumber: nextDay,
      title: `Day ${nextDay}`,
      subtitle: '',
      estimatedMinutes: 180,
      sortOrder: nextDay,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    invalidateStudyPlanContentCache()
    setSelectedDay(nextDay)
    void reload()
  }

  const removeDay = async (dayNumber: number) => {
    if (
      !window.confirm(
        `Delete day ${dayNumber} and all its content? Later days will be renumbered (e.g. day ${dayNumber + 1} becomes day ${dayNumber}).`,
      )
    ) {
      return
    }
    setSaving(true)
    const result = await deleteStudyDay(dayNumber)
    setSaving(false)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    invalidateStudyPlanContentCache()
    setSelectedDay(null)
    void reload()
  }

  const updateItem = (section: StudySection, index: number, patch: Partial<RoadmapItem>) => {
    if (!dayDraft) return
    setDayDraft({
      ...dayDraft,
      [section]: dayDraft[section].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    })
  }

  const addItem = (section: StudySection) => {
    if (!dayDraft) return
    const id = `d${dayDraft.day}-${section[0]}${dayDraft[section].length + 1}`
    setDayDraft({
      ...dayDraft,
      [section]: [
        ...dayDraft[section],
        { id, title: 'New item', description: '', resources: [] },
      ],
    })
  }

  const removeItem = async (section: StudySection, index: number) => {
    if (!dayDraft) return
    const item = dayDraft[section][index]
    if (!item) return
    if (plan?.days.some((d) => d.day === dayDraft.day)) {
      await deleteStudyItem(item.id)
    }
    setDayDraft({
      ...dayDraft,
      [section]: dayDraft[section].filter((_, i) => i !== index),
    })
  }

  const addResource = (section: StudySection, itemIndex: number) => {
    if (!dayDraft) return
    const item = dayDraft[section][itemIndex]
    if (!item) return
    const resource: ResourceLink = {
      id: `${item.id}-r${(item.resources?.length ?? 0) + 1}`,
      title: 'Resource',
      url: 'https://',
      type: 'article',
    }
    updateItem(section, itemIndex, {
      resources: [...(item.resources ?? []), resource],
    })
  }

  const updateResource = (
    section: StudySection,
    itemIndex: number,
    resourceIndex: number,
    patch: Partial<ResourceLink>,
  ) => {
    if (!dayDraft) return
    const item = dayDraft[section][itemIndex]
    if (!item) return
    const resources = (item.resources ?? []).map((r, i) =>
      i === resourceIndex ? { ...r, ...patch } : r,
    )
    updateItem(section, itemIndex, { resources })
  }

  const removeResource = async (
    section: StudySection,
    itemIndex: number,
    resourceIndex: number,
  ) => {
    if (!dayDraft) return
    const item = dayDraft[section][itemIndex]
    const resource = item?.resources?.[resourceIndex]
    if (resource && plan?.days.some((d) => d.day === dayDraft.day)) {
      await deleteItemResource(resource.id)
    }
    updateItem(section, itemIndex, {
      resources: (item?.resources ?? []).filter((_, i) => i !== resourceIndex),
    })
  }

  const addPrompt = () => {
    if (!dayDraft) return
    const prompt: PromptTemplate = {
      id: `d${dayDraft.day}-p${dayDraft.promptTemplates.length + 1}`,
      title: 'New prompt',
      prompt: '',
    }
    setDayDraft({ ...dayDraft, promptTemplates: [...dayDraft.promptTemplates, prompt] })
  }

  const updatePrompt = (index: number, patch: Partial<PromptTemplate>) => {
    if (!dayDraft) return
    setDayDraft({
      ...dayDraft,
      promptTemplates: dayDraft.promptTemplates.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    })
  }

  const removePrompt = async (index: number) => {
    if (!dayDraft) return
    const prompt = dayDraft.promptTemplates[index]
    if (prompt && plan?.days.some((d) => d.day === dayDraft.day)) {
      await deleteStudyPrompt(prompt.id)
    }
    setDayDraft({
      ...dayDraft,
      promptTemplates: dayDraft.promptTemplates.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Plan Curriculum"
        description="Configure study days, theory topics, DSA problems, assignments, resources, and AI prompts."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRenumberDays()}
            isLoading={renumbering}
            disabled={saving}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh & renumber days
          </Button>
        }
      />

      {error ? <ErrorAlert message={error} onRetry={() => void reload()} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input label="Plan title" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} />
          <Textarea
            label="Description"
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            className="min-h-[80px] md:col-span-2"
          />
          <div className="md:col-span-2">
            <Button onClick={() => void savePlanMeta()} isLoading={saving}>
              <Save className="h-4 w-4" />
              Save plan details
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Days</CardTitle>
            <Button size="sm" variant="outline" onClick={() => void addDay()} disabled={saving}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {plan?.days.length ? (
              plan.days.map((day) => (
                <div
                  key={day.day}
                  className={`rounded-lg border transition-colors ${
                    selectedDay === day.day
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  {renamingDay === day.day ? (
                    <div className="flex items-center gap-1 p-2">
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        Day {day.day}
                      </span>
                      <input
                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                        value={renameDraft}
                        autoFocus
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitRenameDay(day.day)
                          if (e.key === 'Escape') setRenamingDay(null)
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void commitRenameDay(day.day)}
                        disabled={saving}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day.day)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                    >
                      <span className="font-medium">Day {day.day}</span>
                      <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                        <span className="truncate">{day.title}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="shrink-0 rounded p-0.5 hover:bg-muted"
                          aria-label={`Rename day ${day.day}`}
                          onClick={(e) => startRenameDay(day, e)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') startRenameDay(day, e as unknown as MouseEvent)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No days yet. Add a day or run the one-time seed script.
              </p>
            )}
          </CardContent>
        </Card>

        {dayDraft ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Day {dayDraft.day}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={() => void removeDay(dayDraft.day)}>
                    <Trash2 className="h-4 w-4" />
                    Delete day
                  </Button>
                  <Button size="sm" onClick={() => void saveDay()} isLoading={saving}>
                    <Save className="h-4 w-4" />
                    Save day
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Title"
                  value={dayDraft.title}
                  onChange={(e) => setDayDraft({ ...dayDraft, title: e.target.value })}
                />
                <DraftNumberInput
                  label="Estimated minutes"
                  min={1}
                  emptyValue={180}
                  value={dayDraft.estimatedMinutes}
                  onChange={(estimatedMinutes) => setDayDraft({ ...dayDraft, estimatedMinutes })}
                />
                <Textarea
                  label="Subtitle"
                  value={dayDraft.subtitle}
                  onChange={(e) => setDayDraft({ ...dayDraft, subtitle: e.target.value })}
                  className="min-h-[72px] md:col-span-2"
                />
              </CardContent>
            </Card>

            {SECTIONS.map((section) => (
              <Card key={section}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base capitalize">
                    {section}
                    <Badge variant="outline">{dayDraft[section].length}</Badge>
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => addItem(section)}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectionItems(dayDraft, section).map((item, itemIndex) => (
                    <div key={item.id} className="rounded-lg border border-border p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <Badge variant="outline">{item.id}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void removeItem(section, itemIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Title"
                          value={item.title}
                          onChange={(e) => updateItem(section, itemIndex, { title: e.target.value })}
                        />
                        <Input
                          label="Item ID"
                          value={item.id}
                          onChange={(e) => updateItem(section, itemIndex, { id: e.target.value })}
                        />
                        <Textarea
                          label="Description"
                          value={item.description ?? ''}
                          onChange={(e) =>
                            updateItem(section, itemIndex, { description: e.target.value })
                          }
                          className="min-h-[72px] md:col-span-2"
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Resources</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addResource(section, itemIndex)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add resource
                          </Button>
                        </div>
                        {(item.resources ?? []).map((resource, resourceIndex) => (
                          <div
                            key={resource.id}
                            className="grid gap-2 rounded-md bg-muted/30 p-3 md:grid-cols-2"
                          >
                            <Input
                              label="Resource title"
                              value={resource.title}
                              onChange={(e) =>
                                updateResource(section, itemIndex, resourceIndex, {
                                  title: e.target.value,
                                })
                              }
                            />
                            <Input
                              label="URL"
                              value={resource.url}
                              onChange={(e) =>
                                updateResource(section, itemIndex, resourceIndex, {
                                  url: e.target.value,
                                })
                              }
                            />
                            <select
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                              value={resource.type ?? 'article'}
                              onChange={(e) =>
                                updateResource(section, itemIndex, resourceIndex, {
                                  type: e.target.value as ResourceLink['type'],
                                })
                              }
                            >
                              <option value="article">Article</option>
                              <option value="video">Video</option>
                              <option value="docs">Docs</option>
                              <option value="problem">Problem</option>
                            </select>
                            <div className="md:col-span-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  void removeResource(section, itemIndex, resourceIndex)
                                }
                              >
                                Remove resource
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">AI prompt templates</CardTitle>
                <Button size="sm" variant="outline" onClick={addPrompt}>
                  <Plus className="h-4 w-4" />
                  Add prompt
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {dayDraft.promptTemplates.map((prompt, index) => (
                  <div key={prompt.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => void removePrompt(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <Input
                        label="Title"
                        value={prompt.title}
                        onChange={(e) => updatePrompt(index, { title: e.target.value })}
                      />
                      <Textarea
                        label="Prompt"
                        value={prompt.prompt}
                        onChange={(e) => updatePrompt(index, { prompt: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Select a day to edit theory, DSA, assignments, resources, and prompts.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
