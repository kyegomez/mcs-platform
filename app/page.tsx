"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { agents } from "@/data/agents"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { AgentSearch } from "@/components/agent-search"
import { Pagination } from "@/components/pagination"
import { Sparkles, ArrowRight, Zap } from "lucide-react"
import { AlertManager } from "@/components/alert-manager"

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const agentsPerPage = 6

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Filter agents based on search query and selected category
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        searchQuery === "" ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === null || agent.specialty === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAgents.length / agentsPerPage)
  const indexOfLastAgent = currentPage * agentsPerPage
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage
  const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent)

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    document.getElementById("specialists-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="space-y-8 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-mcs-blue animate-pulse" />
            <span className="text-sm font-medium text-mcs-blue uppercase tracking-wider">AI-Powered Healthcare</span>
            <Sparkles className="h-6 w-6 text-mcs-blue animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-shadow">
            Healthcare <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your personal healthcare metrics and access to specialized medical consultants powered by advanced AI
            technology.
          </p>
        </div>
      </div>

      <DashboardMetrics />

      {/* Health Alerts */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Health Reminders</h2>
          <p className="text-gray-400">Automated alerts to help you track your health consistently.</p>
        </div>
        <AlertManager />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/chat">
          <Card className="glass-card hover-glow group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-mcs-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Quick Consultation</h3>
                  <p className="text-sm text-gray-400">Start chatting with a specialist instantly</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-mcs-blue group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notes">
          <Card className="glass-card hover-glow group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Health Journal</h3>
                  <p className="text-sm text-gray-400">Track your symptoms and observations</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div id="specialists-section" className="scroll-mt-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Healthcare Specialists</h2>
            <p className="text-gray-400">
              Showing {currentAgents.length} of {filteredAgents.length} specialists
            </p>
          </div>
        </div>

        <AgentSearch
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {filteredAgents.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No specialists found</h3>
              <p className="text-gray-400 mb-4">No specialists match your current search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory(null)
                }}
                className="btn-primary px-6 py-2 rounded-lg text-white font-medium"
              >
                Clear filters
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAgents.map((agent, index) => (
                <Link key={agent.id} href={`/chat/${agent.id}`}>
                  <Card className="glass-card hover-glow group h-full overflow-hidden">
                    <div className="relative h-48 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <Image
                        src={agent.avatar || "/placeholder.svg"}
                        alt={agent.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <div className="status-online h-3 w-3 rounded-full pulse-blue"></div>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-white">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-mcs-blue to-mcs-blue-light pulse-blue" />
                        {agent.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <div className="space-y-3">
                        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 border border-mcs-blue/30">
                          <span className="text-sm font-medium text-mcs-blue">{agent.specialty}</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{agent.description}</p>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                          <span>Available now</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-mcs-blue group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
