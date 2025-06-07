"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { AlertManager } from "@/components/alert-manager"
import { agents } from "@/data/agents"
import { AgentIcon } from "@/components/agent-icon"
import { getChatAgentIds, getChatHistory } from "@/lib/chat-storage"
import Link from "next/link"
import { ArrowRight, Calendar, FileText, Bell, MessageSquare, Activity } from "lucide-react"

interface RecentActivity {
  agentId: string
  agentName: string
  specialty: string
  icon: string
  iconColor: string
  lastMessageTime: Date
  messageCount: number
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Get real recent activity from chat history
    const getRecentActivity = () => {
      const chatAgentIds = getChatAgentIds()
      const activities: RecentActivity[] = []

      chatAgentIds.forEach((agentId) => {
        const agent = agents.find((a) => a.id === agentId)
        if (agent) {
          const chatHistory = getChatHistory(agentId)
          if (chatHistory.length > 0) {
            const lastMessage = chatHistory[chatHistory.length - 1]
            activities.push({
              agentId: agent.id,
              agentName: agent.name,
              specialty: agent.specialty,
              icon: agent.icon,
              iconColor: agent.iconColor,
              lastMessageTime: lastMessage.timestamp,
              messageCount: chatHistory.length,
            })
          }
        }
      })

      // Sort by most recent activity
      activities.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())

      // Take only the 3 most recent
      setRecentActivity(activities.slice(0, 3))
    }

    getRecentActivity()

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      getRecentActivity()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Get featured specialists (first 6)
  const featuredSpecialists = agents.slice(0, 6)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Alert Manager */}
      <AlertManager />

      {/* Header Section */}
      <div className="glass p-6 rounded-xl border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to <span className="text-mcs-blue">MCS</span>
            </h1>
            <p className="text-gray-400">
              Your AI-powered healthcare companion • {currentTime.toLocaleDateString()} •{" "}
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat">
              <Button className="btn-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </Link>
            <Link href="/notes">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <FileText className="h-4 w-4 mr-2" />
                My Notes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <DashboardMetrics />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/chat">
          <Card className="glass-card border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-mcs-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-mcs-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Chat</h3>
                  <p className="text-sm text-gray-400">Talk to specialists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notes">
          <Card className="glass-card border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Health Notes</h3>
                  <p className="text-sm text-gray-400">Track your health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="glass-card border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Calendar</h3>
                  <p className="text-sm text-gray-400">View appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/alerts">
          <Card className="glass-card border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Alerts</h3>
                  <p className="text-sm text-gray-400">Health reminders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Specialists */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Featured Specialists</h2>
          <Link href="/chat">
            <Button variant="ghost" className="text-mcs-blue hover:bg-mcs-blue/20">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSpecialists.map((agent) => (
            <Link key={agent.id} href={`/chat/${agent.id}`}>
              <Card className="glass-card border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110"
                        style={{
                          borderColor: agent.iconColor + "30",
                          backgroundColor: agent.iconColor + "10",
                        }}
                      >
                        <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="lg" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full status-online border-2 border-black"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-mcs-blue transition-colors">
                        {agent.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs border-white/20 text-gray-300 mt-1"
                        style={{ borderColor: agent.iconColor + "30", color: agent.iconColor }}
                      >
                        {agent.specialty}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{agent.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      Available now
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-mcs-blue transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-mcs-blue" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">Your latest specialist conversations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <Link key={activity.agentId} href={`/chat/${activity.agentId}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:scale-105"
                    style={{
                      borderColor: activity.iconColor + "30",
                      backgroundColor: activity.iconColor + "10",
                    }}
                  >
                    <AgentIcon iconName={activity.icon} iconColor={activity.iconColor} size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-mcs-blue transition-colors">
                      {activity.agentName}
                    </p>
                    <p className="text-xs text-gray-400">{activity.specialty}</p>
                    <p className="text-xs text-gray-500">{activity.messageCount} messages</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.lastMessageTime)}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-mcs-blue transition-colors mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
