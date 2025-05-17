import type { NextRequest } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

// Helper function to retry API calls
async function retryFetch(url: string, options: RequestInit, maxRetries = 3, delay = 1000) {
  let lastError
  let lastResponse

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[SERVER-STREAM] Retry attempt ${attempt}/${maxRetries} for ${url}`)
      const response = await fetch(url, options)
      lastResponse = response

      // Check if response is ok
      if (response.ok) {
        // Clone the response before reading it
        const responseClone = response.clone()
        const data = await responseClone.json()

        // Check if the response has outputs
        if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
          console.log(`[SERVER-STREAM] Attempt ${attempt}: Found valid outputs`)
          return response
        }

        // If no outputs but success is true, and we have more retries, continue
        if (data && data.success === true && attempt < maxRetries) {
          console.log(`[SERVER-STREAM] Attempt ${attempt}: Success but no outputs, retrying...`)
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
      console.error(`[SERVER-STREAM] Attempt ${attempt} failed:`, error)
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
    console.log("[SERVER-STREAM] Received request to /api/agent/chat/stream")

    const { agent_config, task, history } = await request.json()

    console.log("[SERVER-STREAM] Request payload:", {
      agent_name: agent_config?.agent_name,
      task_length: task?.length,
      task_preview: task?.substring(0, 50) + "...",
      history_length: history?.length,
    })

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    // Log the API key status (without revealing the key)
    console.log("[SERVER-STREAM] API Key status:", apiKey ? "Configured" : "Not configured")

    if (!apiKey) {
      console.error("[SERVER-STREAM] SWARMS_API_KEY environment variable is not configured")
      return new Response(JSON.stringify({ error: "SWARMS_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log the history being sent to the API
    console.log("[SERVER-STREAM] Making request to Swarms API with:", {
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

    console.log("[SERVER-STREAM] Full payload to Swarms API:", JSON.stringify(payload))

    // Use the retry mechanism for the fetch call
    const swarmsResponse = await retryFetch(
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

    console.log("[SERVER-STREAM] Swarms API response status:", swarmsResponse.status)
    console.log("[SERVER-STREAM] Swarms API response headers:", {
      contentType: swarmsResponse.headers.get("Content-Type"),
      contentLength: swarmsResponse.headers.get("Content-Length"),
    })

    if (!swarmsResponse.ok) {
      const errorText = await swarmsResponse.text()
      console.error("[SERVER-STREAM] Swarms API error:", errorText)
      return new Response(JSON.stringify({ error: `Swarms API error: ${errorText}` }), {
        status: swarmsResponse.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Clone the response before reading it as JSON
    const responseForJson = swarmsResponse.clone()

    // Parse the JSON response
    const data = await responseForJson.json()
    console.log("[SERVER-STREAM] Swarms API response structure:", {
      keys: Object.keys(data),
      id: data.id,
      success: data.success,
      name: data.name,
      outputsLength: data.outputs?.length,
    })

    // Log the full response for debugging
    console.log("[SERVER-STREAM] Full Swarms API response:", JSON.stringify(data))

    // Check if the response has outputs
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]

      if (!lastOutput || typeof lastOutput.content !== "string") {
        console.error("[SERVER-STREAM] Invalid output content:", lastOutput)
        return new Response(
          JSON.stringify({
            error: "Invalid output content from Swarms API",
            output: lastOutput,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      const content = lastOutput.content
      console.log("[SERVER-STREAM] Found output content:", {
        length: content.length,
        preview: content.substring(0, 100) + "...",
      })

      // Create a stream from the response
      const stream = new ReadableStream({
        start(controller) {
          console.log("[SERVER-STREAM] Starting stream with content length:", content.length)
          // Simulate streaming by sending chunks of the response
          const chunkSize = 5 // Characters per chunk

          let index = 0
          const interval = setInterval(() => {
            if (index < content.length) {
              const chunk = content.slice(index, index + chunkSize)
              controller.enqueue(new TextEncoder().encode(chunk))
              index += chunkSize

              if (index % 100 === 0) {
                console.log(`[SERVER-STREAM] Streamed ${index}/${content.length} characters`)
              }
            } else {
              clearInterval(interval)
              controller.close()
              console.log("[SERVER-STREAM] Stream completed")
            }
          }, 15) // Adjust timing for realistic streaming
        },
      })

      console.log("[SERVER-STREAM] Returning stream response")
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    } else if (data && data.success === true) {
      // API call was successful but no outputs were returned
      console.log("[SERVER-STREAM] API returned success but no outputs:", data)
      const content = "Could not get a response from the agent. Please try again."

      // Create a stream from the response
      const stream = new ReadableStream({
        start(controller) {
          console.log("[SERVER-STREAM] Starting stream with fallback message")
          controller.enqueue(new TextEncoder().encode(content))
          controller.close()
          console.log("[SERVER-STREAM] Stream completed")
        },
      })

      console.log("[SERVER-STREAM] Returning fallback stream response")
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    } else {
      console.error("[SERVER-STREAM] Unexpected response structure:", data)
      return new Response(
        JSON.stringify({
          error: "Unexpected response structure from Swarms API",
          data: data,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("[SERVER-STREAM] Error in agent chat streaming API:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
