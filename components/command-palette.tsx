"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Activity,
  MessageSquare,
  FileText,
  User,
  Search,
  ArrowRight,
  CommandIcon,
  Stethoscope,
  DollarSign,
} from "lucide-react"
import { agents } from "@/data/agents"

interface CommandType {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
  category: string
  keywords: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: CommandType[] = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      subtitle: "View your health overview",
      icon: <Activity className="h-4 w-4" />,
      action: () => router.push("/"),
      category: "Navigation",
      keywords: ["dashboard", "home", "overview", "health"],
    },
    {
      id: "nav-chat",
      title: "Go to Chat",
      subtitle: "Talk with AI specialists",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => router.push("/chat"),
      category: "Navigation",
      keywords: ["chat", "talk", "specialists", "ai"],
    },
    {
      id: "nav-notes",
      title: "Go to Notes",
      subtitle: "View your health notes",
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push("/notes"),
      category: "Navigation",
      keywords: ["notes", "journal", "health", "records"],
    },
    {
      id: "nav-pricing",
      title: "Go to Pricing",
      subtitle: "View subscription plans",
      icon: <DollarSign className="h-4 w-4" />,
      action: () => router.push("/pricing"),
      category: "Navigation",
      keywords: ["pricing", "plans", "subscription", "premium"],
    },
    {
      id: "nav-account",
      title: "Go to Account",
      subtitle: "Manage your profile and settings",
      icon: <User className="h-4 w-4" />,
      action: () => router.push("/account"),
      category: "Navigation",
      keywords: ["account", "profile", "settings", "preferences"],
    },
    // Quick Actions
    {
      id: "action-new-note",
      title: "Create New Note",
      subtitle: "Start writing a health note",
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push("/notes?new=true"),
      category: "Quick Actions",
      keywords: ["new", "create", "note", "write", "journal"],
    },
    // AI Specialists
    ...agents.map((agent) => ({
      id: `agent-${agent.id}`,
      title: `Chat with ${agent.name}`,
      subtitle: agent.description,
      icon: <Stethoscope className="h-4 w-4" />,
      action: () => router.push(`/chat/${agent.id}`),
      category: "AI Specialists",
      keywords: [agent.name.toLowerCase(), agent.specialty.toLowerCase(), "chat", "talk", "consult"],
    })),
  ]

  const filteredCommands = search
    ? commands.filter(
        (command) =>
          command.title.toLowerCase().includes(search.toLowerCase()) ||
          command.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
          command.keywords.some((keyword) => keyword.includes(search.toLowerCase())),
      )
    : commands

  const groupedCommands = filteredCommands.reduce(
    (groups, command) => {
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
      return groups
    },
    {} as Record<string, CommandType[]>,
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const selectedCommand = filteredCommands[selectedIndex]
        if (selectedCommand) {
          selectedCommand.action()
          onOpenChange(false)
          setSearch("")
          setSelectedIndex(0)
        }
      } else if (e.key === "Escape") {
        onOpenChange(false)
        setSearch("")
        setSelectedIndex(0)
      }
    },
    [filteredCommands, selectedIndex, onOpenChange],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleCommandClick = (command: CommandType) => {
    command.action()
    onOpenChange(false)
    setSearch("")
    setSelectedIndex(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl bg-black/95 backdrop-blur-xl border border-white/10">
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="h-4 w-4 text-gray-400 mr-3" />
          <Input
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-gray-400 ml-3">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs ml-2">↵</kbd>
            <span>select</span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">{category}</div>
              {commands.map((command) => {
                const globalIndex = filteredCommands.indexOf(command)
                return (
                  <button
                    key={command.id}
                    onClick={() => handleCommandClick(command)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                      globalIndex === selectedIndex
                        ? "bg-mcs-blue/20 text-mcs-blue"
                        : "text-gray-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <div className="flex-shrink-0">{command.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{command.title}</div>
                      {command.subtitle && <div className="text-xs text-gray-400 truncate">{command.subtitle}</div>}
                    </div>
                    <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-xs mt-1">Try searching for "chat", "notes", or "dashboard"</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CommandIcon className="h-3 w-3" />
              <span>+</span>
              <kbd className="px-1 py-0.5 bg-white/10 rounded">K</kbd>
              <span>to open</span>
            </div>
          </div>
          <div className="text-xs">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? "s" : ""}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
