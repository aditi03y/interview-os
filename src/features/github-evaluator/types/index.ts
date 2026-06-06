export interface ParsedRepoUrl {
  owner: string
  repo: string
  url: string
}

export interface GithubRepoMetadata {
  name: string
  fullName: string
  description: string | null
  url: string
  homepage: string | null
  stars: number
  forks: number
  openIssues: number
  watchers: number
  defaultBranch: string
  primaryLanguage: string | null
  topics: string[]
  license: string | null
  isFork: boolean
  archived: boolean
  hasWiki: boolean
  hasPages: boolean
  createdAt: string
  updatedAt: string
  pushedAt: string | null
  sizeKb: number
}

export interface GithubCommitSummary {
  sha: string
  message: string
  author: string
  date: string
}

export interface GithubRepoSnapshot {
  metadata: GithubRepoMetadata
  readme: string | null
  readmeTruncated: boolean
  commits: GithubCommitSummary[]
  languages: Record<string, number>
  fetchedAt: string
}

export interface EvaluationScores {
  qualityScore: number
  documentationScore: number
  structureScore: number
  engineeringScore: number
}

export interface EvaluationReportSections {
  documentation: string
  structure: string
  engineering: string
  commitActivity: string
  recommendations: string[]
}

export interface RepoEvaluationReport extends EvaluationScores {
  id?: string
  repoUrl: string
  repoName: string
  owner: string
  summary: string
  strengths: string[]
  improvements: string[]
  sections: EvaluationReportSections
  snapshot: GithubRepoSnapshot
  reviewedAt: string
}

export interface GithubReviewHistoryItem {
  id: string
  repoName: string
  repoUrl: string | null
  owner: string
  qualityScore: number | null
  documentationScore: number | null
  structureScore: number | null
  engineeringScore: number | null
  summary: string | null
  reviewedAt: string
}

export interface GeminiEvaluationPayload {
  qualityScore: number
  documentationScore: number
  structureScore: number
  engineeringScore: number
  summary: string
  strengths: string[]
  improvements: string[]
  sections: EvaluationReportSections
}
