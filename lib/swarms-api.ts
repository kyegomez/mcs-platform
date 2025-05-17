import type { Agent, ChatMessage } from "@/types/agent"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function chatWithAgent(agent: Agent, message: string, history: ChatMessage[]) {
  try {
    // Format history for the Swarms API
    // Only include messages that have content (not empty strings)
    const historyFormatted = history
      .filter((msg) => msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    console.log("[CLIENT] Sending chat with history:", {
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
        model_name: "claude-3-5-sonnet-20240620",
        role: "worker",
        max_loops: 1,
        max_tokens: 16000,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: message,
      // Remove the history parameter
    }

    console.log("[CLIENT] Sending request to chat API:", {
      agent_name: agent.name,
      message_length: message.length,
      payload: JSON.stringify(payload),
    })

    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("[CLIENT] Received response from chat API with status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("[CLIENT] Error response from chat API:", errorData)
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    console.log("[CLIENT] Parsed response data:", {
      keys: Object.keys(data),
      success: data.success,
      outputsLength: data.outputs?.length,
      processedOutput: data.processedOutput?.substring(0, 100) + "...",
    })

    // Check if the API response has the expected structure
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[CLIENT] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })
      return lastOutput?.content || "No content found in response"
    } else if (data && data.success === true) {
      // API call was successful but no outputs were returned
      console.log("[CLIENT] API returned success but no outputs:", data)
      return "The agent is processing your request. Please try again in a moment."
    } else {
      console.error("[CLIENT] Unexpected API response structure:", data)
      return "Received an unexpected response format from the API."
    }
  } catch (error) {
    console.error("[CLIENT] Error chatting with agent:", error)
    throw error
  }
}

export async function streamChatWithAgent(
  agent: Agent,
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
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

    console.log("[CLIENT] Streaming chat with history:", {
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
        model_name: "claude-3-5-sonnet-20240620",
        role: "worker",
        max_loops: 1,
        max_tokens: 16000,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: message,
      // Remove the history parameter
    }

    console.log("[CLIENT] Sending request to stream API:", {
      agent_name: agent.name,
      message_length: message.length,
      payload: JSON.stringify(payload),
    })

    // Use the stream endpoint directly
    const response = await fetch("/api/agent/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("[CLIENT] Received response from stream API with status:", response.status)
    console.log("[CLIENT] Response headers:", {
      contentType: response.headers.get("Content-Type"),
      contentLength: response.headers.get("Content-Length"),
    })

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text()
      console.error("[CLIENT] Error response from stream API:", errorText)
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
      console.warn("[CLIENT] Received JSON instead of stream, parsing as error")
      const errorData = await response.json()
      console.error("[CLIENT] JSON error data:", errorData)
      throw new Error(`API returned JSON instead of stream: ${errorData.error || "Unknown error"}`)
    }

    console.log("[CLIENT] Starting to read stream")
    // Process the stream directly
    const reader = response.body?.getReader()
    if (!reader) {
      console.error("[CLIENT] Response body is null")
      throw new Error("Response body is null")
    }

    const decoder = new TextDecoder()
    let done = false
    let totalReceived = 0

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        totalReceived += chunk.length
        console.log(`[CLIENT] Received chunk (${chunk.length} chars): "${chunk.substring(0, 20)}..."`)
        onChunk(chunk)
      }
    }

    console.log(`[CLIENT] Stream complete, received ${totalReceived} total characters`)
  } catch (error) {
    console.error("[CLIENT] Error streaming chat with agent:", error)
    throw error
  }
}
