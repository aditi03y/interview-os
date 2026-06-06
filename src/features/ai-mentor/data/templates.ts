import type { PromptTemplate } from '../types'

export const MENTOR_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-pattern',
    label: 'Pattern Recognition',
    prompt:
      'Give me a medium DSA problem. After I explain my approach, identify the pattern and suggest optimizations.',
  },
  {
    id: 'tpl-mock',
    label: 'Mock Interview',
    prompt:
      'Conduct a 30-minute SDE mock interview. Ask one question at a time, give hints only when I ask, and evaluate my final approach.',
  },
  {
    id: 'tpl-review',
    label: 'Code Review',
    prompt:
      'I will paste my solution. Review it for correctness, time/space complexity, edge cases, and suggest improvements.',
  },
  {
    id: 'tpl-explain',
    label: 'Explain Like Interview',
    prompt:
      'Explain this concept as if I have 3 minutes in a technical interview. Be concise, structured, and mention trade-offs.',
  },
  {
    id: 'tpl-weak',
    label: 'Weak Areas',
    prompt:
      'Based on my study progress context, identify my likely weak areas and create a focused 3-day improvement plan.',
  },
  {
    id: 'tpl-behavioral',
    label: 'STAR Coach',
    prompt:
      'Ask me a behavioral question, then coach my answer using the STAR method with specific improvement suggestions.',
  },
]
