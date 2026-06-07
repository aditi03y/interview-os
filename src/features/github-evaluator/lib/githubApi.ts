import type {
  GithubCommitSummary,
  GithubRepoMetadata,
  GithubRepoSnapshot,
  ParsedRepoUrl,
  RepoFileEntry,
  RepoSourceSample,
} from '../types'

const README_MAX_CHARS = 12_000
const GITHUB_API = 'https://api.github.com'

function getHeaders(): HeadersInit {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token && token !== 'your-github-token') {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, { headers: getHeaders() })

  if (response.status === 404) {
    throw new Error('Repository not found. Check the URL and ensure the repo is public.')
  }

  if (response.status === 403) {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    if (remaining === '0') {
      throw new Error('GitHub API rate limit exceeded. Try again later or add VITE_GITHUB_TOKEN.')
    }
    throw new Error('GitHub API access denied. The repository may be private.')
  }

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`)
  }

  return response.json() as Promise<T>
}

interface GithubRepoResponse {
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  watchers_count: number
  default_branch: string
  language: string | null
  topics?: string[]
  license: { spdx_id: string | null; name: string } | null
  fork: boolean
  archived: boolean
  has_wiki: boolean
  has_pages: boolean
  created_at: string
  updated_at: string
  pushed_at: string | null
  size: number
}

interface GithubCommitResponse {
  sha: string
  commit: {
    message: string
    author: { name: string | null; date: string }
  }
  author: { login: string | null } | null
}

export async function fetchGithubRepoSnapshot(parsed: ParsedRepoUrl): Promise<GithubRepoSnapshot> {
  const base = `/repos/${parsed.owner}/${parsed.repo}`

  const [repoData, readmeResult, commitsData, languagesData] = await Promise.all([
    githubFetch<GithubRepoResponse>(base),
    fetchReadme(base),
    githubFetch<GithubCommitResponse[]>(`${base}/commits?per_page=30`),
    githubFetch<Record<string, number>>(`${base}/languages`),
  ])

  const metadata = mapRepoMetadata(repoData)
  const commits = mapCommits(commitsData)

  return {
    metadata,
    readme: readmeResult.content,
    readmeTruncated: readmeResult.truncated,
    commits,
    languages: languagesData,
    fetchedAt: new Date().toISOString(),
  }
}

async function fetchReadme(
  base: string,
): Promise<{ content: string | null; truncated: boolean }> {
  try {
    const response = await fetch(`${GITHUB_API}${base}/readme`, {
      headers: {
        ...getHeaders(),
        Accept: 'application/vnd.github.raw',
      },
    })

    if (response.status === 404) {
      return { content: null, truncated: false }
    }

    if (!response.ok) {
      return { content: null, truncated: false }
    }

    const text = await response.text()
    if (text.length <= README_MAX_CHARS) {
      return { content: text, truncated: false }
    }
    return {
      content: `${text.slice(0, README_MAX_CHARS)}\n\n...[README truncated]`,
      truncated: true,
    }
  } catch {
    return { content: null, truncated: false }
  }
}

function mapRepoMetadata(data: GithubRepoResponse): GithubRepoMetadata {
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    url: data.html_url,
    homepage: data.homepage,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    watchers: data.watchers_count,
    defaultBranch: data.default_branch,
    primaryLanguage: data.language,
    topics: data.topics ?? [],
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    isFork: data.fork,
    archived: data.archived,
    hasWiki: data.has_wiki,
    hasPages: data.has_pages,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    sizeKb: data.size,
  }
}

function mapCommits(data: GithubCommitResponse[]): GithubCommitSummary[] {
  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0] ?? c.commit.message,
    author: c.author?.login ?? c.commit.author.name ?? 'Unknown',
    date: c.commit.author.date,
  }))
}

export function formatLanguageBreakdown(languages: Record<string, number>): string {
  const total = Object.values(languages).reduce((s, v) => s + v, 0)
  if (!total) return 'No language data'

  return Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .map(([lang, bytes]) => {
      const pct = Math.round((bytes / total) * 100)
      return `${lang}: ${pct}%`
    })
    .join(', ')
}

export function summarizeCommits(commits: GithubCommitSummary[]): string {
  if (!commits.length) return 'No recent commits found.'

  const authors = new Set(commits.map((c) => c.author))
  const oldest = commits[commits.length - 1]?.date
  const newest = commits[0]?.date

  return `${commits.length} recent commits · ${authors.size} contributor(s) · ${formatDate(oldest)} to ${formatDate(newest)}`
}

function formatDate(iso: string | undefined): string {
  if (!iso) return 'unknown'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface GithubContentItem {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  download_url: string | null
}

const SOURCE_EXTENSIONS = new Set([
  '.py', '.java', '.cpp', '.cc', '.c', '.h', '.hpp',
  '.js', '.jsx', '.ts', '.tsx', '.go', '.rs', '.kt', '.cs', '.rb',
])
const SOURCE_MAX_FILES = 8
const SOURCE_MAX_CHARS = 3500
const SKIP_PATHS = new Set(['node_modules', 'dist', 'build', '.git', 'vendor', '__pycache__', '.venv', 'target'])

export async function fetchGithubRepoSnapshotForAssignment(
  parsed: ParsedRepoUrl,
): Promise<GithubRepoSnapshot> {
  const snapshot = await fetchGithubRepoSnapshot(parsed)
  const base = `/repos/${parsed.owner}/${parsed.repo}`

  try {
    const rootEntries = await fetchDirectoryContents(base, '')
    const nestedEntries = await fetchNestedSourceEntries(base, rootEntries)
    const allEntries = [...rootEntries, ...nestedEntries]
    const sourcePaths = collectSourcePaths(allEntries)
    const sourceSamples = await fetchSourceSamples(base, sourcePaths)

    return {
      ...snapshot,
      rootEntries: allEntries,
      sourceSamples,
    }
  } catch {
    return snapshot
  }
}

async function fetchDirectoryContents(base: string, path: string): Promise<RepoFileEntry[]> {
  const suffix = path ? `/contents/${encodeURIComponent(path)}` : '/contents'
  const items = await githubFetch<GithubContentItem[]>(`${base}${suffix}`)

  return items
    .filter((item) => !SKIP_PATHS.has(item.name))
    .map((item) => ({
      path: item.path,
      type: item.type === 'dir' ? 'dir' : 'file',
      size: item.size,
    }))
}

async function fetchNestedSourceEntries(
  base: string,
  rootEntries: RepoFileEntry[],
): Promise<RepoFileEntry[]> {
  const nested: RepoFileEntry[] = []
  const dirsToScan = rootEntries
    .filter((e) => e.type === 'dir' && ['src', 'lib', 'include', 'test', 'tests'].includes(e.path))
    .slice(0, 3)

  for (const dir of dirsToScan) {
    try {
      const children = await fetchDirectoryContents(base, dir.path)
      nested.push(...children.map((c) => ({ ...c, path: c.path })))
    } catch {
      // skip unreadable directories
    }
  }

  return nested
}

function isSourceFile(path: string): boolean {
  const lower = path.toLowerCase()
  return [...SOURCE_EXTENSIONS].some((ext) => lower.endsWith(ext))
}

function collectSourcePaths(entries: RepoFileEntry[]): string[] {
  const paths: string[] = []

  for (const entry of entries) {
    if (entry.type === 'file' && isSourceFile(entry.path) && entry.size < 100_000) {
      paths.push(entry.path)
    }
  }

  const priority = (path: string) => {
    if (path.includes('test')) return 2
    if (path.startsWith('src/')) return 0
    return 1
  }

  return [...new Set(paths)]
    .sort((a, b) => priority(a) - priority(b))
    .slice(0, SOURCE_MAX_FILES)
}

async function fetchSourceSamples(base: string, paths: string[]): Promise<RepoSourceSample[]> {
  const samples: RepoSourceSample[] = []

  for (const path of paths) {
    try {
      const response = await fetch(`${GITHUB_API}${base}/contents/${encodeURIComponent(path)}`, {
        headers: {
          ...getHeaders(),
          Accept: 'application/vnd.github.raw',
        },
      })

      if (!response.ok) continue

      const text = await response.text()
      const truncated = text.length > SOURCE_MAX_CHARS
      samples.push({
        path,
        content: truncated ? `${text.slice(0, SOURCE_MAX_CHARS)}\n\n...[truncated]` : text,
        truncated,
      })
    } catch {
      // skip unreadable files
    }
  }

  return samples
}
