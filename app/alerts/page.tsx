"use client"

import { useState, useEffect } from "react"
import type { Alert } from "@/types/agent"
import { agents } from "@/data/agents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, AlertTriangle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Sample alerts data
const sampleAlerts: Alert[] = [
  {
    id: "1",
    title: "Medication Reminder",
    description: "Remember to take your blood pressure medication today.",
    severity: "medium",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    agentId: "cardio-specialist",
  },
  {
    id: "2",
    title: "Appointment Scheduled",
    description: "Your virtual follow-up with Dr. Neuro is scheduled for tomorrow at 10:00 AM.",
    severity: "low",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    agentId: "neuro-specialist",
  },
  {
    id: "3",
    title: "Abnormal Heart Rate Detected",
    description:
      "Your smartwatch recorded an elevated heart rate during rest. Consider discussing this with your healthcare provider.",
    severity: "high",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    agentId: "cardio-specialist",
  },
  {
    id: "4",
    title: "Nutrition Plan Update",
    description:
      "Based on your recent notes, I've updated your nutrition recommendations. Check your chat for details.",
    severity: "medium",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    agentId: "nutrition-specialist",
  },
  {
    id: "5",
    title: "Sleep Pattern Analysis",
    description:
      "Your sleep data shows irregular patterns. I've prepared some recommendations to improve your sleep quality.",
    severity: "medium",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    agentId: "mental-specialist",
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    // In a real app, fetch alerts from an API
    // For now, use sample data
    setAlerts(sampleAlerts)
  }, [])

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const markAllAsRead = () => {
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
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
