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

    console.log("Making streaming request to Swarms API with:", {
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
      console.error("Swarms API streaming error:", errorText)
      return NextResponse.json({ error: `Swarms API error: ${errorText}` }, { status: response.status })
    }

    // For the streaming endpoint, we need to manually create a stream from the response
    const data = await response.json()

    if (!data || !data.outputs || !Array.isArray(data.outputs) || data.outputs.length === 0) {
      console.error("Unexpected response structure:", data)
      return NextResponse.json(
        {
          error: "Unexpected response structure from Swarms API",
          data: data,
        },
        {
          status: 500,
        },
      )
    }

    // Get the last output from the array, which should contain the actual response
    const lastOutput = data.outputs[data.outputs.length - 1]

    if (!lastOutput || typeof lastOutput.content !== "string") {
      console.error("Invalid output content:", lastOutput)
      return NextResponse.json(
        {
          error: "Invalid output content from Swarms API",
          output: lastOutput,
        },
        {
          status: 500,
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
    console.error("Error in agent chat stream API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
