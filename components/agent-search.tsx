"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { agents } from "@/data/agents"
import type { Agent } from "@/types/agent"
import { AgentIcon } from "./agent-icon"
import Link from "next/link"

const specialties = [
  "All",
  "Cardiovascular Health",
  "Oncology",
  "Neurology",
  "Endocrinology",
  "Pulmonology",
  "Gastroenterology",
  "Orthopedics",
  "Mental Health",
  "Immunology",
  "Nutritional Health",
  "Dermatology",
  "Geriatrics",
  "Reproductive Health",
  "Sports Medicine",
  "Pain Management",
  "Emergency Medicine",
  "Pediatrics",
  "Ophthalmology",
  "Urology",
  "Rheumatology",
  "Hematology",
  "Infectious Disease",
  "Behavioral Health",
  "Allergy & Immunology",
  "Physical Therapy",
]

interface AgentSearchProps {
  onAgentSelect?: (agent: Agent) => void
  showAsCards?: boolean
}

export function AgentSearch({ onAgentSelect, showAsCards = true }: AgentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSpecialty = selectedSpecialty === "All" || agent.specialty === selectedSpecialty

      return matchesSearch && matchesSpecialty
    })
  }, [searchTerm, selectedSpecialty])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSpecialty("All")
  }

  if (showAsCards) {
    return (
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="glass p-4 rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search specialists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus-visible:ring-mcs-blue focus-visible:border-mcs-blue/50 rounded-xl text-white placeholder:text-gray-400"
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {(searchTerm || selectedSpecialty !== "All") && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedSpecialty === specialty
                        ? "bg-mcs-blue text-white border-mcs-blue"
                        : "border-white/20 text-gray-300 hover:border-mcs-blue/50 hover:text-white"
                    }`}
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Link key={agent.id} href={`/chat/${agent.id}`}>
              <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-mcs-blue/50 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start gap-4">
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
                    <p className="text-sm text-mcs-blue mb-2">{agent.specialty}</p>
                    <p className="text-sm text-gray-400 line-clamp-2">{agent.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No specialists found</div>
            <div className="text-sm text-gray-500">Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    )
  }

  // List view for other components
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search specialists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 focus-visible:ring-mcs-blue focus-visible:border-mcs-blue/50 rounded-xl text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onAgentSelect?.(agent)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center border"
              style={{
                borderColor: agent.iconColor + "30",
                backgroundColor: agent.iconColor + "10",
              }}
            >
              <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white">{agent.name}</div>
              <div className="text-sm text-gray-400">{agent.specialty}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
