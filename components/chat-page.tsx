"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ConversationSidebar from "./conversation-sidebar"
import ChatContainer from "./chat-container"
import ChatInput from "./chat-input"
import type { Message, Conversation, WorkflowStage } from "@/types/chat"

type StreamEvent =
  | { type: "thinking"; stages?: WorkflowStage[] }
  | { type: "answer"; content?: string }
  | { type: "error"; message?: string }
  | { type: "done" }

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const formatThinking = (stages: WorkflowStage[]) =>
    stages
      .map((stage, index) => {
        const stepNumber = index + 1
        return `【${stepNumber}】${stage.label}\nInput: ${stage.input}\nOutput: ${stage.output}`
      })
      .join("\n\n")

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
    if (!currentConversationId) return
    const trimmed = content.trim()
    if (!trimmed) return

    const activeConversationId = currentConversationId

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    const initialMessages = [...messages, userMessage]
    setMessages(initialMessages)

    let latestMessages = initialMessages
    const replaceMessages = (next: Message[]) => {
      latestMessages = next
      setMessages(next)
    }
    const mutateMessages = (mutator: (prev: Message[]) => Message[]) => {
      let nextState: Message[] = []
      setMessages((prev) => {
        nextState = mutator(prev)
        return nextState
      })
      latestMessages = nextState
    }

    setIsLoading(true)
    let placeholderId: string | null = null

    try {
      const placeholderMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      placeholderId = placeholderMessage.id
      replaceMessages([...latestMessages, placeholderMessage])

      const response = await fetch("/api/workflow/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: "応答の取得に失敗しました" }))
        throw new Error(errorPayload?.error || "応答の取得に失敗しました")
      }

      if (!response.body) {
        throw new Error("ストリーミングレスポンスが利用できませんでした")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      const processThinking = (stages: WorkflowStage[]) => {
        const safeStages = Array.isArray(stages) ? stages : []
        const thinkingText = formatThinking(safeStages)
        mutateMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderMessage.id ? { ...msg, thinking: thinkingText, stages: safeStages } : msg,
          ),
        )
      }

      const appendAnswer = (chunk: string) => {
        const safeChunk = chunk ?? ""
        mutateMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderMessage.id ? { ...msg, content: (msg.content ?? "") + safeChunk } : msg,
          ),
        )
      }

      const processEvent = (event: StreamEvent) => {
        if (!event || typeof event !== "object") return
        switch (event.type) {
          case "thinking":
            processThinking(event.stages || [])
            break
          case "answer":
            appendAnswer(event.content || "")
            break
          case "error":
            throw new Error(event.message || "ワークフロー実行中にエラーが発生しました")
          case "done":
          default:
            break
        }
      }

      let doneStreaming = false

      while (!doneStreaming) {
        const { value, done } = await reader.read()
        if (done) {
          if (buffer.trim()) {
            processEvent(JSON.parse(buffer.trim()))
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        let newlineIndex
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)
          if (!line) continue
          const parsed = JSON.parse(line)
          if (parsed.type === "done") {
            doneStreaming = true
            break
          }
          processEvent(parsed)
        }
      }

      const snapshot = latestMessages
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeConversationId) {
            return conv
          }
          return {
            ...conv,
            messages: snapshot,
            title:
              conv.title === "New Chat"
                ? trimmed.substring(0, 30) + (trimmed.length > 30 ? "..." : "")
                : conv.title,
          }
        }),
      )
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage = error instanceof Error ? error.message : "メッセージ処理中にエラーが発生しました"
      if (placeholderId) {
        mutateMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? { ...msg, content: `エラー: ${errorMessage}`, thinking: undefined, stages: undefined }
              : msg,
          ),
        )
      } else {
        replaceMessages([
          ...latestMessages,
          {
            id: `msg-${Date.now() + 2}`,
            role: "assistant",
            content: `エラー: ${errorMessage}`,
            timestamp: new Date(),
          },
        ])
      }

      setConversations((prev) =>
        prev.map((conv) => (conv.id === activeConversationId ? { ...conv, messages: latestMessages } : conv)),
      )
    } finally {
      setIsLoading(false)
    }
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
