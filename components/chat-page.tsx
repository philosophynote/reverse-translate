"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ConversationSidebar from "./conversation-sidebar"
import ChatContainer from "./chat-container"
import ChatInput from "./chat-input"
import type { Message, Conversation } from "@/types/chat"

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const currentConversation = conversations.find((conv) => conv.id === currentConversationId)

  const handleNewChat = () => {
    const newConversationId = `conv-${Date.now()}`
    const newConversation: Conversation = {
      id: newConversationId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversationId)
    setMessages([])
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    const conversation = conversations.find((conv) => conv.id === id)
    setMessages(conversation?.messages || [])
  }

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId || !content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    // Simulate AI response with thinking process
    setTimeout(() => {
      const thinking = `推考プロセス:
1. ユーザーの質問を分析
2. 関連する知識を検索
3. 適切な回答を構成
4. 結果を形式化`

      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `これはAIの回答です: "${content}"についてのレスポンスです。`,
        thinking: thinking,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, aiResponse]
      setMessages(finalMessages)

      // Update conversation
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: finalMessages,
              title:
                conv.title === "New Chat" ? content.substring(0, 30) + (content.length > 30 ? "..." : "") : conv.title,
            }
          }
          return conv
        }),
      )

      setIsLoading(false)
    }, 1000)
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            <ChatContainer messages={messages} isLoading={isLoading} />
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">ChatAI</h1>
              <p className="text-muted-foreground text-lg">左のサイドバーから新しいチャットを始めてください</p>
            </div>
            <Button onClick={handleNewChat} size="lg">
              新しいチャットを開始
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
