"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getChatAgentIds, getTotalMessageCount, getLastChatDate } from "@/lib/chat-storage"
import { getTriggeredAlerts, dismissAlert } from "@/lib/alert-system"
import { agents } from "@/data/agents"
import type { Alert } from "@/types/agent"
import {
  MessageSquare,
  FileText,
  TrendingUp,
  Heart,
  Activity,
  Watch,
  Smartphone,
  Zap,
  Clock,
  Bell,
  Check,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoalsSection } from "@/components/goals-section"
import { SubscriptionCards } from "@/components/subscription-cards"

interface HealthMetrics {
  notesCount: number
  specialistsCount: number
  messagesCount: number
  lastActivityDate: Date | null
  healthScore: number
  streakDays: number
}

export default function AccountPage() {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    notesCount: 0,
    specialistsCount: 0,
    messagesCount: 0,
    lastActivityDate: null,
    healthScore: 0,
    streakDays: 0,
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsExpanded, setAlertsExpanded] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadData = () => {
      // Get notes count
      const getNotes = () => {
        try {
          const savedNotes = localStorage.getItem("mcs-notes")
          if (savedNotes) {
            const parsedNotes = JSON.parse(savedNotes)
            return parsedNotes.length
          }
          return 0
        } catch (error) {
          return 0
        }
      }

      // Calculate health score based on activity
      const calculateHealthScore = (notes: number, specialists: number, messages: number) => {
        let score = 0

        // Notes contribute 40% (up to 40 points)
        score += Math.min(notes * 4, 40)

        // Specialists contribute 30% (up to 30 points)
        score += Math.min(specialists * 6, 30)

        // Messages contribute 30% (up to 30 points)
        score += Math.min(messages * 2, 30)

        return Math.min(score, 100)
      }

      // Calculate streak days (simplified - based on recent activity)
      const calculateStreak = (lastDate: Date | null) => {
        if (!lastDate) return 0

        const now = new Date()
        const diffInDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffInDays <= 1) return Math.floor(Math.random() * 7) + 1 // Simulate streak
        return 0
      }

      const notesCount = getNotes()
      const specialistsCount = getChatAgentIds().length
      const messagesCount = getTotalMessageCount()
      const lastActivityDate = getLastChatDate()
      const healthScore = calculateHealthScore(notesCount, specialistsCount, messagesCount)
      const streakDays = calculateStreak(lastActivityDate)

      setMetrics({
        notesCount,
        specialistsCount,
        messagesCount,
        lastActivityDate,
        healthScore,
        streakDays,
      })

      // Load alerts
      const triggeredAlerts = getTriggeredAlerts()
      setAlerts(triggeredAlerts)

      setIsLoaded(true)
    }

    loadData()

    const handleStorageChange = () => {
      loadData()
    }

    // Set up interval to check for new alerts
    const interval = setInterval(() => {
      setAlerts(getTriggeredAlerts())
    }, 60000) // Check every minute

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("notesUpdated", handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("notesUpdated", handleStorageChange)
    }
  }, [])

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Attention"
  }

  const markAsRead = (id: string) => {
    dismissAlert(id)
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const markAllAlertsAsRead = () => {
    alerts.forEach((alert) => {
      if (!alert.read) {
        dismissAlert(alert.id)
      }
    })
    setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
  }

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Bell className="h-4 w-4 text-mcs-blue" />
    }
  }

  const getSeverityBadge = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50 text-xs">High</Badge>
      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50 text-xs">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge className="bg-mcs-blue/20 text-mcs-blue hover:bg-mcs-blue/30 border-mcs-blue/50 text-xs">Low</Badge>
        )
    }
  }

  const handleViewNote = (noteId: string) => {
    localStorage.setItem("mcs-view-note-id", noteId)
    router.push("/notes")
  }

  const unreadAlertsCount = alerts.filter((alert) => !alert.read).length

  const integrations = [
    {
      name: "Apple Watch",
      icon: Watch,
      description: "Heart rate, activity, and sleep tracking",
      status: "Coming Soon",
      color: "from-gray-500 to-gray-600",
    },
    {
      name: "Fitbit",
      icon: Activity,
      description: "Steps, workouts, and health metrics",
      status: "Coming Soon",
      color: "from-green-500 to-green-600",
    },
    {
      name: "iPhone Health",
      icon: Smartphone,
      description: "Comprehensive health data sync",
      status: "Coming Soon",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Google Fit",
      icon: Heart,
      description: "Activity and wellness tracking",
      status: "Coming Soon",
      color: "from-red-500 to-red-600",
    },
    {
      name: "MyFitnessPal",
      icon: Zap,
      description: "Nutrition and calorie tracking",
      status: "Coming Soon",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Strava",
      icon: TrendingUp,
      description: "Running and cycling activities",
      status: "Coming Soon",
      color: "from-orange-500 to-orange-600",
    },
  ]

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 px-4">
        <div className="text-center pt-8 pb-4">
          <div className="w-24 h-6 bg-white/10 rounded mx-auto mb-2"></div>
          <div className="w-48 h-4 bg-white/5 rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 bg-white/5">
              <CardContent className="p-6">
                <div className="w-full h-20 bg-white/5 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-light text-white mb-2">Account</h1>
        <p className="text-gray-400 text-lg font-light">Your health journey overview</p>
      </div>

      {/* Health Score Card */}
      <Card className="border-0 bg-gradient-to-br from-mcs-blue/10 to-mcs-blue/5">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mcs-blue/20 flex items-center justify-center">
            <Heart className="w-10 h-10 text-mcs-blue" />
          </div>
          <h2 className="text-3xl font-light text-white mb-2">Health Score</h2>
          <div className={`text-6xl font-light mb-2 ${getHealthScoreColor(metrics.healthScore)}`}>
            {metrics.healthScore}
          </div>
          <p className={`text-lg font-medium mb-4 ${getHealthScoreColor(metrics.healthScore)}`}>
            {getHealthScoreLabel(metrics.healthScore)}
          </p>
          <p className="text-gray-400 font-light">Based on your activity, notes, and specialist consultations</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-light text-white mb-1">{metrics.notesCount}</div>
            <p className="text-gray-400 font-light">Health Notes</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-3xl font-light text-white mb-1">{metrics.specialistsCount}</div>
            <p className="text-gray-400 font-light">Specialists Consulted</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-light text-white mb-1">{metrics.streakDays}</div>
            <p className="text-gray-400 font-light">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Cards */}
      <SubscriptionCards />

      {/* Goals Section */}
      <GoalsSection />

      {/* Alerts Section */}
      <Card className="border-0 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-mcs-blue" />
              <CardTitle className="text-white font-medium">Alerts & Notifications</CardTitle>
              {unreadAlertsCount > 0 && (
                <Badge className="bg-mcs-blue text-white text-xs">{unreadAlertsCount} new</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadAlertsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAlertsAsRead}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsExpanded(!alertsExpanded)}
                className="text-gray-400 hover:text-white"
              >
                {alertsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 font-light">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show first 2 alerts by default, all when expanded */}
              {(alertsExpanded ? alerts : alerts.slice(0, 2)).map((alert) => {
                const agent = agents.find((a) => a.id === alert.agentId)
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg ${
                      !alert.read ? "bg-mcs-blue/10 border border-mcs-blue/20" : "bg-white/5"
                    } transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                            {!alert.read && <span className="h-1.5 w-1.5 rounded-full bg-mcs-blue"></span>}
                          </div>
                          <p className="text-gray-400 text-sm font-light mb-2">{alert.description}</p>
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(alert.severity)}
                            <span className="text-xs text-gray-500">
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
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {alert.noteId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewNote(alert.noteId!)}
                          className="text-xs border-white/20 text-white hover:bg-white/10"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Note
                        </Button>
                      )}

                      {agent && (
                        <Link href={`/chat/${agent.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-white/20 text-white hover:bg-white/10"
                          >
                            Chat with {agent.name}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}

              {!alertsExpanded && alerts.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlertsExpanded(true)}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  Show {alerts.length - 2} more alerts
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="border-0 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white font-medium flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-mcs-blue" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300 font-light">Total Messages</span>
            <span className="text-white font-medium">{metrics.messagesCount}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300 font-light">Last Activity</span>
            <span className="text-white font-medium">
              {metrics.lastActivityDate ? metrics.lastActivityDate.toLocaleDateString() : "No activity yet"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300 font-light">Account Created</span>
            <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Coming Soon */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white mb-2">Integrations</h2>
          <p className="text-gray-400 font-light">Connect your favorite health apps and devices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const IconComponent = integration.icon
            return (
              <Card
                key={integration.name}
                className="border-0 bg-white/5 hover:bg-white/10 transition-all duration-200 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-1">{integration.name}</h3>
                      <p className="text-sm text-gray-400 font-light mb-2">{integration.description}</p>
                      <Badge variant="outline" className="text-xs border-mcs-blue/30 text-mcs-blue bg-mcs-blue/10">
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-500 font-light text-sm">More integrations coming soon. Stay tuned for updates!</p>
        </div>
      </div>

      {/* Account Actions */}
      <Card className="border-0 bg-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white mb-1">Account Settings</h3>
              <p className="text-sm text-gray-400 font-light">Manage your preferences and data</p>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
