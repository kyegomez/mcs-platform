"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getChatAgentIds, getTotalMessageCount, getLastChatDate } from "@/lib/chat-storage"
import { MessageSquare, Users, FileText, TrendingUp } from "lucide-react"

export function DashboardMetrics() {
  const [notesCount, setNotesCount] = useState(0)
  const [agentsCount, setAgentsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [lastChatDate, setLastChatDate] = useState<Date | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get metrics from localStorage
    const getNotes = () => {
      try {
        const savedNotes = localStorage.getItem("mcs-notes")
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes)
          return parsedNotes.length
        }
        return 0
      } catch (error) {
        console.error("Error getting notes count:", error)
        return 0
      }
    }

    const loadMetrics = () => {
      setNotesCount(getNotes())
      setAgentsCount(getChatAgentIds().length)
      setMessagesCount(getTotalMessageCount())
      setLastChatDate(getLastChatDate())
      setIsLoaded(true)
    }

    loadMetrics()

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadMetrics()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("notesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("notesUpdated", handleStorageChange)
    }
  }, [])

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="skeleton h-4 w-20 mb-2 rounded"></div>
              <div className="skeleton h-8 w-16 mb-2 rounded"></div>
              <div className="skeleton h-3 w-32 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: "Health Notes",
      value: notesCount,
      icon: FileText,
      description:
        notesCount === 0
          ? "No health notes created yet"
          : notesCount === 1
            ? "1 health note created"
            : `${notesCount} health notes created`,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      title: "Specialists Consulted",
      value: agentsCount,
      icon: Users,
      description:
        agentsCount === 0
          ? "No specialists consulted yet"
          : agentsCount === 1
            ? "1 specialist consulted"
            : `${agentsCount} specialists consulted`,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "Total Messages",
      value: messagesCount,
      icon: MessageSquare,
      description: lastChatDate ? `Last conversation: ${lastChatDate.toLocaleDateString()}` : "No conversations yet",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        return (
          <Card key={metric.title} className="glass-card hover-glow group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">{metric.title}</CardTitle>
              <div
                className={`p-2.5 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <IconComponent className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.value}
                  </span>
                  {metric.value > 0 && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
