"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { chatService } from "@/lib/services/chat-service"
import { notesService } from "@/lib/services/notes-service"

export function DashboardMetrics() {
  const { user } = useAuth()
  const [notesCount, setNotesCount] = useState(0)
  const [agentsCount, setAgentsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [lastChatDate, setLastChatDate] = useState<Date | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadMetrics = async () => {
      setIsLoading(true)
      try {
        // Get user's chats
        const chats = await chatService.getUserChats(user.id)

        // Count unique agents
        const uniqueAgents = new Set(chats.map((chat) => chat.agent_id))
        setAgentsCount(uniqueAgents.size)

        // Count total messages
        let totalMessages = 0
        let latestDate: Date | null = null

        chats.forEach((chat) => {
          if (chat.chat_messages) {
            totalMessages += chat.chat_messages.length

            // Find the latest message date
            chat.chat_messages.forEach((message) => {
              const messageDate = new Date(message.timestamp)
              if (!latestDate || messageDate > latestDate) {
                latestDate = messageDate
              }
            })
          }
        })

        setMessagesCount(totalMessages)
        setLastChatDate(latestDate)

        // Get notes count
        const notes = await notesService.getUserNotes(user.id)
        setNotesCount(notes.length)

        setIsLoaded(true)
      } catch (error) {
        console.error("Error loading metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [user])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black border-mcs-gray">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-mcs-gray-light">Loading...</CardTitle>
              <div className="h-4 w-4 animate-pulse bg-mcs-gray-light rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-mcs-gray-light/20 animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-mcs-gray-light/20 animate-pulse rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-black border-mcs-gray hover:border-mcs-blue transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Health Notes</CardTitle>
          <FileText className="h-4 w-4 text-mcs-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notesCount}</div>
          <p className="text-xs text-mcs-gray-light mt-1">
            {notesCount === 0
              ? "No health notes created yet"
              : notesCount === 1
                ? "1 health note created"
                : `${notesCount} health notes created`}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black border-mcs-gray hover:border-mcs-blue transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Specialists Consulted</CardTitle>
          <Users className="h-4 w-4 text-mcs-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{agentsCount}</div>
          <p className="text-xs text-mcs-gray-light mt-1">
            {agentsCount === 0
              ? "No specialists consulted yet"
              : agentsCount === 1
                ? "1 specialist consulted"
                : `${agentsCount} specialists consulted`}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-black border-mcs-gray hover:border-mcs-blue transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-mcs-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{messagesCount}</div>
          <p className="text-xs text-mcs-gray-light mt-1">
            {lastChatDate ? `Last conversation: ${lastChatDate.toLocaleDateString()}` : "No conversations yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
