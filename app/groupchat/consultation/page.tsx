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
import { selectAgent, loadAgentFromPrompt } from "@/lib/orchestrator-api"

import { MarkdownContent } from "@/components/markdown-content"

interface GroupChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  selectedAgent?: {
    name: string
    specialty: string
    iconColor: string
  }
  orchestratorReasoning?: string
  confidence?: number
  orchestratorData?: {
    selectedAgent: string
    reasoning: string
    confidence: number
    agentInfo: any
  }
}


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
        content: "Hello! I'm your AI medical consultation system with dynamic specialist selection. I'll analyze your symptoms and automatically connect you with the most appropriate specialist from our team of 25+ medical experts. Please describe your health concerns, and I'll select the best specialist to help you.",
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

    try {
      // Create history array with all previous messages plus the new user message
      const historyForApi = [...messages, userMessage].map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }))

      // Step 1: Show orchestrator analysis
      const orchestratorProcessingMessage: GroupChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "🤖 Analyzing your symptoms and selecting the most appropriate specialist...",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, orchestratorProcessingMessage])

      // Step 2: Call orchestrator to select agent
      console.log("Starting orchestrator selection...")
      const orchestratorResult = await selectAgent(currentInput, historyForApi)
      console.log("Orchestrator result:", orchestratorResult)

      // Step 3: Load the selected agent
      const selectedAgent = await loadAgentFromPrompt(orchestratorResult.selectedAgent)

      // Step 4: Replace processing with orchestrator result
      const orchestratorMessage: GroupChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Orchestrator Analysis Complete",
        timestamp: new Date(),
        selectedAgent: {
          name: selectedAgent.name,
          specialty: selectedAgent.specialty,
          iconColor: selectedAgent.iconColor
        },
        orchestratorReasoning: orchestratorResult.reasoning,
        confidence: orchestratorResult.confidence || 0,
        orchestratorData: {
          selectedAgent: selectedAgent.name,
          reasoning: orchestratorResult.reasoning || '',
          confidence: orchestratorResult.confidence || 0,
          agentInfo: selectedAgent
        }
      }

      setMessages((prev) => {
        const messagesWithoutProcessing = prev.filter(msg => msg.content !== "🤖 Analyzing your symptoms and selecting the most appropriate specialist...")
        return [...messagesWithoutProcessing, orchestratorMessage]
      })

      // Step 5: Add agent processing message
      const agentProcessingMessage: GroupChatMessage = {
        id: uuidv4(),
        role: "assistant", 
        content: `${selectedAgent.name} is analyzing your case...`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentProcessingMessage])

      // Step 6: Call the agent API
      console.log("Starting agent chat...")
      const chatResponse = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_config: {
            agent_name: selectedAgent.name,
            description: selectedAgent.description,
            system_prompt: selectedAgent.systemPrompt,
            model_name: selectedModel || "claude-sonnet-4-20250514",
            role: "worker",
            max_loops: 1,
            max_tokens: 8192,
            temperature: 0.7,
            auto_generate_prompt: false,
          },
          task: currentInput,
          history: historyForApi.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!chatResponse.ok) {
        throw new Error(`Chat API error: ${chatResponse.status}`)
      }

      const chatData = await chatResponse.json()

      // Step 7: Extract the agent response content
      let fullResponse = ""
      if (chatData && chatData.processedOutput) {
        fullResponse = chatData.processedOutput
      } else if (typeof chatData === "string") {
        fullResponse = chatData
      } else {
        fullResponse = "I processed your request, but didn't receive a response. Please try again."
      }

      // Step 8: Replace agent processing with actual response
      setMessages((prev) => {
        const messagesWithoutProcessing = prev.filter(msg => msg.content !== `${selectedAgent.name} is analyzing your case...`)
        const agentMessage: GroupChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: fullResponse || "I processed your request, but didn't receive a response. Please try again.",
          timestamp: new Date(),
          selectedAgent: {
            name: selectedAgent.name,
            specialty: selectedAgent.specialty,
            iconColor: selectedAgent.iconColor
          },
        }
        return [...messagesWithoutProcessing, agentMessage]
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
      content: "Hello! I'm your AI medical consultation system with dynamic specialist selection. I'll analyze your symptoms and automatically connect you with the most appropriate specialist from our team of 15+ medical experts. Please describe your health concerns, and I'll select the best specialist to help you.",
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
                <h1 className="font-bold text-lg sm:text-xl text-foreground truncate">AI Medical Consultation</h1>
                <p className="text-xs sm:text-sm text-mcs-blue truncate">Dynamic Specialist Selection • 15+ Experts</p>
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
          <div key={message.id} className="space-y-4 chat-bubble-animation">
            {/* User Message */}
            {message.role === "user" && (
              <div className="flex gap-4 flex-row-reverse">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-r from-mcs-blue to-mcs-blue-light">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div className="max-w-[80%] text-right">
                  <div className="glass-card p-4 rounded-2xl bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 border-mcs-blue/30">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">{message.content}</div>
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-2 px-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Assistant Response */}
            {message.role === "assistant" && (
              <div className="space-y-3">
                {/* Orchestrator-only Message */}
                {message.orchestratorData && message.content === "Orchestrator Analysis Complete" && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-purple-500/30 bg-purple-500/10">
                        <Brain className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="glass-card p-4 rounded-2xl border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-foreground">Orchestrator</span>
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            COMPLETE
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium">Agent chosen:</span> {message.selectedAgent?.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Rationale:</span> {message.orchestratorReasoning}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Messages */}
                {(message.content.includes("analyzing") || message.content.includes("processing")) && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-blue-500/30 bg-blue-500/10">
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="glass-card p-4 rounded-2xl border-white/10">
                        <div className="text-sm text-muted-foreground">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Response Panel */}
                {!message.orchestratorData && !message.content.includes("analyzing") && !message.content.includes("processing") && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="h-8 w-8 rounded-xl flex items-center justify-center border"
                        style={{
                          borderColor: message.selectedAgent?.iconColor + "30" || "#3B82F6" + "30",
                          backgroundColor: message.selectedAgent?.iconColor + "10" || "#3B82F6" + "10",
                        }}
                      >
                        <Stethoscope className="h-4 w-4" style={{ color: message.selectedAgent?.iconColor || "#3B82F6" }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="glass-card p-4 rounded-2xl border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-foreground">{message.selectedAgent?.name || "AI Assistant"}</span>
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                            RESPONDING
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                          <MarkdownContent content={message.content} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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