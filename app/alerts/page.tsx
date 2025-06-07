"use client"

import { useState, useEffect } from "react"
import type { Alert } from "@/types/agent"
import { agents } from "@/data/agents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, AlertTriangle, AlertCircle, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getTriggeredAlerts, dismissAlert } from "@/lib/alert-system"
import { useRouter } from "next/navigation"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const router = useRouter()

  useEffect(() => {
    // Load triggered alerts from the alert system
    const triggeredAlerts = getTriggeredAlerts()
    setAlerts(triggeredAlerts)

    // Set up interval to check for new alerts
    const interval = setInterval(() => {
      setAlerts(getTriggeredAlerts())
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    dismissAlert(id)
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const markAllAsRead = () => {
    alerts.forEach((alert) => {
      if (!alert.read) {
        dismissAlert(alert.id)
      }
    })
    setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "unread") return !alert.read
    if (filter === "read") return alert.read
    return true
  })

  const unreadCount = alerts.filter((alert) => !alert.read).length

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "low":
        return <Bell className="h-5 w-5 text-mcs-blue" />
    }
  }

  const getSeverityBadge = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">High</Badge>
      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">Medium</Badge>
        )
      case "low":
        return <Badge className="bg-mcs-blue/20 text-mcs-blue hover:bg-mcs-blue/30 border-mcs-blue/50">Low</Badge>
    }
  }

  const handleViewNote = (noteId: string) => {
    // Store the note ID to view in localStorage
    localStorage.setItem("mcs-view-note-id", noteId)
    // Navigate to notes page
    router.push("/notes")
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          {unreadCount > 0 && <Badge className="bg-mcs-blue text-white">{unreadCount} unread</Badge>}
        </div>
        <p className="text-mcs-gray-light">Important notifications and recommendations from your healthcare agents.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-mcs-blue hover:bg-mcs-blue-light" : ""}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={filter === "unread" ? "bg-mcs-blue hover:bg-mcs-blue-light" : ""}
          >
            Unread
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("read")}
            className={filter === "read" ? "bg-mcs-blue hover:bg-mcs-blue-light" : ""}
          >
            Read
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-mcs-gray-light hover:text-white">
            <Check className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="bg-black border-mcs-gray">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Bell className="h-12 w-12 text-mcs-gray-light mb-4" />
              <p className="text-mcs-gray-light">No alerts to display.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const agent = agents.find((a) => a.id === alert.agentId)
            return (
              <Card
                key={alert.id}
                className={`bg-black ${
                  !alert.read ? "border-mcs-blue/50" : "border-mcs-gray"
                } transition-all duration-200`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {alert.title}
                        {!alert.read && <span className="h-2 w-2 rounded-full bg-mcs-blue"></span>}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-xs text-mcs-gray-light">
                          {alert.createdAt.toLocaleDateString()} at{" "}
                          {alert.createdAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!alert.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                      className="text-mcs-gray-light hover:text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-mcs-gray-light mb-4">{alert.description}</p>

                  <div className="flex flex-wrap gap-3">
                    {alert.noteId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewNote(alert.noteId!)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Note
                      </Button>
                    )}

                    {agent && (
                      <Link href={`/chat/${agent.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-md bg-mcs-gray/30 hover:bg-mcs-gray/50 transition-colors">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={agent.avatar || "/placeholder.svg"}
                              alt={agent.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{agent.name}</p>
                            <p className="text-xs text-mcs-blue">{agent.specialty}</p>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
