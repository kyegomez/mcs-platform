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
  agentId?: string
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: Date
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  category: string
  attachments: FileAttachment[]
  color: string
  pinned: boolean
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high"
  read: boolean
  createdAt: Date
  agentId: string
  noteId?: string // Optional reference to a note
}
