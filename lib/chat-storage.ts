import type { ChatMessage } from "@/types/agent"

// Key prefix for localStorage
const CHAT_STORAGE_KEY_PREFIX = "mcs-chat-history-"

// Get chat history for a specific agent
export function getChatHistory(agentId: string): ChatMessage[] {
  if (typeof window === "undefined") return []

  try {
    const storedChat = localStorage.getItem(`${CHAT_STORAGE_KEY_PREFIX}${agentId}`)
    if (!storedChat) return []

    const parsedChat = JSON.parse(storedChat)

    // Convert string dates back to Date objects
    return parsedChat.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }))
  } catch (error) {
    console.error("Error retrieving chat history:", error)
    return []
  }
}

// Save chat history for a specific agent
export function saveChatHistory(agentId: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(`${CHAT_STORAGE_KEY_PREFIX}${agentId}`, JSON.stringify(messages))
  } catch (error) {
    console.error("Error saving chat history:", error)
  }
}

// Get all agent IDs the user has chatted with
export function getChatAgentIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const agentIds: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CHAT_STORAGE_KEY_PREFIX)) {
        const agentId = key.replace(CHAT_STORAGE_KEY_PREFIX, "")
        agentIds.push(agentId)
      }
    }

    return agentIds
  } catch (error) {
    console.error("Error retrieving chat agent IDs:", error)
    return []
  }
}

// Get total number of messages across all chats
export function getTotalMessageCount(): number {
  if (typeof window === "undefined") return 0

  try {
    let totalCount = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CHAT_STORAGE_KEY_PREFIX)) {
        const storedChat = localStorage.getItem(key)
        if (storedChat) {
          const parsedChat = JSON.parse(storedChat)
          totalCount += parsedChat.length
        }
      }
    }

    return totalCount
  } catch (error) {
    console.error("Error calculating total message count:", error)
    return 0
  }
}

// Get the date of the last chat message
export function getLastChatDate(): Date | null {
  if (typeof window === "undefined") return null

  try {
    let lastDate: Date | null = null

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CHAT_STORAGE_KEY_PREFIX)) {
        const storedChat = localStorage.getItem(key)
        if (storedChat) {
          const parsedChat = JSON.parse(storedChat)
          if (parsedChat.length > 0) {
            const chatLastMessage = parsedChat[parsedChat.length - 1]
            const messageDate = new Date(chatLastMessage.timestamp)

            if (!lastDate || messageDate > lastDate) {
              lastDate = messageDate
            }
          }
        }
      }
    }

    return lastDate
  } catch (error) {
    console.error("Error finding last chat date:", error)
    return null
  }
}
