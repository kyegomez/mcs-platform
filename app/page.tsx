"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { agents } from "@/data/agents"
import { AgentIcon } from "@/components/agent-icon"
import { getChatAgentIds, getChatHistory } from "@/lib/chat-storage"
import Link from "next/link"
import { FileText, ArrowRight, MessageSquare, Sparkles, Users } from "lucide-react"
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

      <div className="max-w-6xl mx-auto space-y-12 px-4 sm:px-6 page-transition">
        {/* Hero Section with enhanced design */}
        <header className="text-center pt-12 pb-8 spring-bounce relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl -z-10"></div>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Sparkles className="h-10 w-10 text-mcs-blue relative z-10 animate-bounce" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Health
            </h1>
          </div>
          
          <p className="text-muted-foreground text-xl sm:text-2xl font-light max-w-3xl mx-auto mb-8 leading-relaxed">
            Your personal healthcare assistant powered by AI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/chat">
              <Button className="px-8 py-4 bg-gradient-to-r from-mcs-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="px-8 py-4 border-2 border-primary/30 text-foreground hover:bg-primary/10 text-lg font-medium transition-all duration-300 transform hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Stats or features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-primary mb-1">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-primary mb-1">Secure</div>
              <div className="text-sm text-muted-foreground">Private</div>
            </div>
          </div>
        </header>

        {/* Main Actions - Enhanced with modern design */}
        <section className="space-y-6" aria-label="Main Actions">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Get Started</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose how you'd like to interact with your AI healthcare assistant
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Link href="/chat" aria-label="Start consultation with AI medical specialists" className="stagger-item group">
              <Card className="relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 hover:from-blue-500/20 hover:via-blue-600/15 hover:to-blue-700/20 card-interactive h-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-blue-400 transition-colors">Talk to a Specialist</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Get instant medical advice from AI specialists tailored to your needs
                  </p>
                  <div className="mt-6 flex items-center justify-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/groupchat" aria-label="Start group consultation with multiple AI specialists" className="stagger-item group">
              <Card className="relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-700/10 hover:from-purple-500/20 hover:via-purple-600/15 hover:to-purple-700/20 card-interactive h-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg">
                    <Users className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-purple-400 transition-colors">Group Consultation</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Get comprehensive care from multiple AI specialists working together
                  </p>
                  <div className="mt-6 flex items-center justify-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Start Consultation</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/notes" aria-label="Access your health journal and notes" className="stagger-item group">
              <Card className="relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-green-500/10 via-green-600/5 to-green-700/10 hover:from-green-500/20 hover:via-green-600/15 hover:to-green-700/20 card-interactive h-full transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-600/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg">
                    <FileText className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-green-400 transition-colors">Health Journal</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {notesCount > 0 ? `${notesCount} notes saved` : "Track your health journey and maintain detailed records"}
                  </p>
                  <div className="mt-6 flex items-center justify-center text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">View Journal</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recent Conversations - Enhanced with modern design */}
        {recentActivity.length > 0 && (
          <section className="space-y-6 stagger-item" aria-label="Recent Activity">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Recent Conversations</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Continue where you left off with your AI healthcare specialists
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentActivity.map((activity, index) => (
                <Link
                  key={activity.agentId}
                  href={`/chat/${activity.agentId}`}
                  className="stagger-item group"
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <Card className="relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5 hover:from-white/10 hover:via-white/8 hover:to-white/10 card-interactive transition-all duration-500 transform hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="relative p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg"
                          style={{
                            backgroundColor: activity.iconColor + "20",
                            border: `2px solid ${activity.iconColor}30`,
                          }}
                        >
                          <AgentIcon iconName={activity.icon} iconColor={activity.iconColor} size="lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg mb-1">
                            {activity.agentName}
                          </h3>
                          <p className="text-muted-foreground font-medium">{activity.specialty}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-sm text-muted-foreground">
                              Last active {formatTimeAgo(activity.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ArrowRight className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href="/chat">
                <Button variant="outline" className="px-8 py-3 border-2 border-primary/30 text-foreground hover:bg-primary/10 font-medium transition-all duration-300 transform hover:scale-105">
                  View All Conversations
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Featured Specialists - Enhanced with modern design */}
        <section className="space-y-6 stagger-item" aria-label="Medical Specialists">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">AI Medical Specialists</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with specialized AI healthcare professionals for personalized care
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {agents.slice(0, 10).map((agent, index) => (
              <Link
                key={agent.id}
                href={`/chat/${agent.id}`}
                aria-label={`Chat with ${agent.name}, ${agent.specialty}`}
                className="stagger-item group"
                style={{ animationDelay: `${(index + 5) * 0.1}s` }}
              >
                <Card className="relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-white/5 via-white/3 to-white/5 hover:from-white/10 hover:via-white/8 hover:to-white/10 card-interactive h-full transition-all duration-500 transform hover:scale-105 hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 text-center h-full flex flex-col justify-center">
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg"
                      style={{
                        backgroundColor: agent.iconColor + "20",
                        border: `2px solid ${agent.iconColor}30`,
                      }}
                    >
                      <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="md" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">{agent.specialty}</p>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center pt-6">
            <Link href="/chat">
              <Button variant="outline" className="px-8 py-3 border-2 border-primary/30 text-foreground hover:bg-primary/10 font-medium transition-all duration-300 transform hover:scale-105">
                View All Specialists
              </Button>
            </Link>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center py-12 mt-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl -z-10"></div>
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Ready to Start Your Health Journey?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Join thousands of users who trust our AI-powered healthcare platform for personalized medical guidance and support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/chat">
                  <Button className="px-8 py-4 bg-gradient-to-r from-mcs-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Start Your Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/groupchat">
                  <Button variant="outline" className="px-8 py-4 border-2 border-primary/30 text-foreground hover:bg-primary/10 text-lg font-medium transition-all duration-300 transform hover:scale-105">
                    Try Group Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
