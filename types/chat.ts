export interface WorkflowStage {
  id: string
  label: string
  input: string
  output: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
  timestamp: Date
  stages?: WorkflowStage[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}
