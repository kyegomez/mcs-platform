"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { agents } from "@/data/agents"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { AgentSearch } from "@/components/agent-search"
import { Pagination } from "@/components/pagination"

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
    // Scroll to the top of the agents section
    document.getElementById("specialists-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Healthcare Dashboard</h1>
        <p className="text-mcs-gray-light">Your personal healthcare metrics and specialized medical consultants.</p>
      </div>

      <DashboardMetrics />

      <div id="specialists-section" className="scroll-mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Healthcare Specialists</h2>
          <p className="text-sm text-mcs-gray-light">
            Showing {currentAgents.length} of {filteredAgents.length} specialists
          </p>
        </div>

        <AgentSearch
          onSearch={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {filteredAgents.length === 0 ? (
          <div className="bg-black border border-mcs-gray rounded-lg p-8 text-center">
            <p className="text-mcs-gray-light">No specialists found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory(null)
              }}
              className="mt-4 text-mcs-blue hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAgents.map((agent) => (
                <Link key={agent.id} href={`/chat/${agent.id}`}>
                  <Card className="h-full overflow-hidden transition-all duration-200 hover:border-mcs-blue hover:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black border-mcs-gray">
                    <div className="relative h-48 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                      <Image src={agent.avatar || "/placeholder.svg"} alt={agent.name} fill className="object-cover" />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-mcs-blue animate-pulse" />
                        {agent.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium text-mcs-blue mb-2">{agent.specialty}</p>
                      <p className="text-sm text-mcs-gray-light">{agent.description}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="text-xs text-mcs-gray-light flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-mcs-blue"></span>
                        Available for consultation
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
