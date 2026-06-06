import type {
  GithubCommitSummary,
  GithubRepoMetadata,
  GithubRepoSnapshot,
  ParsedRepoUrl,
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
