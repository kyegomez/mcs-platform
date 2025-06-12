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
import { ArrowLeft, Send, AlertCircle, Trash2, User, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getChatHistory, saveChatHistory } from "@/lib/chat-storage"
import { AgentIcon } from "@/components/agent-icon"
import { VoiceProcessor } from "@/components/voice-processor"
import { ModelSelector } from "@/components/model-selector"
import { useModelSelection } from "@/hooks/use-model-selection"

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
  const [isListening, setIsListening] = useState(false)
  const [speakResponse, setSpeakResponse] = useState<((text: string) => void) | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { selectedModel, changeModel, isLoading: modelLoading } = useModelSelection()

  // Load chat history from localStorage
  useEffect(() => {
    if (!agent) {
      router.push("/chat")
      return
    }

    const savedMessages = getChatHistory(agent.id)

    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    } else {
      // Add welcome message if no history exists
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `Hello, I'm ${agent.name}, your ${agent.specialty} specialist. How can I assist you today?`,
        timestamp: new Date(),
        agentId: agent.id,
      }
      setMessages([welcomeMessage])
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

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
  }

  const handleSpeakResponse = (speakFunction: (text: string) => void) => {
    setSpeakResponse(() => speakFunction)
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
    const currentInput = input
    setInput("")
    setIsLoading(true)
    setCurrentStreamingMessage("")

    try {
      // Create history array with all previous messages
      const historyForApi = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      console.log("=== CLIENT SIDE DEBUG ===")
      console.log("Current messages:", messages.length)
      console.log("History being sent:", historyForApi)
      console.log("Current user input:", currentInput)

      let fullResponse = ""

      // Pass the history along with the current message
      await streamChatWithAgent(
        agent,
        currentInput,
        historyForApi,
        (chunk) => {
          fullResponse += chunk
          setCurrentStreamingMessage(fullResponse)
        },
        selectedModel,
      )

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

      // Speak the response if voice is enabled
      if (speakResponse && fullResponse) {
        speakResponse(fullResponse)
      }
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
      <div className="glass border-b border-white/10 p-3 sm:p-4 mb-4 rounded-xl spring-bounce">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat")}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl btn-interactive flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border-2 transition-transform duration-200 hover:scale-110"
                  style={{
                    borderColor: agent.iconColor + "30",
                    backgroundColor: agent.iconColor + "10",
                  }}
                >
                  <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="lg" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full status-online border-2 border-black"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-white truncate">{agent.name}</h1>
                <p className="text-xs sm:text-sm text-mcs-blue truncate">{agent.specialty}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={changeModel}
                disabled={isLoading || modelLoading}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl btn-interactive text-xs sm:text-sm px-2 sm:px-3"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Mobile Model Selector */}
        <div className="sm:hidden mt-3 pt-3 border-t border-white/10">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={changeModel}
            disabled={isLoading || modelLoading}
          />
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
                  message.role === "user" ? "bg-gradient-to-r from-mcs-blue to-mcs-blue-light" : "border"
                }`}
                style={
                  message.role === "assistant"
                    ? {
                        borderColor: agent.iconColor + "30",
                        backgroundColor: agent.iconColor + "10",
                      }
                    : {}
                }
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <AgentIcon iconName={agent.icon} iconColor={agent.iconColor} size="sm" />
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
      <form onSubmit={handleSubmit} className="glass p-3 sm:p-4 rounded-xl border border-white/10">
        <div className="flex gap-2 sm:gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or use voice input..."
            className="resize-none bg-white/5 border-white/10 focus-visible:ring-mcs-blue focus-visible:border-mcs-blue/50 rounded-xl text-white placeholder:text-gray-400 text-sm sm:text-base focus-smooth"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <VoiceProcessor
                onTranscript={handleVoiceTranscript}
                onSpeakResponse={handleSpeakResponse}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !input.trim() || isListening}
              className="btn-primary rounded-xl px-4 sm:px-6 shrink-0 btn-interactive btn-mobile"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Voice Processor */}
        <div className="sm:hidden mt-2 pt-2 border-t border-white/10">
          <VoiceProcessor
            onTranscript={handleVoiceTranscript}
            onSpeakResponse={handleSpeakResponse}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>
      </form>
    </div>
  )
}
