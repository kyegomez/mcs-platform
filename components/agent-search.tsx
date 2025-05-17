"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { agents } from "@/data/agents"

// Extract unique specialties for category filtering
const specialties = Array.from(new Set(agents.map((agent) => agent.specialty)))

interface AgentSearchProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string | null) => void
  selectedCategory: string | null
}

export function AgentSearch({ onSearch, onCategoryChange, selectedCategory }: AgentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategoryChange(null) // Deselect if already selected
    } else {
      onCategoryChange(category)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="space-y-4 mb-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mcs-gray-light" />
        <Input
          type="text"
          placeholder="Search specialists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mcs-gray-light hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button type="submit" className="sr-only">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-mcs-gray-light mr-1 flex items-center">Categories:</span>
        {specialties.map((specialty) => (
          <Badge
            key={specialty}
            variant="outline"
            className={`cursor-pointer hover:bg-mcs-blue/20 ${
              selectedCategory === specialty
                ? "bg-mcs-blue/20 text-mcs-blue border-mcs-blue"
                : "text-mcs-gray-light border-mcs-gray"
            }`}
            onClick={() => handleCategoryClick(specialty)}
          >
            {specialty}
          </Badge>
        ))}
        {selectedCategory && (
          <Badge
            variant="outline"
            className="cursor-pointer bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
            onClick={() => onCategoryChange(null)}
          >
            Clear Filter <X className="ml-1 h-3 w-3" />
          </Badge>
        )}
      </div>
    </div>
  )
}
