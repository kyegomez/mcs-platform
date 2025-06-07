import { NextResponse } from "next/server"
import { getApiKey } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error("[SERVER-STREAM] No API key found")
      return NextResponse.json(
        { error: "API key not configured. Please set the SWARMS_API_KEY environment variable." },
        { status: 500 },
      )
    }

    const body = await request.json()
    console.log("[SERVER-STREAM] Received request body:", {
      agent_name: body.agent_config?.agent_name,
      task_length: body.task?.length,
    })

    // Ensure the model name is set to gpt-4o-mini
    if (body.agent_config && body.agent_config.model_name !== "gpt-4o-mini") {
      console.log("[SERVER-STREAM] Overriding model name to gpt-4o-mini")
      body.agent_config.model_name = "gpt-4o-mini"
    }

    // Make the request to the Swarms API
    const swarmsResponse = await fetch("https://swarms-api-285321057562.us-east1.run.app/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!swarmsResponse.ok) {
      const errorText = await swarmsResponse.text()
      console.error(`[SERVER-STREAM] Swarms API error: ${swarmsResponse.status}`, errorText)
      return NextResponse.json(
        { error: `Error from Swarms API: ${swarmsResponse.status}`, details: errorText },
        { status: swarmsResponse.status },
      )
    }

    // Clone the response so we can read it twice
    const responseForJson = swarmsResponse.clone()

    // Parse the JSON response
    const data = await responseForJson.json()
    console.log("[SERVER-STREAM] Swarms API response:", {
      success: data.success,
      outputsLength: data.outputs?.length,
      keys: Object.keys(data),
    })

    // Process the response
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[SERVER-STREAM] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })

      // Create a stream from the content
      const content = lastOutput?.content || "No content found in response"
      const stream = new ReadableStream({
        start(controller) {
          // Send the content in chunks to simulate streaming
          const encoder = new TextEncoder()
          const chunks = content.match(/.{1,5}/g) || []

          let i = 0
          const interval = setInterval(() => {
            if (i < chunks.length) {
              controller.enqueue(encoder.encode(chunks[i]))
              i++
            } else {
              clearInterval(interval)
              controller.close()
            }
          }, 15)
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }

    // If we couldn't process the output, return an error
    return NextResponse.json({ error: "Could not extract content from Swarms API response", data }, { status: 500 })
  } catch (error) {
    console.error("[SERVER-STREAM] Error in stream route:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
