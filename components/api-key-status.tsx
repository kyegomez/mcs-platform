"use client"

import { useEffect, useState } from "react"

export function ApiKeyStatus() {
  const [status, setStatus] = useState<"loading" | "configured" | "missing">("loading")

  useEffect(() => {
    async function checkApiKey() {
      try {
        const response = await fetch("/api/check-api-key")
        const data = await response.json()
        setStatus(data.configured ? "configured" : "missing")
      } catch (error) {
        console.error("Error checking API key:", error)
        setStatus("missing")
      }
    }

    checkApiKey()
  }, [])

  // Don't render anything if the API key is configured or still loading
  if (status === "loading" || status === "configured") {
    return null
  }

  // Only show a warning if the API key is missing
  return (
    <div className="p-4 mb-6 border border-red-500 rounded-md bg-red-500/10">
      <p className="font-medium text-red-500">API Key Missing</p>
      <p className="text-sm text-mcs-gray-light mt-1">
        Please add the SWARMS_API_KEY environment variable to enable chat functionality.
      </p>
    </div>
  )
}
