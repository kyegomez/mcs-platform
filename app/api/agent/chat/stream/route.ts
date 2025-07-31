import type { NextRequest } from "next/server"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function POST(request: NextRequest) {
  try {
    const { agent_config, task, history } = await request.json()

    // Validate task length - very short messages might not generate responses
    if (!task || task.trim().length < 2) {
      const defaultResponse = "Hello! I'm here to help. Could you please provide more details about what you'd like to discuss?"
      
      const stream = new ReadableStream({
        start(controller) {
          const chunkSize = 5
          let index = 0
          const interval = setInterval(() => {
            if (index < defaultResponse.length) {
              const chunk = defaultResponse.slice(index, index + chunkSize)
              controller.enqueue(new TextEncoder().encode(chunk))
              index += chunkSize
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
    let processedHistory: Array<{ role: string; content: string }> = []
    if (history && Array.isArray(history)) {
      processedHistory = history
        .filter((msg) => msg && msg.content && msg.content.trim() !== "")
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: String(msg.content).trim(),
        }))
    }

    // Enhanced logging


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



    // For now, let's use the regular completions endpoint and simulate streaming
    // This is because the Swarms API might not support true streaming
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


    // Check if the response has the expected structure
    if (!data) {
      console.error("No response data from Swarms API")
      return new Response(
        JSON.stringify({
          error: "No response data from Swarms API",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Handle case where outputs array is empty - this might happen with very short messages
    if (!data.outputs || !Array.isArray(data.outputs) || data.outputs.length === 0) {
      
      
      // Check if there's a direct response in the data
      if (data.response || data.content || data.message) {
        const content = data.response || data.content || data.message || "I understand. How can I help you further?"
        
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
      }
      
      // If no alternative response found, return a default message
      const defaultResponse = "I understand. How can I help you further?"
      
      const stream = new ReadableStream({
        start(controller) {
          const chunkSize = 5
          let index = 0
          const interval = setInterval(() => {
            if (index < defaultResponse.length) {
              const chunk = defaultResponse.slice(index, index + chunkSize)
              controller.enqueue(new TextEncoder().encode(chunk))
              index += chunkSize
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
