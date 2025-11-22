import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import type { Conversation } from "@/types/chat"

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={onNewChat}
          className="w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus size={18} />
          新規チャット
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversations.length === 0 ? (
          <p className="text-sidebar-foreground/50 text-sm text-center py-8">チャット履歴がまだありません</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                }`}
              >
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className="flex-1 text-left text-sm truncate"
                >
                  {conversation.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conversation.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-sidebar-accent/50 rounded"
                >
                  <Trash2 size={16} className="text-sidebar-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
