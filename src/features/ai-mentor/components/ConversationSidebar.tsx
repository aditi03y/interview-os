import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import { Button, Skeleton, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { ConversationSummary } from '../types'

interface ConversationSidebarProps {
  conversations: ConversationSummary[]
  activeId: string | null
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  isOpen,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: ConversationSidebarProps) {
  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          'flex w-72 shrink-0 flex-col border-r border-border bg-sidebar',
          'fixed inset-y-0 left-0 z-50 lg:static lg:z-auto',
          'transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <h3 className="text-sm font-semibold">History</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onNew} aria-label="New conversation">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <div
                    className={cn(
                      'group flex items-start gap-2 rounded-lg px-3 py-2 transition-colors',
                      activeId === conv.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/50',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(conv.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <p className="truncate text-sm font-medium">{conv.title}</p>
                      </div>
                      {conv.topic ? (
                        <p className="mt-0.5 truncate pl-5 text-xs capitalize text-muted-foreground">
                          {conv.topic}
                        </p>
                      ) : null}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={() => void onDelete(conv.id)}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

export function ConversationSidebarLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner size="lg" className="text-primary" />
    </div>
  )
}
