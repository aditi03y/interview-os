import type { CompanyId } from '../types'

export interface CompanyProfile {
  id: CompanyId
  name: string
  weights: {
    dsa: number
    tests: number
    study: number
    github: number
  }
  priorityTopics: string[]
  benchmark: number
  focusLabel: string
}

export const TARGET_COMPANIES: CompanyProfile[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    weights: { dsa: 0.38, tests: 0.22, study: 0.25, github: 0.15 },
    priorityTopics: ['Arrays', 'Hash Map', 'Trees', 'Graphs', 'Dynamic Programming', 'System Design'],
    benchmark: 78,
    focusLabel: 'DSA-heavy bar raiser loops & leadership principles prep',
  },
  {
    id: 'google',
    name: 'Google',
    weights: { dsa: 0.42, tests: 0.23, study: 0.27, github: 0.08 },
    priorityTopics: ['Graphs', 'Dynamic Programming', 'Trees', 'Binary Search', 'Greedy', 'System Design'],
    benchmark: 82,
    focusLabel: 'Hard algorithmic rounds & strong fundamentals',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    weights: { dsa: 0.32, tests: 0.23, study: 0.25, github: 0.2 },
    priorityTopics: ['Arrays', 'Linked List', 'Trees', 'Dynamic Programming', 'System Design'],
    benchmark: 75,
    focusLabel: 'Balanced coding + project depth',
  },
  {
    id: 'uber',
    name: 'Uber',
    weights: { dsa: 0.36, tests: 0.24, study: 0.26, github: 0.14 },
    priorityTopics: ['Graphs', 'Heap', 'Dynamic Programming', 'System Design', 'Greedy'],
    benchmark: 77,
    focusLabel: 'Graphs, system design & practical problem solving',
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    weights: { dsa: 0.28, tests: 0.22, study: 0.22, github: 0.28 },
    priorityTopics: ['Hash Map', 'Trees', 'Stack', 'System Design', 'Sorting'],
    benchmark: 74,
    focusLabel: 'Clean code, documentation & collaborative engineering',
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    weights: { dsa: 0.4, tests: 0.25, study: 0.25, github: 0.1 },
    priorityTopics: ['Arrays', 'Dynamic Programming', 'Graphs', 'Hash Map', 'Greedy'],
    benchmark: 76,
    focusLabel: 'Fast-paced DSA rounds typical of Indian product companies',
  },
  {
    id: 'walmart',
    name: 'Walmart Global Tech',
    weights: { dsa: 0.3, tests: 0.25, study: 0.25, github: 0.2 },
    priorityTopics: ['Arrays', 'Trees', 'Dynamic Programming', 'System Design', 'Sorting'],
    benchmark: 73,
    focusLabel: 'Practical engineering & scalable system thinking',
  },
]

export const COMPANY_MAP = new Map(TARGET_COMPANIES.map((c) => [c.id, c]))

export const TOPIC_ALIASES: Record<string, string[]> = {
  Arrays: ['arrays', 'array', 'two pointers', 'sliding window'],
  'Hash Map': ['hash map', 'hash maps', 'hashing', 'hash table'],
  Trees: ['trees', 'tree', 'binary tree', 'bst'],
  Graphs: ['graphs', 'graph', 'bfs', 'dfs'],
  'Dynamic Programming': ['dynamic programming', 'dp'],
  'System Design': ['system design', 'design', 'architecture'],
  'Binary Search': ['binary search'],
  Greedy: ['greedy'],
  'Linked List': ['linked list', 'linked lists'],
  Stack: ['stack', 'stacks'],
  Heap: ['heap', 'priority queue'],
  Sorting: ['sorting', 'sort'],
  Queue: ['queue', 'queues'],
}
