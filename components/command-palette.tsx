"use client"

import type React from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Compass, File, HelpCircle, Home, Settings, User, DollarSign } from "lucide-react"

interface Command {
  id: string
  title: string
  description?: string
  keywords?: string[]
  category: string
  action: () => void
  icon?: React.ReactNode
}

const commands: Command[] = [
  {
    id: "nav-home",
    title: "Go to Home",
    description: "Navigate to the home page",
    keywords: ["home", "dashboard", "index"],
    category: "Navigation",
    action: () => {
      router.push("/")
      setOpen(false)
    },
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "nav-account",
    title: "Go to Account",
    description: "Manage your account settings",
    keywords: ["account", "profile", "settings"],
    category: "Navigation",
    action: () => {
      router.push("/account")
      setOpen(false)
    },
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "nav-pricing",
    title: "Go to Pricing",
    description: "View subscription plans and pricing",
    keywords: ["pricing", "plans", "subscription", "premium", "upgrade"],
    category: "Navigation",
    action: () => {
      router.push("/pricing")
      setOpen(false)
    },
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    id: "nav-settings",
    title: "Go to Settings",
    description: "Configure application preferences",
    keywords: ["settings", "preferences", "configuration"],
    category: "Navigation",
    action: () => {
      router.push("/settings")
      setOpen(false)
    },
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: "explore-discover",
    title: "Discover new content",
    description: "Explore trending topics and articles",
    keywords: ["explore", "discover", "trending", "articles"],
    category: "Explore",
    action: () => {
      alert("Navigating to Discover page")
      setOpen(false)
    },
    icon: <Compass className="h-4 w-4" />,
  },
  {
    id: "explore-calendar",
    title: "View Calendar",
    description: "Check upcoming events and schedules",
    keywords: ["calendar", "events", "schedule"],
    category: "Explore",
    action: () => {
      alert("Navigating to Calendar page")
      setOpen(false)
    },
    icon: <CalendarIcon className="h-4 w-4" />,
  },
  {
    id: "help-documentation",
    title: "Open Documentation",
    description: "Access detailed guides and tutorials",
    keywords: ["help", "documentation", "guides", "tutorials"],
    category: "Help",
    action: () => {
      alert("Opening Documentation")
      setOpen(false)
    },
    icon: <File className="h-4 w-4" />,
  },
  {
    id: "help-support",
    title: "Contact Support",
    description: "Get assistance from our support team",
    keywords: ["help", "support", "assistance"],
    category: "Help",
    action: () => {
      alert("Contacting Support")
      setOpen(false)
    },
    icon: <HelpCircle className="h-4 w-4" />,
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        onClick={() => setOpen(true)}
      >
        Open Command Palette
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {commands
              .filter((command) => command.category === "Navigation")
              .map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  {command.icon}
                  <span>{command.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Explore">
            {commands
              .filter((command) => command.category === "Explore")
              .map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  {command.icon}
                  <span>{command.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Help">
            {commands
              .filter((command) => command.category === "Help")
              .map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  {command.icon}
                  <span>{command.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
