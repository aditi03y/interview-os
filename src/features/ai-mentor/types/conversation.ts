import type { ChatMessage } from '@/lib/ai'

export interface MentorTopic {
  id: string
  label: string
  description: string
  systemHint: string
}

export interface PromptTemplate {
  id: string
  label: string
  prompt: string
}

export interface ConversationSummary {
  id: string
  title: string
  topic: string | null
  provider: string
  updatedAt: string
  messageCount?: number
}

export interface Conversation extends ConversationSummary {
  messages: ChatMessage[]
}
