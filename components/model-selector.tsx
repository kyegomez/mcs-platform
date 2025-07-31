"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Zap, Brain, Sparkles, Crown, Clock } from "lucide-react"

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ReactNode
  badge?: string
  color: string
  capabilities?: string[]
  speed?: "Fast" | "Medium" | "Slow"
}

const models: AIModel[] = [
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    description: "Most powerful Claude model for complex tasks",
    icon: <Crown className="h-4 w-4" />,
    badge: "Premium",
    color: "text-purple-400",
    capabilities: ["Advanced Reasoning", "Complex Analysis", "Creative Writing"],
    speed: "Slow",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    description: "Next-generation reasoning model",
    icon: <Brain className="h-4 w-4" />,
    badge: "New",
    color: "text-blue-600",
    capabilities: ["Enhanced Reasoning", "Medical Analysis", "Research"],
    speed: "Medium",
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "Enhanced reasoning and analysis capabilities",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "Latest",
    color: "text-green-400",
    capabilities: ["Advanced Analysis", "Problem Solving", "Insights"],
    speed: "Medium",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient for quick responses",
    icon: <Zap className="h-4 w-4" />,
    badge: "Fast",
    color: "text-blue-300",
    capabilities: ["Quick Responses", "General Knowledge"],
    speed: "Fast",
  },
  {
    id: "gpt-4.1-2025-04-14",
    name: "GPT-4.1 2025",
    provider: "OpenAI",
    description: "Latest GPT with enhanced capabilities",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "Latest",
    color: "text-blue-500",
    capabilities: ["Latest Features", "Enhanced Understanding"],
    speed: "Medium",
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
          className="
            h-8 px-2.5 text-sm font-medium 
            bg-black/40 hover:bg-black/60 
            border border-white/10 hover:border-blue-500/30
            text-foreground/90 hover:text-foreground
            rounded-lg backdrop-blur-sm
            transition-all duration-200 ease-out
            shadow-sm hover:shadow-md
          "
        >
          <div className="flex items-center gap-2">
            <div className={`${currentModel.color} transition-colors`}>{currentModel.icon}</div>
            <span className="hidden sm:inline font-medium text-xs">{currentModel.name}</span>
            <span className="sm:hidden font-medium text-xs">{currentModel.provider}</span>
            <ChevronDown className="h-3 w-3 text-foreground/60" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-64 p-0
          bg-black/95 backdrop-blur-xl
          border border-white/10
          rounded-xl shadow-2xl
          animate-in fade-in-0 zoom-in-95 duration-200
        "
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-white/5">
          <h3 className="text-sm font-semibold text-foreground">AI Model</h3>
        </div>

        {/* Model List */}
        <div className="p-1">
          {models.map((model, index) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`
                p-0 rounded-lg cursor-pointer 
                transition-all duration-200 ease-out
                hover:bg-white/5 focus:bg-white/5
                ${selectedModel === model.id ? "bg-blue-500/10 hover:bg-blue-500/15" : ""}
                ${index > 0 ? "mt-1" : ""}
              `}
            >
              <div className="flex items-center gap-2 w-full p-2">
                {/* Icon */}
                <div
                  className={`
                  ${selectedModel === model.id ? "text-blue-400" : model.color} 
                  transition-colors
                `}
                >
                  {model.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      font-medium text-sm
                      ${selectedModel === model.id ? "text-foreground" : "text-foreground/90"}
                    `}
                    >
                      {model.name}
                    </span>

                    {model.badge && (
                      <Badge
                        variant="secondary"
                        className={`
                          text-xs px-1.5 py-0.5 font-medium border-0
                          ${selectedModel === model.id ? "bg-primary/20 text-primary" : "bg-background/50 text-foreground/70"}
                        `}
                      >
                        {model.badge}
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`
                    text-xs
                    ${selectedModel === model.id ? "text-primary" : "text-foreground/50"}
                  `}
                  >
                    {model.provider}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedModel === model.id && (
                  <div className="flex items-center justify-center w-4 h-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5">
                      <p className="text-xs text-foreground/50">Model selection persists for your session</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
