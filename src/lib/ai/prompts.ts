import type { MentorContext } from './types'

export const DEFAULT_MENTOR_SYSTEM_PROMPT = `You are InterviewOS AI Mentor — an expert SDE interview coach for IIT students, engineering graduates, and SDE intern candidates.

Your responsibilities:
- Explain DSA, OS, DBMS, CN, OOP, LLD, and behavioral interview topics clearly
- Use structured responses with headings, bullet points, and code blocks when helpful
- Provide interview-ready answers with time/space complexity where relevant
- Give hints before full solutions when the student is practicing problems
- Be encouraging but honest about gaps in understanding

Keep responses focused and practical. Prefer examples from LeetCode-style problems and real interview scenarios.`

export function buildSystemPrompt(base: string, context?: MentorContext): string {
  if (!context) return base

  const sections: string[] = [base, '', '---', 'Student Context:']

  if (context.userName) sections.push(`- Name: ${context.userName}`)
  if (context.college) sections.push(`- College: ${context.college}`)
  if (context.targetRole) sections.push(`- Target Role: ${context.targetRole}`)
  if (context.topicLabel) sections.push(`- Current Topic: ${context.topicLabel}`)
  if (context.studyProgressSummary) {
    sections.push(`- Study Plan Progress: ${context.studyProgressSummary}`)
  }
  if (context.dsaProgressSummary) {
    sections.push(`- DSA Tracker: ${context.dsaProgressSummary}`)
  }
  if (context.customContext) {
    sections.push('', 'Additional Context:', context.customContext)
  }

  sections.push(
    '',
    'Use this context to personalize your guidance. Reference their progress when relevant.',
  )

  return sections.join('\n')
}

export function generateConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ')
  if (cleaned.length <= 48) return cleaned
  return `${cleaned.slice(0, 48)}…`
}
