"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { VoiceProcessor } from "./voice-processor"

interface ChatFormProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatForm({ onSendMessage, isLoading = false, placeholder = "Type your message..." }: ChatFormProps) {
  const [message, setMessage] = useState("")
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setMessage(transcript)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[120px] resize-none bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 pr-12"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2">
            <VoiceProcessor
              onTranscript={handleVoiceTranscript}
              onSpeakResponse={() => {}}
              speechEnabled={isVoiceEnabled}
              onSpeechToggle={setIsVoiceEnabled}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
