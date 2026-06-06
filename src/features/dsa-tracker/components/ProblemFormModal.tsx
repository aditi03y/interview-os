import { useState } from 'react'
import { Button, Input, Modal, Textarea } from '@/components/ui'
import {
  DIFFICULTIES,
  DSA_TOPICS,
  PLATFORMS,
  PROBLEM_STATUSES,
  STATUS_LABELS,
  type DsaProblem,
  type DsaProblemInput,
  type ProblemStatus,
} from '../types'
import type { Difficulty } from '@/types'

interface ProblemFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: DsaProblemInput) => Promise<boolean>
  problem?: DsaProblem | null
  isSaving: boolean
}

function getInitialState(problem?: DsaProblem | null) {
  return {
    problemName: problem?.problemName ?? '',
    platform: problem?.platform ?? 'LeetCode',
    difficulty: (problem?.difficulty ?? 'Medium') as Difficulty,
    topic: problem?.topic ?? '',
    attempts: String(problem?.attempts ?? 1),
    timeTaken: problem?.timeTakenMinutes != null ? String(problem.timeTakenMinutes) : '',
    status: (problem?.status ?? 'pending') as ProblemStatus,
    notes: problem?.notes ?? '',
    problemUrl: problem?.problemUrl ?? '',
  }
}

function ProblemForm({
  problem,
  onClose,
  onSave,
  isSaving,
}: Omit<ProblemFormModalProps, 'open'>) {
  const initial = getInitialState(problem)
  const [problemName, setProblemName] = useState(initial.problemName)
  const [platform, setPlatform] = useState(initial.platform)
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty)
  const [topic, setTopic] = useState(initial.topic)
  const [attempts, setAttempts] = useState(initial.attempts)
  const [timeTaken, setTimeTaken] = useState(initial.timeTaken)
  const [status, setStatus] = useState<ProblemStatus>(initial.status)
  const [notes, setNotes] = useState(initial.notes)
  const [problemUrl, setProblemUrl] = useState(initial.problemUrl)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!problemName.trim()) {
      setFormError('Problem name is required.')
      return
    }

    const attemptsNum = parseInt(attempts, 10)
    if (Number.isNaN(attemptsNum) || attemptsNum < 1) {
      setFormError('Attempts must be at least 1.')
      return
    }

    const timeNum = timeTaken.trim() ? parseInt(timeTaken, 10) : null
    if (timeTaken.trim() && (Number.isNaN(timeNum) || timeNum! < 0)) {
      setFormError('Time taken must be a valid number of minutes.')
      return
    }

    await onSave({
      problemName: problemName.trim(),
      platform,
      difficulty,
      topic: topic.trim() || null,
      problemUrl: problemUrl.trim() || null,
      attempts: attemptsNum,
      timeTakenMinutes: timeNum,
      status,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {formError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <Input
        label="Problem Name"
        value={problemName}
        onChange={(e) => setProblemName(e.target.value)}
        placeholder="Two Sum"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Topic</label>
        <input
          list="dsa-topics"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Hash Map, DP, Graphs..."
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <datalist id="dsa-topics">
          {DSA_TOPICS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Attempts"
          type="number"
          min={1}
          value={attempts}
          onChange={(e) => setAttempts(e.target.value)}
        />
        <Input
          label="Time Taken (min)"
          type="number"
          min={0}
          value={timeTaken}
          onChange={(e) => setTimeTaken(e.target.value)}
          placeholder="Optional"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProblemStatus)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {PROBLEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Problem URL"
        value={problemUrl}
        onChange={(e) => setProblemUrl(e.target.value)}
        placeholder="https://leetcode.com/problems/..."
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Approach, pitfalls, key insights..."
        className="min-h-[100px]"
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {problem ? 'Save Changes' : 'Add Problem'}
        </Button>
      </div>
    </form>
  )
}

export function ProblemFormModal({
  open,
  onClose,
  onSave,
  problem,
  isSaving,
}: ProblemFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={problem ? 'Edit Problem' : 'Add Problem'}
      description="Log a DSA problem with attempts, time, and notes."
    >
      {open ? (
        <ProblemForm
          key={problem?.id ?? 'new'}
          problem={problem}
          onClose={onClose}
          onSave={onSave}
          isSaving={isSaving}
        />
      ) : null}
    </Modal>
  )
}
