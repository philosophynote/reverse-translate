import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")

  const submitMessage = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-background p-4">
      <div className="flex gap-3 max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力してください..."
          disabled={isLoading}
          rows={1}
          className="flex-1 px-4 py-3 bg-card text-card-foreground rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
        />
        <Button type="submit" disabled={!input.trim() || isLoading} size="icon" className="self-end">
          <Send size={18} />
        </Button>
      </div>
    </form>
  )
}
