import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import {
  completeChat,
  generateConversationTitle,
  listProviders,
  mapAIError,
} from '@/lib/ai'
import type { ChatMessage, MentorContext } from '@/lib/ai'
import { getTopicById, MENTOR_TOPICS } from '../data/topics'
import {
  buildMentorContext,
  createConversation,
  deleteConversation,
  fetchConversation,
  fetchConversations,
  saveMessage,
  updateConversationTitle,
} from '../services/conversationService'
import type { ConversationSummary } from '../types'

export function useAiMentor() {
  const { user } = useAuth()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('general')
  const [injectContext, setInjectContext] = useState(true)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const providers = listProviders()
  const activeProvider = providers.find((p) => p.isActive)

  const loadConversations = useCallback(async () => {
    if (!user) return

    setIsLoadingConversations(true)
    const result = await fetchConversations(user.id)

    if (result.error) {
      setError(result.error.message)
      setIsLoadingConversations(false)
      return
    }

    setConversations(result.data)
    setIsLoadingConversations(false)
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const run = async () => {
      setIsLoadingConversations(true)
      const result = await fetchConversations(user.id)
      if (cancelled) return

      if (result.error) {
        setError(result.error.message)
        setIsLoadingConversations(false)
        return
      }

      setConversations(result.data)
      setIsLoadingConversations(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  const selectConversation = useCallback(async (id: string) => {
    setError(null)
    setActiveConversationId(id)
    setSidebarOpen(false)

    const result = await fetchConversation(id)
    if (result.error) {
      setError(result.error.message)
      return
    }

    setMessages(result.data.messages)
    if (result.data.topic) setSelectedTopic(result.data.topic)
  }, [])

  const startNewConversation = useCallback(async () => {
    if (!user) return

    setError(null)
    const result = await createConversation(user.id, {
      topic: selectedTopic,
    })

    if (result.error) {
      setError(result.error.message)
      return
    }

    setConversations((prev) => [result.data, ...prev])
    setActiveConversationId(result.data.id)
    setMessages([])
    setSidebarOpen(false)
  }, [user, selectedTopic])

  const removeConversation = useCallback(
    async (id: string) => {
      const result = await deleteConversation(id)
      if (result.error) {
        setError(result.error.message)
        return
      }

      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConversationId === id) {
        setActiveConversationId(null)
        setMessages([])
      }
    },
    [activeConversationId],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim() || isSending) return

      setIsSending(true)
      setError(null)

      let conversationId = activeConversationId

      if (!conversationId) {
        const createResult = await createConversation(user.id, { topic: selectedTopic })
        if (createResult.error) {
          setError(createResult.error.message)
          setIsSending(false)
          return
        }
        conversationId = createResult.data.id
        setActiveConversationId(conversationId)
        setConversations((prev) => [createResult.data, ...prev])
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
      }

      const nextMessages = [...messages, userMessage]
      setMessages(nextMessages)

      const saveUserResult = await saveMessage(conversationId, userMessage)
      if (saveUserResult.error) {
        setError(saveUserResult.error.message)
        setIsSending(false)
        return
      }

      if (messages.length === 0) {
        const title = generateConversationTitle(content)
        void updateConversationTitle(conversationId, title)
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title } : c)),
        )
      }

      try {
        let context: MentorContext | undefined

        if (injectContext) {
          const baseContext = await buildMentorContext(user.id)
          const topic = getTopicById(selectedTopic)
          context = {
            ...baseContext,
            topic: selectedTopic,
            topicLabel: topic?.label,
            customContext: topic?.systemHint,
          }
        }

        const response = await completeChat({
          messages: nextMessages,
          context,
        })

        const assistantMessage = {
          ...response.message,
          id: crypto.randomUUID(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        const saveAssistantResult = await saveMessage(conversationId, assistantMessage)
        if (saveAssistantResult.error) {
          setError(saveAssistantResult.error.message)
        }

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === conversationId
              ? { ...c, updatedAt: new Date().toISOString() }
              : c,
          )
          const active = updated.find((c) => c.id === conversationId)
          const rest = updated.filter((c) => c.id !== conversationId)
          return active ? [active, ...rest] : updated
        })
      } catch (err) {
        setError(mapAIError(err).message)
      } finally {
        setIsSending(false)
      }
    },
    [
      user,
      activeConversationId,
      isSending,
      messages,
      selectedTopic,
      injectContext,
    ],
  )

  return {
    conversations,
    messages,
    activeConversationId,
    selectedTopic,
    setSelectedTopic,
    topics: MENTOR_TOPICS,
    injectContext,
    setInjectContext,
    isLoadingConversations,
    isSending,
    error,
    setError,
    sidebarOpen,
    setSidebarOpen,
    providers,
    activeProvider,
    selectConversation,
    startNewConversation,
    removeConversation,
    sendMessage,
    reloadConversations: loadConversations,
  }
}
