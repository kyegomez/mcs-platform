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
import { ArrowLeft, Send, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { chatService } from "@/lib/services/chat-service"
import { MarkdownMessage } from "@/components/markdown-message"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { agentId } = params
  const agent = agents.find((a) => a.id === agentId)
  const { user, isLoading: authLoading } = useAuth()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLoadingChat, setIsLoadingChat] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from database
  useEffect(() => {
    if (!agent || !user) {
      if (!authLoading && !agent) {
        router.push("/chat")
      }
      return
    }

    const loadChatHistory = async () => {
      setIsLoadingChat(true)
      try {
        // Get or create a chat for this agent
        const chatId = await chatService.getOrCreateChat(user.id, agent.id)
        setChatId(chatId)

        // Get messages for this chat
        const chatMessages = await chatService.getChatMessages(chatId)

        if (chatMessages.length > 0) {
          setMessages(chatMessages)
        } else {
          // Add welcome message if no history exists
          const welcomeMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `Hello, I'm ${agent.name}, your ${agent.specialty} specialist. How can I assist you today?`,
            timestamp: new Date(),
            chatId,
          }
          setMessages([welcomeMessage])

          // Save welcome message to database
          await chatService.addMessage(chatId, {
            role: welcomeMessage.role,
            content: welcomeMessage.content,
            timestamp: welcomeMessage.timestamp,
          })
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
        setError("Failed to load chat history. Please try again.")
      } finally {
        setIsLoadingChat(false)
      }
    }

    loadChatHistory()
  }, [agent, user, router, authLoading])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !agent || !chatId || !user) return

    setError(null)
    const userMessage: ChatMessage = {
      id: uuidv4(), // Temporary ID
      role: "user",
      content: input,
      timestamp: new Date(),
      chatId,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentStreamingMessage("")

    try {
      // Save user message to database
      const savedUserMessage = await chatService.addMessage(chatId, {
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
      })

      // Update the message with the saved ID
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? savedUserMessage : msg)))

      // Get all messages except the welcome message for the API
      const historyForApi = messages.filter(
        (msg) => !(msg.role === "assistant" && msg.content.includes(`Hello, I'm ${agent.name}`)),
      )

      let fullResponse = ""

      await streamChatWithAgent(
        agent,
        input,
        [...historyForApi, userMessage], // Include the current user message in history
        (chunk) => {
          fullResponse += chunk
          setCurrentStreamingMessage(fullResponse)
        },
      )

      // Create the assistant message with the full response
      const assistantMessage: ChatMessage = {
        id: uuidv4(), // Temporary ID
        role: "assistant",
        content: fullResponse || "I processed your request, but didn't receive a response. Please try again.",
        timestamp: new Date(),
        chatId,
      }

      // Save assistant message to database
      const savedAssistantMessage = await chatService.addMessage(chatId, {
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
      })

      setMessages((prev) => [...prev, savedAssistantMessage])
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
        chatId,
      }

      // Save error message to database
      if (chatId) {
        try {
          await chatService.addMessage(chatId, {
            role: errorMessage.role,
            content: errorMessage.content,
            timestamp: errorMessage.timestamp,
          })
        } catch (e) {
          console.error("Error saving error message:", e)
        }
      }

      setMessages((prev) => [...prev, errorMessage])
      setCurrentStreamingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const clearChatHistory = async () => {
    if (!agent || !chatId || !user) return

    try {
      // Delete the chat from the database
      await chatService.deleteChat(chatId)

      // Create a new chat
      const newChatId = await chatService.getOrCreateChat(user.id, agent.id)
      setChatId(newChatId)

      // Add only the welcome message
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `Hello, I'm ${agent.name}, your ${agent.specialty} specialist. How can I assist you today?`,
        timestamp: new Date(),
        chatId: newChatId,
      }

      // Save welcome message to database
      await chatService.addMessage(newChatId, {
        role: welcomeMessage.role,
        content: welcomeMessage.content,
        timestamp: welcomeMessage.timestamp,
      })

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error clearing chat history:", error)
      setError("Failed to clear chat history. Please try again.")
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcs-blue mx-auto"></div>
          <p className="mt-4 text-mcs-gray-light">Loading...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/chat")}
            className="text-mcs-gray-light hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              {agent.avatar ? (
                <Image src={agent.avatar || "/placeholder.svg"} alt={agent.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-mcs-gray flex items-center justify-center">
                  <span className="text-lg font-bold text-mcs-blue">{agent.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-xl">{agent.name}</h1>
              <p className="text-sm text-mcs-blue">{agent.specialty}</p>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={clearChatHistory} className="text-mcs-gray-light hover:text-white">
          <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
        </Button>
      </div>

      {error && (
        <Alert className="mb-4 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
        {isLoadingChat ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mcs-blue"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} chat-bubble-animation`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-mcs-blue text-white" : "bg-mcs-gray text-white"
                  }`}
                  style={{ overflowWrap: "break-word" }}
                >
                  <MarkdownMessage content={message.content} />
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {currentStreamingMessage && (
              <div className="flex justify-start chat-bubble-animation">
                <div
                  className="max-w-[80%] rounded-lg p-4 bg-mcs-gray text-white"
                  style={{ overflowWrap: "break-word" }}
                >
                  <MarkdownMessage content={currentStreamingMessage} />
                  <div className="text-xs opacity-70 mt-2">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="resize-none bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || isLoadingChat}
          className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
