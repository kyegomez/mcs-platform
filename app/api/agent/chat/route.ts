import { type NextRequest, NextResponse } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

// Helper function to retry API calls
async function retryFetch(url: string, options: RequestInit, maxRetries = 3, delay = 1000) {
  let lastError
  let lastResponse

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER] Retry attempt ${attempt}/${maxRetries} for ${url}`)
      const response = await fetch(url, options)
      lastResponse = response

      // Check if response is ok
      if (response.ok) {
        // Clone the response before reading it
        const responseClone = response.clone()
        const data = await responseClone.json()

        // Check if the response has outputs
        if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
          console.log(`[SERVER] Attempt ${attempt}: Found valid outputs`)
          return response
        }

        // If no outputs but success is true, and we have more retries, continue
        if (data && data.success === true && attempt < maxRetries) {
          console.log(`[SERVER] Attempt ${attempt}: Success but no outputs, retrying...`)
          await new Promise((resolve) => setTimeout(resolve, delay * attempt))
          continue
        }

        // If this is our last attempt or success is false, return what we have
        return response
      }

      // If not ok, get error text and throw
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    } catch (error) {
      console.error(`[SERVER] Attempt ${attempt} failed:`, error)
      lastError = error

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    }
  }

  // If we've exhausted all retries, return the last response or throw the last error
  if (lastResponse) return lastResponse
  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER] Received request to /api/agent/chat")

    const { agent_config, task, history } = await request.json()

    console.log("[SERVER] Request payload:", {
      agent_name: agent_config?.agent_name,
      task_length: task?.length,
      task_preview: task?.substring(0, 50) + "...",
      history_length: history?.length,
    })

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    if (!apiKey) {
      console.error("[SERVER] SWARMS_API_KEY is not configured")
      return NextResponse.json({ error: "SWARMS_API_KEY is not configured" }, { status: 500 })
    }

    console.log("[SERVER] API key is configured")

    // Log the history being sent to the API
    console.log("[SERVER] Making request to Swarms API with:", {
      url: `${SWARMS_API_URL}/v1/agent/completions`,
      agent_name: agent_config?.agent_name,
      task_length: task?.length,
      history_length: history?.length,
      history_sample: history?.slice(-2), // Log last 2 messages for debugging
    })

    const payload = {
      agent_config,
      task,
    }

    // If history exists, add it to the payload
    if (history && history.length > 0) {
      payload.history = history
    }

    console.log("[SERVER] Full payload to Swarms API:", JSON.stringify(payload))

    // Use the retry mechanism for the fetch call
    const response = await retryFetch(
      `${SWARMS_API_URL}/v1/agent/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      },
      3,
      2000,
    )

    console.log("[SERVER] Swarms API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[SERVER] Swarms API error:", errorText)
      return NextResponse.json({ error: `Swarms API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[SERVER] Swarms API response structure:", {
      keys: Object.keys(data),
      id: data.id,
      success: data.success,
      name: data.name,
      outputsLength: data.outputs?.length,
    })

    // Log the full response for debugging
    console.log("[SERVER] Full Swarms API response:", JSON.stringify(data))

    // Process the response to make it easier to use on the client
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[SERVER] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })

      // Add a processed field to make it easier for the client
      data.processedOutput = lastOutput?.content || "No content found in response"
    } else if (data && data.success === true) {
      // API call was successful but no outputs were returned
      console.log("[SERVER] API returned success but no outputs:", data)
      data.processedOutput = "Could not get a response from the agent. Please try again."
    } else {
      console.error("[SERVER] Unexpected API response structure:", data)
      data.processedOutput = "Received an unexpected response format from the API."
    }

    console.log("[SERVER] Returning processed response to client")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[SERVER] Error in agent chat API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
