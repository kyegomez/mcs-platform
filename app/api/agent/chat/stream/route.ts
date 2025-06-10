import type { NextRequest } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function POST(request: NextRequest) {
  try {
    const { agent_config, task, history } = await request.json()

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    if (!apiKey) {
      console.error("SWARMS_API_KEY environment variable is not configured")
      return new Response(JSON.stringify({ error: "SWARMS_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Process and validate history
    let processedHistory = []
    if (history && Array.isArray(history)) {
      processedHistory = history
        .filter((msg) => msg && msg.content && msg.content.trim() !== "")
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: String(msg.content).trim(),
        }))
    }

    // Enhanced logging
    console.log("=== SWARMS STREAMING API REQUEST ===")
    console.log("Agent:", agent_config?.agent_name)
    console.log("Task:", task?.substring(0, 100) + "...")
    console.log("Raw history length:", history?.length || 0)
    console.log("Processed history length:", processedHistory.length)
    console.log("Processed history:", JSON.stringify(processedHistory, null, 2))

    const payload = {
      agent_config: {
        ...agent_config,
        system_prompt:
          agent_config.system_prompt +
          "\n\nIMPORTANT: You have access to the conversation history. Please reference previous messages when relevant and maintain context throughout the conversation.",
      },
      task,
      history: processedHistory,
    }

    console.log("=== SENDING TO SWARMS STREAMING API ===")
    console.log("Payload:", JSON.stringify(payload, null, 2))

    const swarmsResponse = await fetch(`${SWARMS_API_URL}/v1/agent/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!swarmsResponse.ok) {
      const errorText = await swarmsResponse.text()
      console.error("Swarms API error:", errorText)
      return new Response(JSON.stringify({ error: `Swarms API error: ${errorText}` }), {
        status: swarmsResponse.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await swarmsResponse.json()
    console.log("=== SWARMS STREAMING API RESPONSE ===")
    console.log("Response structure:", Object.keys(data))
    console.log("Full response:", JSON.stringify(data, null, 2))

    // Check if the response has the expected structure
    if (!data || !data.outputs || !Array.isArray(data.outputs) || data.outputs.length === 0) {
      console.error("Unexpected response structure:", data)
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

    // Get the last output from the array, which should contain the actual response
    const lastOutput = data.outputs[data.outputs.length - 1]

    if (!lastOutput || typeof lastOutput.content !== "string") {
      console.error("Invalid output content:", lastOutput)
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

    // Create a stream from the response
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks of the response
        const chunkSize = 5 // Characters per chunk

        let index = 0
        const interval = setInterval(() => {
          if (index < content.length) {
            const chunk = content.slice(index, index + chunkSize)
            controller.enqueue(new TextEncoder().encode(chunk))
            index += chunkSize
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 15) // Adjust timing for realistic streaming
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error in agent chat streaming API:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
