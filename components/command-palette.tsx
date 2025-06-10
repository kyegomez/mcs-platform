"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { agents } from "@/data/agents"
import { AgentIcon } from "@/components/agent-icon"
import { Search, Home, MessageSquare, FileText, User, Plus, ArrowRight, Command, Hash, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
  category: "Navigation" | "Actions" | "Specialists" | "Recent"
  keywords: string[]
  badge?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearch("")
      setSelectedIndex(0)
    }
  }, [open])

  const navigateAndClose = useCallback(
    (path: string) => {
      router.push(path)
      onOpenChange(false)
    },
    [router, onOpenChange],
  )

  const createNote = useCallback(() => {
    localStorage.setItem("mcs-create-note", "true")
    navigateAndClose("/notes")
  }, [navigateAndClose])

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Dashboard",
        subtitle: "Go to main dashboard",
        icon: <Home className="w-4 h-4" />,
        action: () => navigateAndClose("/"),
        category: "Navigation",
        keywords: ["dashboard", "home", "main", "overview"],
      },
      {
        id: "nav-chat",
        title: "Chat",
        subtitle: "Talk to specialists",
        icon: <MessageSquare className="w-4 h-4" />,
        action: () => navigateAndClose("/chat"),
        category: "Navigation",
        keywords: ["chat", "talk", "specialists", "doctors", "consultation"],
      },
      {
        id: "nav-notes",
        title: "Notes",
        subtitle: "Health journal",
        icon: <FileText className="w-4 h-4" />,
        action: () => navigateAndClose("/notes"),
        category: "Navigation",
        keywords: ["notes", "journal", "health", "tracking", "diary"],
      },
      {
        id: "nav-account",
        title: "Account",
        subtitle: "Profile and settings",
        icon: <User className="w-4 h-4" />,
        action: () => navigateAndClose("/account"),
        category: "Navigation",
        keywords: ["account", "profile", "settings", "preferences"],
      },

      // Quick Actions
      {
        id: "action-new-note",
        title: "New Note",
        subtitle: "Create a health note",
        icon: <Plus className="w-4 h-4" />,
        action: createNote,
        category: "Actions",
        keywords: ["new", "create", "note", "add", "write"],
        badge: "⌘N",
      },

      // Specialists
      ...agents.slice(0, 8).map((agent) => ({
        id: `specialist-${agent.id}`,
        title: `Chat with ${agent.name}`,
        subtitle: agent.specialty,
        icon: <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />,
        action: () => navigateAndClose(`/chat/${agent.id}`),
        category: "Specialists" as const,
        keywords: [
          agent.name.toLowerCase(),
          agent.specialty.toLowerCase(),
          "chat",
          "talk",
          "consult",
          ...agent.description.toLowerCase().split(" "),
        ],
      })),
    ],
    [navigateAndClose, createNote],
  )

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands

    const searchLower = search.toLowerCase()
    return commands.filter(
      (command) =>
        command.title.toLowerCase().includes(searchLower) ||
        command.subtitle?.toLowerCase().includes(searchLower) ||
        command.keywords.some((keyword) => keyword.includes(searchLower)),
    )
  }, [commands, search])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach((command) => {
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
    })
    return groups
  }, [filteredCommands])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
          break
        case "Enter":
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case "Escape":
          e.preventDefault()
          onOpenChange(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, filteredCommands, selectedIndex, onOpenChange])

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Navigation":
        return <Hash className="w-3 h-3" />
      case "Actions":
        return <Star className="w-3 h-3" />
      case "Specialists":
        return <MessageSquare className="w-3 h-3" />
      case "Recent":
        return <Clock className="w-3 h-3" />
      default:
        return <Search className="w-3 h-3" />
    }
  }

  let currentIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex flex-col max-h-[80vh]">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for commands, specialists, or actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-8 h-8 text-gray-500 mb-3" />
                <p className="text-gray-400 font-light">No results found</p>
                <p className="text-gray-500 text-sm font-light">Try searching for something else</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                      {getCategoryIcon(category)}
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{category}</span>
                    </div>
                    <div className="space-y-1">
                      {items.map((command) => {
                        const isSelected = currentIndex === selectedIndex
                        const itemIndex = currentIndex++
                        return (
                          <button
                            key={command.id}
                            onClick={command.action}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                              isSelected
                                ? "bg-mcs-blue/20 border border-mcs-blue/30"
                                : "hover:bg-white/5 border border-transparent",
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                isSelected ? "bg-mcs-blue/30" : "bg-white/10",
                              )}
                            >
                              {command.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn("font-medium text-sm", isSelected ? "text-white" : "text-gray-200")}
                                >
                                  {command.title}
                                </span>
                                {command.badge && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-gray-600 text-gray-400 bg-gray-800/50"
                                  >
                                    {command.badge}
                                  </Badge>
                                )}
                              </div>
                              {command.subtitle && (
                                <p className="text-xs text-gray-400 font-light mt-0.5">{command.subtitle}</p>
                              )}
                            </div>
                            <ArrowRight
                              className={cn(
                                "w-3 h-3 transition-colors",
                                isSelected ? "text-mcs-blue" : "text-gray-500",
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {filteredCommands.length} {filteredCommands.length === 1 ? "result" : "results"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
