import type { MentorTopic } from '../types'

export const MENTOR_TOPICS: MentorTopic[] = [
  {
    id: 'dsa',
    label: 'DSA & Algorithms',
    description: 'Patterns, complexity, problem-solving strategies',
    systemHint: 'Focus on DSA patterns, Big-O analysis, and LeetCode-style problem solving.',
  },
  {
    id: 'os',
    label: 'Operating Systems',
    description: 'Processes, threads, memory, scheduling',
    systemHint: 'Focus on OS fundamentals commonly asked in SDE interviews.',
  },
  {
    id: 'dbms',
    label: 'DBMS',
    description: 'SQL, indexing, transactions, normalization',
    systemHint: 'Focus on database concepts, query optimization, and ACID properties.',
  },
  {
    id: 'cn',
    label: 'Computer Networks',
    description: 'TCP/IP, HTTP, DNS, networking protocols',
    systemHint: 'Focus on networking layers, protocols, and distributed systems basics.',
  },
  {
    id: 'oop',
    label: 'OOP & Design',
    description: 'SOLID, patterns, abstraction',
    systemHint: 'Focus on OOP principles, design patterns, and clean code.',
  },
  {
    id: 'lld',
    label: 'Low Level Design',
    description: 'Class design, UML, object modeling',
    systemHint: 'Focus on LLD problems like Parking Lot, LRU Cache, and class diagrams.',
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'STAR method, leadership, conflict stories',
    systemHint: 'Focus on behavioral interview prep using the STAR framework.',
  },
  {
    id: 'general',
    label: 'General Prep',
    description: 'Interview strategy, resume, company research',
    systemHint: 'Focus on holistic interview preparation and career guidance.',
  },
]

export function getTopicById(id: string): MentorTopic | undefined {
  return MENTOR_TOPICS.find((t) => t.id === id)
}
