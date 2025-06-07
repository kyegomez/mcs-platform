export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentId?: string
}

export interface Agent {
  id: string
  name: string
  specialty: string
  description: string
  icon: string
  iconColor: string
  systemPrompt: string
}
