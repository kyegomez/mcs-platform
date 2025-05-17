import type { NextRequest } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function POST(request: NextRequest) {
  try {
    const { agent_config, task, history } = await request.json()

    // Get the API key from environment variables
    const apiKey = process.env.SWARMS_API_KEY

    // Log the API key status (without revealing the key)
    console.log("API Key status:", apiKey ? "Configured" : "Not configured")

    if (!apiKey) {
      console.error("SWARMS_API_KEY environment variable is not configured")
      return new Response(JSON.stringify({ error: "SWARMS_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
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
    console.log("Swarms API response structure:", Object.keys(data))

    // Check if the response has the expected structure but handle empty outputs gracefully
    let content = ""

    if (data && data.success === true) {
      if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
        // Get the last output from the array, which should contain the actual response
        const lastOutput = data.outputs[data.outputs.length - 1]

        if (lastOutput && typeof lastOutput.content === "string") {
          content = lastOutput.content
        } else {
          console.warn("Invalid output content in successful response:", lastOutput)
          content = "I received your message but couldn't generate a proper response. Please try again."
        }
      } else {
        // API returned success but empty outputs - this is a valid case we need to handle
        console.log("API returned success but empty outputs, generating fallback response")
        content = "I'm processing your request, but I need a moment. Please try again or rephrase your question."
      }
    } else {
      // Something is wrong with the response
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
