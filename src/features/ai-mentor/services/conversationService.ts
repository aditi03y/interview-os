import type { MentorContext } from '@/lib/ai'
import { getActiveProviderId } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { mapPostgrestError } from '@/lib/supabase/errors'
import type { ApiResult } from '@/types'
import type { ChatMessage, ChatRole } from '@/lib/ai'
import type { Conversation, ConversationSummary } from '../types'

function mapConversation(row: {
  id: string
  title: string
  topic: string | null
  provider: string
  updated_at: string
}): ConversationSummary {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    provider: row.provider,
    updatedAt: row.updated_at,
  }
}

function mapMessage(row: {
  id: string
  role: string
  content: string
  created_at: string
}): ChatMessage {
  return {
    id: row.id,
    role: row.role as ChatRole,
    content: row.content,
    createdAt: row.created_at,
  }
}

export async function fetchConversations(
  userId: string,
): Promise<ApiResult<ConversationSummary[]>> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, topic, provider, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: data.map(mapConversation), error: null }
}

export async function fetchConversation(
  conversationId: string,
): Promise<ApiResult<Conversation>> {
  const { data: conv, error: convError } = await supabase
    .from('ai_conversations')
    .select('id, title, topic, provider, updated_at')
    .eq('id', conversationId)
    .single()

  if (convError) return { data: null, error: mapPostgrestError(convError) }

  const { data: messages, error: msgError } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (msgError) return { data: null, error: mapPostgrestError(msgError) }

  return {
    data: {
      ...mapConversation(conv),
      messages: messages.map(mapMessage),
    },
    error: null,
  }
}

export async function createConversation(
  userId: string,
  options: { title?: string; topic?: string | null } = {},
): Promise<ApiResult<ConversationSummary>> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      title: options.title ?? 'New Conversation',
      topic: options.topic ?? null,
      provider: getActiveProviderId(),
    })
    .select('id, title, topic, provider, updated_at')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapConversation(data), error: null }
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<ApiResult<void>> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function deleteConversation(
  conversationId: string,
): Promise<ApiResult<void>> {
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', conversationId)

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: undefined, error: null }
}

export async function saveMessage(
  conversationId: string,
  message: Pick<ChatMessage, 'role' | 'content'>,
): Promise<ApiResult<ChatMessage>> {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
    })
    .select('id, role, content, created_at')
    .single()

  if (error) return { data: null, error: mapPostgrestError(error) }
  return { data: mapMessage(data), error: null }
}

export async function buildMentorContext(userId: string): Promise<MentorContext> {
  const [profileResult, studyResult, dsaResult] = await Promise.all([
    supabase.from('users').select('full_name, college, target_role').eq('id', userId).single(),
    supabase
      .from('study_day_progress')
      .select('day_number, progress_percent, status')
      .eq('user_id', userId),
    supabase
      .from('dsa_progress')
      .select('solved')
      .eq('user_id', userId),
  ])

  const profile = profileResult.data
  const studyDays = studyResult.data ?? []
  const dsaRows = dsaResult.data ?? []

  const completedDays = studyDays.filter((d) => d.status === 'completed').length
  const avgProgress =
    studyDays.length > 0
      ? Math.round(
          studyDays.reduce((sum, d) => sum + d.progress_percent, 0) / studyDays.length,
        )
      : 0

  const solvedCount = dsaRows.filter((d) => d.solved).length

  return {
    userName: profile?.full_name ?? undefined,
    college: profile?.college ?? undefined,
    targetRole: profile?.target_role ?? undefined,
    studyProgressSummary:
      studyDays.length > 0
        ? `${completedDays}/${15} days completed, ${avgProgress}% average progress`
        : 'No study plan progress logged yet',
    dsaProgressSummary:
      dsaRows.length > 0
        ? `${solvedCount}/${dsaRows.length} problems solved`
        : 'No DSA problems logged yet',
  }
}
