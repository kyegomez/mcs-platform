"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { agents } from "@/data/agents"
import { AgentIcon } from "@/components/agent-icon"
import { getChatAgentIds, getChatHistory } from "@/lib/chat-storage"
import Link from "next/link"
import { FileText, ArrowRight, MessageSquare } from "lucide-react"
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

      <div className="max-w-4xl mx-auto space-y-8 px-4">
        {/* Simple Header */}
        <header className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-light text-white mb-2">Health</h1>
          <p className="text-gray-400 text-lg font-light">Your personal healthcare assistant</p>
        </header>

        {/* Main Actions - Apple-style large buttons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Main Actions">
          <Link href="/chat" aria-label="Start consultation with AI medical specialists">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-mcs-blue/10 to-mcs-blue/5 hover:from-mcs-blue/20 hover:to-mcs-blue/10 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mcs-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-mcs-blue" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2">Talk to a Specialist</h2>
                <p className="text-gray-400 font-light">Get instant medical advice from AI specialists</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notes" aria-label="Access your health journal and notes">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2">Health Journal</h2>
                <p className="text-gray-400 font-light">
                  {notesCount > 0 ? `${notesCount} notes saved` : "Track your health journey"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Recent Conversations - Only show if there are any */}
        {recentActivity.length > 0 && (
          <section className="space-y-4" aria-label="Recent Activity">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-white">Recent</h2>
              <Link href="/chat">
                <Button variant="ghost" className="text-mcs-blue hover:bg-mcs-blue/10 font-light">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <Link key={activity.agentId} href={`/chat/${activity.agentId}`}>
                  <Card className="group cursor-pointer border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: activity.iconColor + "20",
                          }}
                        >
                          <AgentIcon iconName={activity.icon} iconColor={activity.iconColor} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white group-hover:text-mcs-blue transition-colors">
                            {activity.agentName}
                          </p>
                          <p className="text-sm text-gray-400 font-light">{activity.specialty}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500 font-light">
                            {formatTimeAgo(activity.lastMessageTime)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-mcs-blue transition-colors mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Specialists - Simplified grid */}
        <section className="space-y-4" aria-label="Medical Specialists">
          <h2 className="text-xl font-medium text-white">Specialists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {agents.slice(0, 8).map((agent) => (
              <Link
                key={agent.id}
                href={`/chat/${agent.id}`}
                aria-label={`Chat with ${agent.name}, ${agent.specialty}`}
              >
                <Card className="group cursor-pointer border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: agent.iconColor + "20",
                      }}
                    >
                      <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="md" />
                    </div>
                    <h3 className="font-medium text-white text-sm mb-1 group-hover:text-mcs-blue transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-light">{agent.specialty}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/chat">
              <Button variant="ghost" className="text-mcs-blue hover:bg-mcs-blue/10 font-light">
                View All Specialists
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
