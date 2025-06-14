"use client"

import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgentIcon } from "./agent-icon"
import type { Agent } from "@/types/agent"
import Link from "next/link"

interface ChatHeaderProps {
  agent: Agent
  onBack?: () => void
}

export function ChatHeader({ agent, onBack }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div className="relative">
            <AgentIcon
              icon={agent.icon}
              color={agent.color}
              size="md"
              className="border-2"
              style={{ borderColor: agent.color }}
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-white">{agent.name}</h1>
            <p className="text-sm text-gray-400">{agent.specialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
