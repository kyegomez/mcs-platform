import type { Agent } from "@/types/agent"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function runHealthcareSwarm(agents: Agent[], task: string) {
  try {
    // Format the agents for the swarm API
    const formattedAgents = agents.map((agent) => ({
      agent_name: agent.name,
      description: agent.description,
      system_prompt: agent.systemPrompt,
      model_name: "gpt-4o",
      role: "worker",
      max_loops: 1,
      max_tokens: 8192,
      temperature: 0.7,
      auto_generate_prompt: false,
    }))

    const payload = {
      name: "Healthcare Analysis Swarm",
      description: "A swarm of healthcare specialists working together",
      agents: formattedAgents,
      max_loops: 1,
      swarm_type: "ConcurrentWorkflow",
      task: task,
      output_type: "dict",
    }

    const response = await fetch("/api/swarm/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()

    // Process the response to extract the relevant content
    if (data && data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      // Get the last output from the array, which should contain the actual response
      const lastOutput = data.outputs[data.outputs.length - 1]

      // Add a processed field to make it easier for the client
      data.processedOutput = lastOutput?.content || "No content found in response"
    }

    return data
  } catch (error) {
    console.error("Error running healthcare swarm:", error)
    throw error
  }
}
