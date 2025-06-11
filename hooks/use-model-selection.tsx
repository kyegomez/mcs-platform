"use client"

import { useState, useEffect } from "react"

const DEFAULT_MODEL = "claude-3-5-sonnet-20240620"
const STORAGE_KEY = "selected-ai-model"

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved model from session storage on mount
  useEffect(() => {
    try {
      const savedModel = sessionStorage.getItem(STORAGE_KEY)
      if (savedModel) {
        setSelectedModel(savedModel)
      }
    } catch (error) {
      console.warn("Failed to load model from session storage:", error)
    }
  }, [])

  // Save model to session storage when it changes
  const changeModel = (modelId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      sessionStorage.setItem(STORAGE_KEY, modelId)
      setSelectedModel(modelId)

      // Simulate a brief loading state for better UX
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    } catch (error) {
      console.error("Failed to save model to session storage:", error)
      setError("Failed to switch model")
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    selectedModel,
    changeModel,
    isLoading,
    error,
    clearError,
  }
}
