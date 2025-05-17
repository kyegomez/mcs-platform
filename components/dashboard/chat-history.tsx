"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare } from "lucide-react"
import { agents } from "@/data/agents"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { chatService } from "@/lib/services/chat-service"

export function ChatHistory() {
  const { user } = useAuth()
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadRecentChats = async () => {
      setIsLoading(true)
      try {
        const chats = await chatService.getUserChats(user.id)
        const formattedChats = chats
          .map((chat) => {
            const agent = agents.find((a) => a.id === chat.agent_id)
            if (!agent) return null

            // Get the most recent message
            const messages = chat.chat_messages || []
            const lastMessage =
              messages.length > 0
                ? messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
                : null

            return {
              chatId: chat.id,
              agentId: chat.agent_id,
              agentName: agent.name,
              agentAvatar: agent.avatar,
              agentSpecialty: agent.specialty,
              lastMessage: lastMessage?.content || "No messages yet",
              timestamp: lastMessage ? new Date(lastMessage.timestamp) : new Date(chat.updated_at),
              messageCount: messages.length,
            }
          })
          .filter(Boolean)

        // Sort by most recent
        formattedChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setRecentChats(formattedChats)
      } catch (error) {
        console.error("Error loading recent chats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentChats()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <Card className="bg-black border-mcs-gray">
      <CardHeader>
        <CardTitle>Chat History</CardTitle>
        <CardDescription>Your conversations with healthcare specialists</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-mcs-blue" />
          </div>
        ) : recentChats.length > 0 ? (
          <div className="space-y-4">
            {recentChats.map((chat, index) => (
              <Link href={`/chat/${chat.agentId}`} key={index}>
                <div className="flex items-start gap-4 p-4 rounded-md hover:bg-mcs-gray/20 transition-colors border border-mcs-gray">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={chat.agentAvatar || "/placeholder.svg"}
                      alt={chat.agentName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{chat.agentName}</p>
                      <span className="text-xs text-mcs-gray-light">{formatDate(chat.timestamp)}</span>
                    </div>
                    <p className="text-sm text-mcs-blue">{chat.agentSpecialty}</p>
                    <p className="text-sm text-mcs-gray-light line-clamp-2 mt-2">{chat.lastMessage}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-mcs-gray/30 px-2 py-1 rounded-full text-mcs-gray-light">
                        {chat.messageCount} messages
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-mcs-gray-light mb-4" />
            <p className="text-mcs-gray-light mb-4">You haven't chatted with any specialists yet.</p>
            <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
              <Link href="/chat">Start a Conversation</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
