import { type NextRequest, NextResponse } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

// Update the POST function to combine task and history into a single task parameter
export async function POST(request: NextRequest) {
  try {
    const { agent_config, task, history } = await request.json()

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    if (!apiKey) {
      console.error("SWARMS_API_KEY is not configured")
      return NextResponse.json({ error: "SWARMS_API_KEY is not configured" }, { status: 500 })
    }

    // Log the history being sent to the API
    console.log("Making request to Swarms API with:", {
      url: `${SWARMS_API_URL}/v1/agent/completions`,
      agent_name: agent_config?.agent_name,
      task_length: task?.length,
      history_length: history?.length,
      history_sample: history?.slice(-2), // Log last 2 messages for debugging
    })

    // Format the payload - combine history into the task if it exists
    const payload = {
      agent_config,
      task:
        history && history.length > 0
          ? `Previous conversation:\n${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}\n\nUser's current message: ${task}`
          : task,
    }

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
    console.log("Swarms API response structure:", Object.keys(data))

    // Process the response to make it easier to use on the client
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]

      // Add a processed field to make it easier for the client
      data.processedOutput = lastOutput?.content || "No content found in response"
    } else if (data && data.success === true && (!data.outputs || data.outputs.length === 0)) {
      // Handle case where API returns success but empty outputs
      console.log("API returned success but empty outputs, generating fallback response")
      data.processedOutput =
        "I'm processing your request, but I need a moment. Please try again or rephrase your question."

      // Add an empty outputs array if it doesn't exist
      if (!data.outputs) {
        data.outputs = []
      }
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
