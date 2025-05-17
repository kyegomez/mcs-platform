import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    if (!apiKey) {
      console.error("SWARMS_API_KEY is not configured")
      return NextResponse.json({ error: "SWARMS_API_KEY is not configured" }, { status: 500 })
    }

    // Make sure we have the required fields
    if (!payload.agent_config || !payload.task) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // The Swarms API doesn't have a history parameter, so we need to ensure
    // the history is included in the task parameter

    console.log("Making request to Swarms API with:", {
      agent_name: payload.agent_config.agent_name,
      task_length: payload.task?.length,
    })

    const response = await fetch("https://swarms-api-285321057562.us-east1.run.app/v1/agent/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        agent_config: payload.agent_config,
        task: payload.task,
      }),
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
