"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { WorkflowStage } from "@/types/chat"

interface ThinkingDisplayProps {
  thinking: string
  stages?: WorkflowStage[]
}

export default function ThinkingDisplay({ thinking, stages }: ThinkingDisplayProps) {
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
          <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-muted/50 space-y-2">
            {stages && stages.length > 0 && (
              <div className="space-y-2 mb-3">
                {stages.map((stage, index) => (
                  <div key={stage.id || index} className="text-xs">
                    <div className="font-semibold text-foreground mb-1">
                      {stage.label}
                      {stage.model && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-mono">
                          {stage.model.includes('haiku') ? '🟢 Haiku' :
                           stage.model.includes('grok') || stage.model.includes('xai') ? '🔵 Grok' :
                           stage.model}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono border-t border-muted/50 pt-2">{thinking}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
