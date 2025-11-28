import type { Agent, ChatMessage } from "@/types/agent"
import { readFileSync } from "fs"
import { join } from "path"

// Function to call the orchestrator API
export async function selectAgent(userMessage: string, conversationHistory?: ChatMessage[]) {
  try {
    console.log("Calling orchestrator with:", { userMessage, historyLength: conversationHistory?.length })
    
    const response = await fetch("/api/orchestrator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory: conversationHistory?.slice(-6) // Only send last 6 messages for context
      }),
    })

    console.log("Orchestrator response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Orchestrator API error:", response.status, errorText)
      throw new Error(`Orchestrator API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Orchestrator data:", data)
    return data
  } catch (error) {
    console.error("Error calling orchestrator:", error)
    // Fallback to emergency medicine
    return {
      selectedAgent: "dr-emergency-emergency-medicine",
      reasoning: "Fallback due to orchestrator error: " + (error instanceof Error ? error.message : String(error))
    }
  }
}

// Function to load agent configuration from markdown files
export async function loadAgentFromPrompt(agentName: string): Promise<Agent> {
  try {
    // Try to fetch the prompt file from the API
    const response = await fetch(`/api/agent-prompts/${agentName}`)
    
    if (!response.ok) {
      throw new Error(`Failed to load agent prompt: ${response.status}`)
    }

    const promptContent = await response.text()
    return parseAgentFromMarkdown(promptContent, agentName)
  } catch (error) {
    console.error(`Error loading agent ${agentName}:`, error)
    
    // Fallback agent configuration
    return {
      id: agentName,
      name: agentName.replace(/-/g, ' ').replace(/dr /i, 'Dr. '),
      description: "Medical specialist",
      systemPrompt: "You are a helpful medical AI assistant. Provide general health information and encourage users to consult healthcare professionals for personalized advice.",
      specialty: "General Medicine",
      iconColor: "#3B82F6"
    }
  }
}

// Parse agent configuration from markdown content
function parseAgentFromMarkdown(content: string, agentName: string): Agent {
  const lines = content.split('\n')
  
  let name = agentName.replace(/-/g, ' ').replace(/dr /i, 'Dr. ')
  let description = "Medical specialist"
  let specialty = "General Medicine" 
  let iconColor = "#3B82F6"
  let systemPrompt = ""
  
  let inSystemPrompt = false
  let systemPromptLines: string[] = []
  
  for (const line of lines) {
    // Extract name
    if (line.startsWith('**Name:**')) {
      name = line.replace('**Name:**', '').trim()
    }
    
    // Extract specialty
    if (line.startsWith('**Specialty:**')) {
      specialty = line.replace('**Specialty:**', '').trim()
    }
    
    // Extract description
    if (line.startsWith('**Description:**')) {
      description = line.replace('**Description:**', '').trim()
    }
    
    // Extract color
    if (line.startsWith('**Color:**')) {
      iconColor = line.replace('**Color:**', '').trim()
    }
    
    // Start collecting system prompt
    if (line.includes('## System Prompt')) {
      inSystemPrompt = true
      continue
    }
    
    // Stop collecting system prompt at next section
    if (inSystemPrompt && line.startsWith('##') && !line.includes('System Prompt')) {
      inSystemPrompt = false
    }
    
    // Collect system prompt lines
    if (inSystemPrompt && line.trim()) {
      systemPromptLines.push(line)
    }
  }
  
  systemPrompt = systemPromptLines.join('\n').trim()
  
  // Fallback system prompt if none found
  if (!systemPrompt) {
    systemPrompt = `You are ${name}, a ${specialty} specialist. Provide helpful medical information while encouraging users to consult healthcare professionals for personalized advice.`
  }
  
  return {
    id: agentName,
    name,
    description,
    systemPrompt,
    specialty,
    iconColor
  }
}

// Function to run orchestrated chat - selects agent then runs chat
export async function runOrchestratedChat(
  userMessage: string, 
  conversationHistory: ChatMessage[] = [],
  selectedModel?: string
) {
  try {
    // Step 1: Select the most appropriate agent
    const orchestratorResult = await selectAgent(userMessage, conversationHistory)
    const selectedAgentName = orchestratorResult.selectedAgent
    
    // Step 2: Load the selected agent configuration
    const agent = await loadAgentFromPrompt(selectedAgentName)
    
    // Step 3: Run chat with the selected agent
    const chatResponse = await fetch("/api/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_config: {
          agent_name: agent.name,
          description: agent.description,
          system_prompt: agent.systemPrompt,
          model_name: selectedModel || "claude-sonnet-4-20250514",
          role: "worker",
          max_loops: 1,
          max_tokens: 8192,
          temperature: 0.7,
          auto_generate_prompt: false,
        },
        task: userMessage,
        history: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    })

    if (!chatResponse.ok) {
      throw new Error(`Chat API error: ${chatResponse.status}`)
    }

    const chatData = await chatResponse.json()
    
    return {
      response: chatData,
      selectedAgent: agent,
      orchestratorReasoning: orchestratorResult.reasoning,
      confidence: orchestratorResult.confidence
    }
  } catch (error) {
    console.error("Error in orchestrated chat:", error)
    throw error
  }
}
