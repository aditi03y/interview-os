import type { ParsedRepoUrl } from '../types'

const GITHUB_HOSTS = ['github.com', 'www.github.com']

export function parseGithubRepoUrl(input: string): ParsedRepoUrl | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const url = new URL(withProtocol)

    if (!GITHUB_HOSTS.includes(url.hostname)) return null

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null

    const owner = parts[0]!
    const repo = parts[1]!.replace(/\.git$/, '')

    return {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`,
    }
  } catch {
    // owner/repo shorthand
    const shorthand = trimmed.replace(/^github.com\//, '')
    const parts = shorthand.split('/').filter(Boolean)
    if (parts.length >= 2) {
      const owner = parts[0]!
      const repo = parts[1]!.replace(/\.git$/, '')
      return { owner, repo, url: `https://github.com/${owner}/${repo}` }
    }
    return null
  }
}

export function formatRepoLabel(owner: string, repo: string): string {
  return `${owner}/${repo}`
}
