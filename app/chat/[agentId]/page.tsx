"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { agents } from "@/data/agents"
import type { ChatMessage } from "@/types/agent"
import { streamChatWithAgent } from "@/lib/swarms-api"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, AlertCircle, Trash2, Bot, User, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { getChatHistory, saveChatHistory } from "@/lib/chat-storage"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { agentId } = params
  const agent = agents.find((a) => a.id === agentId)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    if (!agent) {
      router.push("/")
      return
    }

    const savedMessages = getChatHistory(agent.id)

    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    } else {
      // Add welcome message if no history exists
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: `Hello, I'm ${agent.name}, your ${agent.specialty} specialist. How can I assist you today?`,
          timestamp: new Date(),
          agentId: agent.id,
        },
      ])
    }
  }, [agent, router])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (agent && messages.length > 0) {
      saveChatHistory(agent.id, messages)
    }
  }, [agent, messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !agent) return

    setError(null)
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentStreamingMessage("")

    try {
      // Get all messages except the welcome message for the API
      const historyForApi = messages.filter(
        (msg) => !(msg.role === "assistant" && msg.content.includes(`Hello, I'm ${agent.name}`)),
      )

      let fullResponse = ""

      await streamChatWithAgent(agent, input, [...historyForApi, userMessage], (chunk) => {
        fullResponse += chunk
        setCurrentStreamingMessage(fullResponse)
      })

      // Create the assistant message with the full response
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: fullResponse || "I processed your request, but didn't receive a response. Please try again.",
        timestamp: new Date(),
        agentId: agent.id,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCurrentStreamingMessage("")
    } catch (error) {
      console.error("Error in chat:", error)
      setError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to communicate with the healthcare agent. Please try again.",
      )

      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        agentId: agent.id,
      }

      setMessages((prev) => [...prev, errorMessage])
      setCurrentStreamingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const clearChatHistory = () => {
    if (!agent) return

    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `Hello, I'm ${agent.name}, your ${agent.specialty} specialist. How can I assist you today?`,
      timestamp: new Date(),
      agentId: agent.id,
    }

    setMessages([welcomeMessage])
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-mcs-blue" />
          <p className="text-gray-400">Loading specialist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="glass border-b border-white/10 p-4 mb-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-mcs-blue/30">
                  <Image src={agent.avatar || "/placeholder.svg"} alt={agent.name} fill className="object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full status-online border-2 border-black"></div>
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">{agent.name}</h1>
                <p className="text-sm text-mcs-blue">{agent.specialty}</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-4 border-red-500/50 bg-red-500/10 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 chat-bubble-animation ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className="flex-shrink-0">
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-mcs-blue to-mcs-blue-light"
                    : "bg-gradient-to-r from-gray-600 to-gray-500"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
            </div>

            <div className={`max-w-[80%] ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`glass-card p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 border-mcs-blue/30"
                    : "border-white/10"
                }`}
              >
                <div className="whitespace-pre-wrap text-white leading-relaxed">{message.content}</div>
              </div>
              <div className="text-xs text-gray-500 mt-2 px-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {currentStreamingMessage && (
          <div className="flex gap-4 chat-bubble-animation">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-gray-600 to-gray-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="max-w-[80%]">
              <div className="glass-card p-4 rounded-2xl border-white/10">
                <div className="whitespace-pre-wrap text-white leading-relaxed">{currentStreamingMessage}</div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1 w-1 bg-mcs-blue rounded-full animate-pulse"></div>
                  <div
                    className="h-1 w-1 bg-mcs-blue rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-1 w-1 bg-mcs-blue rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 px-2">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="glass p-4 rounded-xl border border-white/10">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="resize-none bg-white/5 border-white/10 focus-visible:ring-mcs-blue focus-visible:border-mcs-blue/50 rounded-xl text-white placeholder:text-gray-400"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="btn-primary rounded-xl px-6 shrink-0">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
