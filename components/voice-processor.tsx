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
  const [audioLevel, setAudioLevel] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()

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

        startAudioVisualization()
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
          stopAudioVisualization()
        }
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        stopAudioVisualization()
      }

      recognition.onend = () => {
        setIsListening(false)
        stopAudioVisualization()
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
      stopAudioVisualization()
    }
  }, [onTranscript, setIsListening])

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const microphone = audioContext.createMediaStreamSource(stream)
      microphoneRef.current = microphone
      microphone.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(Math.min(average / 128, 1))
          animationRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setAudioLevel(0)
  }

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
      stopAudioVisualization()
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

  // Expose the speak function to parent component
  useEffect(() => {
    if (onSpeakResponse) {
      onSpeakResponse(speakText)
    }
  }, [speechEnabled])

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Voice Input Button with Animation */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "rounded-xl transition-all duration-300 relative overflow-hidden",
            isListening
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
          disabled={isSpeaking}
        >
          {isListening ? <MicOff className="h-5 w-5 relative z-10" /> : <Mic className="h-5 w-5 relative z-10" />}

          {/* Pulsing Animation */}
          {isListening && (
            <>
              <div
                className="absolute inset-0 bg-red-500/30 rounded-xl animate-ping"
                style={{ animationDuration: "1s" }}
              />
              <div
                className="absolute inset-0 bg-red-500/20 rounded-xl animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </>
          )}

          {/* Audio Level Visualization */}
          {isListening && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-red-400/40 rounded-xl transition-opacity duration-100"
              style={{
                opacity: audioLevel * 0.8,
                transform: `scale(${1 + audioLevel * 0.1})`,
              }}
            />
          )}
        </Button>

        {/* Recording Indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Audio Waveform Visualization */}
      {isListening && (
        <div className="flex items-center gap-1 ml-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full transition-all duration-150"
              style={{
                height: `${8 + audioLevel * 20 * Math.sin(Date.now() / 200 + i)}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Speech Toggle Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSpeech}
        className={cn(
          "rounded-xl transition-all duration-200",
                      speechEnabled ? "text-primary hover:bg-primary/20" : "text-muted-foreground/70 hover:bg-muted/20",
        )}
        disabled={isListening}
      >
        {isSpeaking ? (
          <div className="relative">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="absolute inset-0 bg-mcs-blue/20 rounded-full animate-pulse" />
          </div>
        ) : speechEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
