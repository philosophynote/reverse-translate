import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-lg ${
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        {!isUser && message.stages && message.stages.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.stages.map((stage, index) => (
              <div key={`${stage.id}-${index}`} className="rounded-md border border-border bg-muted/40 p-2">
                <p className="text-xs font-semibold text-foreground">
                  {index + 1}. {stage.label}
                </p>
                <div className="mt-1 text-[11px] text-muted-foreground whitespace-pre-wrap">
                  <p>
                    <span className="font-semibold text-foreground/80">Input:</span> {stage.input}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-foreground/80">Output:</span> {stage.output}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs mt-2 opacity-70">
          {message.timestamp.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
