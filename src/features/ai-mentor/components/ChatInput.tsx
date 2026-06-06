import { Send } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  isSending: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending || disabled) return
    onSend(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <Input
        placeholder="Ask your AI mentor..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isSending || disabled}
        className="flex-1"
      />
      <Button type="submit" isLoading={isSending} disabled={!input.trim() || disabled}>
        <Send className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Send</span>
      </Button>
    </form>
  )
}

export function ChatInputControlled({
  value,
  onChange,
  onSend,
  isSending,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  isSending: boolean
  disabled?: boolean
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isSending || disabled) return
    onSend(value)
    onChange('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <Input
        placeholder="Ask your AI mentor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isSending || disabled}
        className="flex-1"
      />
      <Button type="submit" isLoading={isSending} disabled={!value.trim() || disabled}>
        <Send className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Send</span>
      </Button>
    </form>
  )
}
