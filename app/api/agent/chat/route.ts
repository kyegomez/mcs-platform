import { type NextRequest, NextResponse } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function POST(request: NextRequest) {
  try {
    const { agent_config, task, history } = await request.json()

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    if (!apiKey) {
      console.error("SWARMS_API_KEY is not configured")
      return NextResponse.json({ error: "SWARMS_API_KEY is not configured" }, { status: 500 })
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
    console.log("=== SWARMS API REQUEST ===")
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

    console.log("=== SENDING TO SWARMS API ===")
    console.log("Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(`${SWARMS_API_URL}/v1/agent/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Swarms API error:", errorText)
      return NextResponse.json({ error: `Swarms API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("=== SWARMS API RESPONSE ===")
    console.log("Response structure:", Object.keys(data))
    console.log("Full response:", JSON.stringify(data, null, 2))

    // Process the response to make it easier to use on the client
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]

      // Add a processed field to make it easier for the client
      data.processedOutput = lastOutput?.content || "No content found in response"
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in agent chat API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
