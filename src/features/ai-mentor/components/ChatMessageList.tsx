import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import type { ChatMessage } from '@/lib/ai'
import { MENTOR_TEMPLATES } from '../data/templates'
import { ChatMessageBubble } from './ChatMessageBubble'
import { PromptTemplatePicker } from './PromptTemplatePicker'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isSending: boolean
  onSelectTemplate: (prompt: string) => void
}

export function ChatMessageList({
  messages,
  isSending,
  onSelectTemplate,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  if (messages.length === 0 && !isSending) {
    return (
      <EmptyState
        icon={<Bot className="h-6 w-6" />}
        title="Start a conversation"
        description="Pick a topic, use a template, or ask anything about your interview prep."
        action={
          <PromptTemplatePicker
            templates={MENTOR_TEMPLATES}
            onSelect={onSelectTemplate}
            variant="grid"
          />
        }
        className="border-0 bg-transparent"
      />
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {isSending ? (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Bot className="h-4 w-4 animate-pulse text-muted-foreground" />
          </div>
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  )
}
