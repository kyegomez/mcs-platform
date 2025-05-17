export interface Agent {
  id: string
  name: string
  specialty: string
  description: string
  avatar: string
  systemPrompt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  chatId?: string
  agentId?: string
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high"
  read: boolean
  createdAt: Date
  agentId: string
}

export interface Chat {
  id: string
  userId: string
  agentId: string
  createdAt: Date
  updatedAt: Date
  messages?: ChatMessage[]
}
