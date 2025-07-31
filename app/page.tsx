"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { agents } from "@/data/agents"
import { AgentIcon } from "@/components/agent-icon"
import { getChatAgentIds, getChatHistory } from "@/lib/chat-storage"
import Link from "next/link"
import { FileText, ArrowRight, MessageSquare, Sparkles } from "lucide-react"
import Head from "next/head"

interface RecentActivity {
  agentId: string
  agentName: string
  specialty: string
  icon: string
  iconColor: string
  lastMessageTime: Date
}

export default function Dashboard() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [notesCount, setNotesCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

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
            })
          }
        }
      })

      activities.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
      setRecentActivity(activities.slice(0, 3))
    }

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

    getRecentActivity()
    setNotesCount(getNotes())
    setIsLoaded(true)

    const handleStorageChange = () => {
      getRecentActivity()
      setNotesCount(getNotes())
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("notesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("notesUpdated", handleStorageChange)
    }
  }, [])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
        <div className="text-center pt-8 pb-4">
          <div className="loading-shimmer h-10 w-48 mx-auto rounded-lg mb-4"></div>
          <div className="loading-shimmer h-6 w-64 mx-auto rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="loading-shimmer h-32 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>MCS - Modern Care System | AI Healthcare Dashboard</title>
        <meta
          name="description"
          content="Access your AI-powered healthcare dashboard. Chat with medical specialists, track health notes, and manage your wellness journey with MCS."
        />
        <meta
          name="keywords"
          content="healthcare dashboard, AI medical advice, health tracking, medical specialists, digital health platform"
        />
        <link rel="canonical" href="https://mcs-health.vercel.app/" />
      </Head>

      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 page-transition">
        {/* Header with animation */}
        <header className="text-center pt-8 pb-4 spring-bounce">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-mcs-blue animate-pulse" />
            <h1 className="text-4xl sm:text-5xl font-light text-foreground">Health</h1>
          </div>
                      <p className="text-muted-foreground text-lg sm:text-xl font-light max-w-2xl mx-auto mb-6">
            Your personal healthcare assistant powered by AI
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/chat">
              <Button className="px-6 py-2 bg-mcs-blue hover:bg-mcs-blue-light">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-6 py-2 border-gray-400 text-gray-300 hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Actions - Enhanced for mobile */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" aria-label="Main Actions">
          <Link href="/chat" aria-label="Start consultation with AI medical specialists" className="stagger-item">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-mcs-blue/10 to-mcs-blue/5 hover:from-mcs-blue/20 hover:to-mcs-blue/10 card-interactive h-full">
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-mcs-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 elastic-scale">
                  <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-mcs-blue" />
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-2 sm:mb-3">Talk to a Specialist</h2>
                <p className="text-muted-foreground font-light text-sm sm:text-base">
                  Get instant medical advice from AI specialists
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notes" aria-label="Access your health journal and notes" className="stagger-item">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 card-interactive h-full">
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 elastic-scale">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-2 sm:mb-3">Health Journal</h2>
                <p className="text-muted-foreground font-light text-sm sm:text-base">
                  {notesCount > 0 ? `${notesCount} notes saved` : "Track your health journey"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Recent Conversations - Enhanced mobile layout */}
        {recentActivity.length > 0 && (
          <section className="space-y-4 sm:space-y-6 stagger-item" aria-label="Recent Activity">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-medium text-foreground">Recent</h2>
              <Link href="/chat">
                <Button
                  variant="ghost"
                  className="text-mcs-blue hover:bg-mcs-blue/10 font-light btn-interactive text-sm sm:text-base"
                >
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <Link
                  key={activity.agentId}
                  href={`/chat/${activity.agentId}`}
                  className="stagger-item"
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <Card className="group cursor-pointer border-0 bg-white/5 hover:bg-white/10 card-interactive">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          style={{
                            backgroundColor: activity.iconColor + "20",
                          }}
                        >
                          <AgentIcon iconName={activity.icon} iconColor={activity.iconColor} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                            {activity.agentName}
                          </p>
                          <p className="text-sm text-gray-400 font-light truncate">{activity.specialty}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm text-gray-500 font-light">
                            {formatTimeAgo(activity.lastMessageTime)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-mcs-blue transition-colors mt-1 ml-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Specialists - Mobile-optimized grid */}
        <section className="space-y-4 sm:space-y-6 stagger-item" aria-label="Medical Specialists">
                      <h2 className="text-xl sm:text-2xl font-medium text-foreground">Specialists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {agents.slice(0, 8).map((agent, index) => (
              <Link
                key={agent.id}
                href={`/chat/${agent.id}`}
                aria-label={`Chat with ${agent.name}, ${agent.specialty}`}
                className="stagger-item"
                style={{ animationDelay: `${(index + 5) * 0.1}s` }}
              >
                <Card className="group cursor-pointer border-0 bg-white/5 hover:bg-white/10 card-interactive h-full">
                  <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: agent.iconColor + "20",
                      }}
                    >
                      <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />
                    </div>
                    <h3 className="font-medium text-foreground text-xs sm:text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-light line-clamp-2">{agent.specialty}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/chat">
              <Button variant="ghost" className="text-mcs-blue hover:bg-mcs-blue/10 font-light btn-interactive">
                View All Specialists
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
