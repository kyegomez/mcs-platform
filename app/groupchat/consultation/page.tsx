"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, AlertCircle, Trash2, User, Loader2, Users, Stethoscope, Brain, Pill } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VoiceProcessor } from "@/components/voice-processor"
import { ModelSelector } from "@/components/model-selector"
import { useModelSelection } from "@/hooks/use-model-selection"
import { runMedicalGroupChat } from "@/lib/medical-groupchat-api"

import { MarkdownContent } from "@/components/markdown-content"

interface GroupChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentOutputs?: Array<{
    role: string
    content: string
  }>
}

const medicalAgents = [
  {
    name: "Medical Diagnoser",
    icon: <Stethoscope className="h-4 w-4" />,
    iconColor: "#3B82F6",
    description: "Comprehensive Diagnosis",
  },
  {
    name: "Medical Verifier",
    icon: <Brain className="h-4 w-4" />,
    iconColor: "#10B981", 
    description: "Diagnostic Validation",
  },
  {
    name: "Treatment Specialist",
    icon: <Pill className="h-4 w-4" />,
    iconColor: "#F59E0B",
    description: "Treatment Planning",
  },
]

export default function GroupChatConsultationPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speakResponse, setSpeakResponse] = useState<((text: string) => void) | null>(null)


  const speakText = (text: string) => {
    if (speakResponse) {
      speakResponse(text)
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { selectedModel, changeModel, isLoading: modelLoading } = useModelSelection()

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("groupchat-history")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (e) {
        console.error("Error loading groupchat history:", e)
      }
    } else {
      // Add welcome message if no history exists
      const welcomeMessage: GroupChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Hello! I'm your medical group consultation team. We have three specialists ready to help: a Medical Diagnoser, Medical Verifier, and Treatment Specialist. Please describe your symptoms or health concerns, and we'll work together to provide you with comprehensive care.",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("groupchat-history", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript)
  }

  const setSpeakResponseFunction = (speakFunction: (text: string) => void) => {
    setSpeakResponse(speakFunction)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    setError(null)
    const userMessage: GroupChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    // Add processing message
    const processingMessage: GroupChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "Medical team processing your request...",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, processingMessage])

    try {
      // Create history array with all previous messages plus the new user message
      const historyForApi = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Use the medical groupchat API
      const response = await runMedicalGroupChat(currentInput, historyForApi, selectedModel)
      
      // Extract the response content and agent outputs
      let fullResponse = ""
      let agentOutputs: Array<{ role: string; content: string }> = []

      if (response && response.output && Array.isArray(response.output)) {
        // Extract individual agent outputs
        agentOutputs = response.output.map((output: any) => ({
          role: output.role,
          content: output.content,
        }))

        // Sort agents in the correct sequential order: Diagnoser -> Verifier -> Treatment
        const agentOrder = ["Medical Diagnoser", "Medical Verifier", "Treatment Specialist"]
        agentOutputs.sort((a, b) => {
          const aIndex = agentOrder.indexOf(a.role)
          const bIndex = agentOrder.indexOf(b.role)
          return aIndex - bIndex
        })

        // For individual agent outputs, we don't need a combined response
        fullResponse = "Medical consultation completed by our specialist team."
      } else if (typeof response === "string") {
        fullResponse = response
      } else {
        fullResponse = "I processed your request, but didn't receive a response. Please try again."
      }

      // Replace the processing message with the actual response
      setMessages((prev) => {
        const messagesWithoutProcessing = prev.filter(msg => msg.content !== "Medical team processing your request...")
        const assistantMessage: GroupChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: fullResponse || "I processed your request, but didn't receive a response. Please try again.",
          timestamp: new Date(),
          agentOutputs: agentOutputs.length > 0 ? agentOutputs : undefined,
        }
        return [...messagesWithoutProcessing, assistantMessage]
      })

      // Speak the response if voice is enabled
      if (speakResponse && fullResponse) {
        speakResponse(fullResponse)
      }
    } catch (error) {
      console.error("Error in groupchat:", error)
      setError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to communicate with the medical team. Please try again.",
      )

      const errorMessage: GroupChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChatHistory = () => {
    const welcomeMessage: GroupChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "Hello! I'm your medical group consultation team. We have three specialists ready to help: a Medical Diagnoser, Medical Verifier, and Treatment Specialist. Please describe your symptoms or health concerns, and we'll work together to provide you with comprehensive care.",
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])
    localStorage.removeItem("groupchat-history")
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
              onClick={() => router.push("/groupchat")}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl btn-interactive flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border-2 transition-transform duration-200 hover:scale-110 bg-primary/20 border-primary/30">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full status-online border-2 border-black"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-foreground truncate">Medical Group Consultation</h1>
                <p className="text-xs sm:text-sm text-mcs-blue truncate">3 AI Specialists • Collaborative Care</p>
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
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl btn-interactive text-xs sm:text-sm px-2 sm:px-3"
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
                        borderColor: "#3B82F6" + "30",
                        backgroundColor: "#3B82F6" + "10",
                      }
                    : {}
                }
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-foreground" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
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
                {/* Display message content only if no individual agent outputs */}
                {(!message.agentOutputs || message.agentOutputs.length === 0) && (
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">{message.content}</div>
                )}
                
                {/* Show individual agent outputs if available */}
                {message.agentOutputs && message.agentOutputs.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {message.agentOutputs.map((output, index) => {
                      const agent = medicalAgents.find(a => a.name === output.role)
                      return (
                        <div 
                          key={index} 
                          className="glass-card p-4 rounded-xl border border-white/10 agent-card-enter"
                          style={{ 
                            animationDelay: `${index * 0.2}s`,
                            borderColor: agent?.iconColor + "30",
                            backgroundColor: agent?.iconColor + "05"
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 agent-icon-hover"
                              style={{ 
                                backgroundColor: agent?.iconColor + "20",
                                borderColor: agent?.iconColor + "30"
                              }}
                            >
                              <div style={{ color: agent?.iconColor }}>
                                {agent?.icon}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{output.role}</h4>
                              <p className="text-xs text-muted-foreground">{agent?.description}</p>
                            </div>
                          </div>
                          <div className="text-foreground">
                            <MarkdownContent content={output.content} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground/70 mt-2 px-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="glass p-3 sm:p-4 rounded-xl border border-white/10">
        <div className="flex gap-2 sm:gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms or health concerns..."
            className="resize-none bg-background/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground text-sm sm:text-base focus-smooth"
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
                onSpeakResponse={speakText}
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
            onSpeakResponse={speakText}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>
      </form>
    </div>
  )
} 