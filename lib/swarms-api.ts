import type { Agent, ChatMessage } from "@/types/agent"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function chatWithAgent(agent: Agent, message: string, history: ChatMessage[], selectedModel?: string) {
  try {
    // Format history for the Swarms API
    // Only include messages that have content (not empty strings)
    const historyFormatted = history
      .filter((msg) => msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    console.log("Sending chat with history:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      history_sample: historyFormatted.slice(-2), // Log last 2 messages for debugging
    })

    const payload = {
      agent_config: {
        agent_name: agent.name,
        description: agent.description,
        system_prompt: agent.systemPrompt,
        model_name: selectedModel || "claude-sonnet-4-20250514", // Use selected model or default
        role: "worker",
        max_loops: 1,
        max_tokens: 8192,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: message,
      history: historyFormatted.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }

    console.log("Sending request to chat API:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
    })

    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    
    console.log("=== CHAT WITH AGENT DEBUG ===")
    console.log("Raw API response data:", data)
    console.log("Data type:", typeof data)
    console.log("Data keys:", Object.keys(data))

    // Return the full response object so the client can access both processedOutput and outputs
    return data
  } catch (error) {
    console.error("Error chatting with agent:", error)
    throw error
  }
}

export async function streamChatWithAgent(
  agent: Agent,
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
  selectedModel?: string,
) {
  try {
    // Format history for the Swarms API
    // Only include messages that have content (not empty strings)
    const historyFormatted = history
      .filter((msg) => msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    console.log("Streaming chat with history:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      history_sample: historyFormatted.slice(-2), // Log last 2 messages for debugging
    })

    const payload = {
      agent_config: {
        agent_name: agent.name,
        description: agent.description,
        system_prompt: agent.systemPrompt,
        model_name: selectedModel || "claude-sonnet-4-20250514", // Use selected model or default
        role: "worker",
        max_loops: 1,
        max_tokens: 8192,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: message,
      history: historyFormatted.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }

    console.log("Sending request to stream API:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
    })

    const response = await fetch("/api/agent/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(`API error: ${response.status} - ${errorJson.error || "Unknown error"}`)
      } catch (e) {
        throw new Error(`API error: ${response.status} - ${errorText || "Unknown error"}`)
      }
    }

    // Check if the response is JSON (error) instead of a stream
    const contentType = response.headers.get("Content-Type") || ""
    if (contentType.includes("application/json")) {
      const errorData = await response.json()
      throw new Error(`API returned JSON instead of stream: ${errorData.error || "Unknown error"}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("Response body is null")

    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        onChunk(chunk)
      }
    }
  } catch (error) {
    console.error("Error streaming chat with agent:", error)
    throw error
  }
}
