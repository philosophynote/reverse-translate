"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface ThinkingDisplayProps {
  thinking: string
}

export default function ThinkingDisplay({ thinking }: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-xl">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg bg-muted/30 hover:bg-muted/50 w-full text-left"
        >
          <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          <span className="font-medium">推考プロセス</span>
        </button>

        {isExpanded && (
          <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-muted/50">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono">{thinking}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
