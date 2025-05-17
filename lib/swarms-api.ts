import type { Agent, ChatMessage } from "@/types/agent"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

// Helper function to retry API calls
async function retryFetch(url: string, options: RequestInit, maxRetries = 3, delay = 1000) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[RETRY] Attempt ${attempt}/${maxRetries} for ${url}`)
      const response = await fetch(url, options)

      // If response is ok, return it immediately
      if (response.ok) {
        return response
      }

      // If not ok, get error text and throw
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    } catch (error) {
      console.error(`[RETRY] Attempt ${attempt} failed:`, error)
      lastError = error

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError
}

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

    // Use the retry mechanism for the fetch call
    const response = await retryFetch(
      "/api/agent/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      3,
      1000,
    )

    console.log("[CLIENT] Received response from chat API with status:", response.status)

    const data = await response.json()
    console.log("[CLIENT] Parsed response data:", {
      keys: Object.keys(data),
      success: data.success,
      outputsLength: data.outputs?.length,
      processedOutput: data.processedOutput?.substring(0, 100) + "...",
      rawData: JSON.stringify(data).substring(0, 500) + "...",
    })

    // If the API returned a processed output, use that directly
    if (data.processedOutput) {
      console.log("[CLIENT] Using processed output from server")
      return data.processedOutput
    }

    // Otherwise, try to extract the content from the outputs
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[CLIENT] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })
      return lastOutput?.content || "No content found in response"
    }

    // If we get here, something went wrong
    console.error("[CLIENT] Could not extract content from response:", data)
    return "Could not get a response from the agent. Please try again."
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

    // Use the retry mechanism for the fetch call
    const response = await retryFetch(
      "/api/agent/chat/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      3,
      1000,
    )

    console.log("[CLIENT] Received response from stream API with status:", response.status)
    console.log("[CLIENT] Response headers:", {
      contentType: response.headers.get("Content-Type"),
      contentLength: response.headers.get("Content-Length"),
    })

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
    let receivedContent = ""

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        totalReceived += chunk.length
        receivedContent += chunk
        console.log(`[CLIENT] Received chunk (${chunk.length} chars): "${chunk.substring(0, 20)}..."`)
        onChunk(chunk)
      }
    }

    console.log(`[CLIENT] Stream complete, received ${totalReceived} total characters`)

    // If we didn't receive any content, send a fallback message
    if (totalReceived === 0 || receivedContent.trim() === "") {
      console.warn("[CLIENT] No content received from stream, sending fallback message")
      onChunk("Could not get a response from the agent. Please try again.")
    }
  } catch (error) {
    console.error("[CLIENT] Error streaming chat with agent:", error)
    throw error
  }
}
