"use client"

import { useEffect, useRef } from "react"
import { AgentIcon } from "./agent-icon"
import type { Agent } from "@/types/agent"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatMessagesProps {
  messages?: Message[]
  agent: Agent
  isLoading?: boolean
}

export function ChatMessages({ messages = [], agent, isLoading = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : []

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {safeMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center border-2 mb-4"
            style={{
              borderColor: agent.iconColor + "30",
              backgroundColor: agent.iconColor + "10",
            }}
          >
            <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="lg" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Start a conversation with {agent.name}</h3>
          <p className="text-gray-400 max-w-md">{agent.description}</p>
        </div>
      ) : (
        <>
          {safeMessages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center border"
                    style={{
                      borderColor: agent.iconColor + "30",
                      backgroundColor: agent.iconColor + "10",
                    }}
                  >
                    <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-mcs-blue to-mcs-blue-light text-white ml-auto"
                    : "glass-card border-white/10 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-mcs-blue to-mcs-blue-light rounded-xl flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">U</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center border"
                  style={{
                    borderColor: agent.iconColor + "30",
                    backgroundColor: agent.iconColor + "10",
                  }}
                >
                  <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />
                </div>
              </div>
              <div className="glass-card border-white/10 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-mcs-blue rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-mcs-blue rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-mcs-blue rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
