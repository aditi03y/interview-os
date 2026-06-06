import { useState } from 'react'
import { History, PanelLeft } from 'lucide-react'
import { Badge, Button, Card, ErrorAlert, PageHeader } from '@/components/ui'
import { ChatInputControlled } from '../components/ChatInput'
import { ChatMessageList } from '../components/ChatMessageList'
import { ContextToggle } from '../components/ContextToggle'
import { ConversationSidebar } from '../components/ConversationSidebar'
import { PromptTemplateBar } from '../components/PromptTemplatePicker'
import { TopicSelector } from '../components/TopicSelector'
import { MENTOR_TEMPLATES } from '../data/templates'
import { useAiMentor } from '../hooks/useAiMentor'

export function AiMentorPage() {
  const {
    conversations,
    messages,
    activeConversationId,
    selectedTopic,
    setSelectedTopic,
    topics,
    injectContext,
    setInjectContext,
    isLoadingConversations,
    isSending,
    error,
    sidebarOpen,
    setSidebarOpen,
    activeProvider,
    selectConversation,
    startNewConversation,
    removeConversation,
    sendMessage,
  } = useAiMentor()

  const [draft, setDraft] = useState('')

  const handleSend = (text: string) => {
    void sendMessage(text)
    setDraft('')
  }

  const handleTemplateSelect = (prompt: string) => {
    setDraft(prompt)
  }

  const providerReady = activeProvider?.configured ?? false

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-4 lg:gap-6">
      <PageHeader
        title="AI Mentor"
        description="Personalized SDE interview guidance powered by Gemini."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={providerReady ? 'success' : 'warning'}>
              {activeProvider?.name ?? 'Gemini'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <History className="h-4 w-4" />
              History
            </Button>
          </div>
        }
      />

      {error ? <ErrorAlert message={error} /> : null}

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:gap-0">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          isLoading={isLoadingConversations}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={(id) => void selectConversation(id)}
          onNew={() => void startNewConversation()}
          onDelete={(id) => void removeConversation(id)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="hidden border-b border-border p-4 lg:block">
            <div className="grid gap-4 xl:grid-cols-[1fr_240px]">
              <TopicSelector
                topics={topics}
                selected={selectedTopic}
                onChange={setSelectedTopic}
              />
              <ContextToggle
                enabled={injectContext}
                onChange={setInjectContext}
                providerName={activeProvider?.name}
                providerConfigured={activeProvider?.configured}
              />
            </div>
          </div>

          <div className="border-b border-border p-3 lg:hidden">
            <TopicSelector
              topics={topics}
              selected={selectedTopic}
              onChange={setSelectedTopic}
            />
          </div>

          <PromptTemplateBar templates={MENTOR_TEMPLATES} onSelect={handleTemplateSelect} />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ChatMessageList
              messages={messages}
              isSending={isSending}
              onSelectTemplate={handleSend}
            />
          </div>

          <ChatInputControlled
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            isSending={isSending}
            disabled={!providerReady}
          />
        </div>

        <aside className="hidden w-64 shrink-0 flex-col border-l border-border p-4 xl:flex">
          <Button
            variant="outline"
            size="sm"
            className="mb-4 w-full"
            onClick={() => void startNewConversation()}
          >
            <PanelLeft className="h-4 w-4" />
            New Chat
          </Button>
          <ContextToggle
            enabled={injectContext}
            onChange={setInjectContext}
            providerName={activeProvider?.name}
            providerConfigured={activeProvider?.configured}
          />
        </aside>
      </div>

      {!providerReady ? (
        <Card padding="md" className="border-warning/30 bg-warning/5">
          <p className="text-sm text-warning-foreground">
            Set <code className="rounded bg-muted px-1">VITE_GEMINI_API_KEY</code> in your{' '}
            <code className="rounded bg-muted px-1">.env</code> file to enable AI responses.
            Switch providers via <code className="rounded bg-muted px-1">VITE_AI_PROVIDER</code>.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
