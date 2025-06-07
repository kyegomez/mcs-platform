import { NextResponse } from "next/server"
import { getApiKey } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error("[SERVER] No API key found")
      return NextResponse.json(
        { error: "API key not configured. Please set the SWARMS_API_KEY environment variable." },
        { status: 500 },
      )
    }

    const body = await request.json()
    console.log("[SERVER] Received request body:", {
      agent_name: body.agent_config?.agent_name,
      task_length: body.task?.length,
    })

    // Ensure the model name is set to gpt-4o-mini
    if (body.agent_config && body.agent_config.model_name !== "gpt-4o-mini") {
      console.log("[SERVER] Overriding model name to gpt-4o-mini")
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
      console.error(`[SERVER] Swarms API error: ${swarmsResponse.status}`, errorText)
      return NextResponse.json(
        { error: `Error from Swarms API: ${swarmsResponse.status}`, details: errorText },
        { status: swarmsResponse.status },
      )
    }

    const data = await swarmsResponse.json()
    console.log("[SERVER] Swarms API response:", {
      success: data.success,
      outputsLength: data.outputs?.length,
      keys: Object.keys(data),
    })

    // Process the response
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      const lastOutput = data.outputs[data.outputs.length - 1]
      console.log("[SERVER] Found output content:", {
        content: lastOutput?.content?.substring(0, 100) + "...",
      })

      // Return both the processed output and the full response
      return NextResponse.json({
        ...data,
        processedOutput: lastOutput?.content || null,
      })
    }

    // If we couldn't process the output, return the raw response
    return NextResponse.json(data)
  } catch (error) {
    console.error("[SERVER] Error in chat route:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
