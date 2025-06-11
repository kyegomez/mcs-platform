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
    color: "text-blue-400",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient for quick responses",
    icon: <Zap className="h-4 w-4" />,
    badge: "Fast",
    color: "text-blue-300",
  },
  {
    id: "gpt-4.1-2025-04-14",
    name: "GPT-4.1 2025",
    provider: "OpenAI",
    description: "Latest GPT with enhanced capabilities",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "Latest",
    color: "text-blue-500",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Next-generation reasoning model",
    icon: <Brain className="h-4 w-4" />,
    badge: "New",
    color: "text-blue-600",
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
            h-9 px-3 text-sm font-medium 
            bg-black/40 hover:bg-black/60 
            border border-white/10 hover:border-blue-500/30
            text-white/90 hover:text-white
            rounded-lg backdrop-blur-sm
            transition-all duration-200 ease-out
            shadow-sm hover:shadow-md
          "
        >
          <div className="flex items-center gap-2.5">
            <div className={`${currentModel.color} transition-colors`}>{currentModel.icon}</div>
            <span className="hidden sm:inline font-medium">{currentModel.name}</span>
            <span className="sm:hidden font-medium">{currentModel.provider}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-[320px] p-0
          bg-black/95 backdrop-blur-xl
          border border-white/10
          rounded-xl shadow-2xl
          animate-in fade-in-0 zoom-in-95 duration-200
        "
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">AI Model</h3>
          <p className="text-xs text-white/60 mt-0.5">Choose your preferred model</p>
        </div>

        {/* Model List */}
        <div className="p-2">
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
              <div className="flex items-start gap-3 w-full p-3">
                {/* Icon */}
                <div
                  className={`
                  ${selectedModel === model.id ? "text-blue-400" : model.color} 
                  mt-0.5 transition-colors
                `}
                >
                  {model.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`
                      font-semibold text-sm
                      ${selectedModel === model.id ? "text-white" : "text-white/90"}
                    `}
                    >
                      {model.name}
                    </span>

                    {model.badge && (
                      <Badge
                        variant="secondary"
                        className={`
                          text-xs px-2 py-0.5 font-medium border-0
                          ${selectedModel === model.id ? "bg-blue-500/20 text-blue-300" : "bg-white/10 text-white/70"}
                        `}
                      >
                        {model.badge}
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`
                    text-xs font-medium mb-1
                    ${selectedModel === model.id ? "text-blue-300" : "text-white/50"}
                  `}
                  >
                    {model.provider}
                  </div>

                  <div
                    className={`
                    text-xs leading-relaxed
                    ${selectedModel === model.id ? "text-white/80" : "text-white/60"}
                  `}
                  >
                    {model.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedModel === model.id && (
                  <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5">
          <p className="text-xs text-white/50">Model selection persists for your session</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
