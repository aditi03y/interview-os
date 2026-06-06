import {
  Calendar,
  Code2,
  ExternalLink,
  FileText,
  GitCommit,
  GitFork,
  Star,
  Tag,
} from 'lucide-react'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { formatLanguageBreakdown, summarizeCommits } from '../lib/githubApi'
import type { GithubRepoSnapshot } from '../types'

interface RepoMetadataPanelProps {
  snapshot: GithubRepoSnapshot
}

export function RepoMetadataPanel({ snapshot }: RepoMetadataPanelProps) {
  const { metadata, readme, commits, languages } = snapshot

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repository Metadata</CardTitle>
          <CardDescription>Fetched from GitHub API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <MetaRow icon={Star} label="Stars" value={String(metadata.stars)} />
          <MetaRow icon={GitFork} label="Forks" value={String(metadata.forks)} />
          <MetaRow icon={Code2} label="Primary Language" value={metadata.primaryLanguage ?? '—'} />
          <MetaRow icon={Tag} label="Topics" value={metadata.topics.join(', ') || '—'} />
          <MetaRow icon={Calendar} label="Last Push" value={formatDate(metadata.pushedAt)} />
          <MetaRow icon={FileText} label="License" value={metadata.license ?? 'None'} />
          <MetaRow
            icon={GitCommit}
            label="Commits"
            value={summarizeCommits(commits)}
          />
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
          <CardDescription>{formatLanguageBreakdown(languages)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(languages)
            .sort(([, a], [, b]) => b - a)
            .map(([lang, bytes]) => {
              const total = Object.values(languages).reduce((s, v) => s + v, 0)
              const pct = total ? Math.round((bytes / total) * 100) : 0
              return (
                <div key={lang} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{lang}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">README Preview</CardTitle>
          {snapshot.readmeTruncated ? (
            <Badge variant="outline">Truncated for analysis</Badge>
          ) : null}
        </CardHeader>
        <CardContent>
          {readme ? (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
              {readme.slice(0, 2000)}
              {readme.length > 2000 ? '\n\n…' : ''}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No README found in this repository.</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Recent Commits</CardTitle>
          <CardDescription>Last {commits.length} commits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {commits.length ? (
            commits.slice(0, 10).map((commit) => (
              <div
                key={commit.sha}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <code className="text-xs text-muted-foreground">{commit.sha}</code>
                <span className="min-w-0 flex-1 truncate">{commit.message}</span>
                <span className="text-xs text-muted-foreground">@{commit.author}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No commit history available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-muted-foreground">{label}: </span>
        <span className="break-words">{value}</span>
      </div>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
