"use client"

import { useEffect, useRef } from "react"
import MessageBubble from "./message-bubble"
import ThinkingDisplay from "./thinking-display"
import type { Message } from "@/types/chat"

interface ChatContainerProps {
  messages: Message[]
  isLoading: boolean
}

export default function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">メッセージを入力して開始してください</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble message={message} />
              {message.thinking && <ThinkingDisplay thinking={message.thinking} />}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="inline-block">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
