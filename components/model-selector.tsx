"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Zap, Brain, Sparkles, Crown } from "lucide-react"

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ReactNode
  badge?: string
  color: string
}

const models: AIModel[] = [
  {
    id: "claude-3-5-sonnet-20240620",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Best for complex reasoning and analysis",
    icon: <Crown className="h-4 w-4" />,
    badge: "Default",
    color: "text-orange-400",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient for quick responses",
    icon: <Zap className="h-4 w-4" />,
    badge: "Fast",
    color: "text-green-400",
  },
  {
    id: "gpt-4.1-2025-04-14",
    name: "GPT-4.1 2025",
    provider: "OpenAI",
    description: "Latest GPT with enhanced capabilities",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "Latest",
    color: "text-blue-400",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Next-generation reasoning model",
    icon: <Brain className="h-4 w-4" />,
    badge: "New",
    color: "text-purple-400",
  },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const currentModel = models.find((m) => m.id === selectedModel) || models[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 px-3 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg border border-white/10"
        >
          <div className="flex items-center gap-2">
            <div className={currentModel.color}>{currentModel.icon}</div>
            <span className="hidden sm:inline">{currentModel.name}</span>
            <span className="sm:hidden">{currentModel.provider}</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-gray-900/95 backdrop-blur-sm border-white/10 rounded-xl p-2">
        <div className="text-xs font-medium text-gray-400 px-2 py-1 mb-2">Select AI Model</div>

        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all duration-200
              hover:bg-white/10 focus:bg-white/10
              ${selectedModel === model.id ? "bg-white/5 border border-white/20" : ""}
            `}
          >
            <div className="flex items-start gap-3 w-full">
              <div className={`${model.color} mt-0.5`}>{model.icon}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{model.name}</span>
                  {model.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-white/10 text-gray-300 border-0">
                      {model.badge}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-400 mb-1">{model.provider}</div>

                <div className="text-xs text-gray-500 leading-relaxed">{model.description}</div>
              </div>

              {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-mcs-blue mt-2" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
