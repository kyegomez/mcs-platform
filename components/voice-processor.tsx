"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceProcessorProps {
  onTranscript: (text: string) => void
  onSpeakResponse: (text: string) => void
  isListening: boolean
  setIsListening: (listening: boolean) => void
  className?: string
}

// Define SpeechRecognition and SpeechSynthesisWindow interfaces
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: any) => void
  onstart: () => void
  onerror: (event: any) => void
  onend: () => void
  start: () => void
  stop: () => void
}

interface SpeechSynthesis {
  cancel: () => void
  getVoices: () => SpeechSynthesisVoice[]
  speak: (utterance: SpeechSynthesisUtterance) => void
}

interface SpeechSynthesisVoice {
  name: string
  lang: string
}

interface SpeechSynthesisUtterance {
  rate: number
  pitch: number
  volume: number
  voice: SpeechSynthesisVoice | null
  text: string
  onstart: () => void
  onend: () => void
  onerror: () => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    speechSynthesis: SpeechSynthesis
    SpeechSynthesisUtterance: any
  }
}

export function VoiceProcessor({
  onTranscript,
  onSpeakResponse,
  isListening,
  setIsListening,
  className,
}: VoiceProcessorProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis

    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true)
      synthRef.current = speechSynthesis

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        console.log("Speech recognition started")
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript)
          setIsListening(false)
        }
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [onTranscript, setIsListening])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current || !speechEnabled) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use a more natural voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Microsoft") ||
        voice.name.includes("Alex") ||
        voice.name.includes("Samantha"),
    )

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled)
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  // Expose the speak function to parent component - fix infinite loop
  useEffect(() => {
    if (onSpeakResponse) {
      onSpeakResponse(speakText)
    }
  }, [speechEnabled]) // Remove onSpeakResponse from dependencies to prevent loop

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={isListening ? stopListening : startListening}
        className={cn(
          "rounded-xl transition-all duration-200",
          isListening
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse"
            : "text-gray-400 hover:text-white hover:bg-white/10",
        )}
        disabled={isSpeaking}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSpeech}
        className={cn(
          "rounded-xl transition-all duration-200",
          speechEnabled ? "text-mcs-blue hover:bg-mcs-blue/20" : "text-gray-500 hover:bg-gray-500/20",
        )}
        disabled={isListening}
      >
        {isSpeaking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : speechEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
