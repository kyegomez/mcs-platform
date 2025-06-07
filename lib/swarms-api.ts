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
        model_name: "gpt-4o-mini",
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
        model_name: "gpt-4o-mini",
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

    // Use the non-streaming endpoint first to get the full response
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

    let content = ""

    // If the API returned a processed output, use that directly
    if (data.processedOutput) {
      console.log("[CLIENT] Using processed output from server")
      content = data.processedOutput
    }
    // Otherwise, try to extract the content from the outputs
    else if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[CLIENT] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })
      content = lastOutput?.content || "No content found in response"
    } else {
      // If we get here, something went wrong
      console.error("[CLIENT] Could not extract content from response:", data)
      content = "Could not get a response from the agent. Please try again."
    }

    // Now simulate streaming with the content we got
    console.log("[CLIENT] Simulating streaming with content length:", content.length)

    // Simulate streaming by sending chunks of the response
    const chunkSize = 5 // Characters per chunk
    let index = 0

    const streamInterval = setInterval(() => {
      if (index < content.length) {
        const chunk = content.slice(index, index + chunkSize)
        onChunk(chunk)
        index += chunkSize

        if (index % 100 === 0) {
          console.log(`[CLIENT] Streamed ${index}/${content.length} characters`)
        }
      } else {
        clearInterval(streamInterval)
        console.log("[CLIENT] Streaming complete")
      }
    }, 15) // Adjust timing for realistic streaming

    // Return a promise that resolves when streaming is complete
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (index >= content.length) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  } catch (error) {
    console.error("[CLIENT] Error streaming chat with agent:", error)
    throw error
  }
}
