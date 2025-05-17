import type { Agent, ChatMessage } from "@/types/agent"
import type { MedicalProfile } from "@/types/medical-profile"
import { medicalProfileService } from "@/lib/services/medical-profile-service"

// Update the base URL
const SWARMS_API_URL = "https://swarms-api-285321057562.us-east1.run.app"

export async function chatWithAgent(agent: Agent, message: string, history: ChatMessage[], userId?: string) {
  try {
    // Format history for the Swarms API
    // Only include messages that have content (not empty strings)
    const historyFormatted = history
      .filter((msg) => msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    // Get user's medical profile if userId is provided
    let medicalProfile: MedicalProfile | null = null
    if (userId) {
      try {
        medicalProfile = await medicalProfileService.getUserMedicalProfile(userId)
      } catch (error) {
        console.error("Error fetching medical profile:", error)
      }
    }

    // Create a system prompt that includes the medical profile if available
    let enhancedSystemPrompt = agent.systemPrompt
    if (medicalProfile) {
      enhancedSystemPrompt = `
${agent.systemPrompt}

PATIENT MEDICAL PROFILE:
Name: ${medicalProfile.first_name} ${medicalProfile.last_name}
Date of Birth: ${medicalProfile.date_of_birth}
Gender: ${medicalProfile.gender}
Height: ${medicalProfile.height_cm ? `${medicalProfile.height_cm} cm` : "Not provided"}
Weight: ${medicalProfile.weight_kg ? `${medicalProfile.weight_kg} kg` : "Not provided"}
Blood Type: ${medicalProfile.blood_type || "Not provided"}

Chronic Conditions: ${medicalProfile.chronic_conditions.length > 0 ? medicalProfile.chronic_conditions.join(", ") : "None reported"}
Allergies: ${medicalProfile.allergies.length > 0 ? medicalProfile.allergies.join(", ") : "None reported"}
Current Medications: ${medicalProfile.current_medications.length > 0 ? medicalProfile.current_medications.join(", ") : "None reported"}

Family History: ${
        Object.entries(medicalProfile.family_medical_history)
          .filter(([key, value]) => value === true && key !== "other")
          .map(([key]) => key.replace(/_/g, " "))
          .join(", ") || "None reported"
      }
${medicalProfile.family_medical_history.other ? `Additional family history: ${medicalProfile.family_medical_history.other}` : ""}

Lifestyle: 
- Smoking: ${medicalProfile.lifestyle_info.smoking_status}
- Alcohol: ${medicalProfile.lifestyle_info.alcohol_consumption}
- Exercise: ${medicalProfile.lifestyle_info.exercise_frequency}
- Stress Level: ${medicalProfile.lifestyle_info.stress_level}
${medicalProfile.lifestyle_info.diet ? `- Diet: ${medicalProfile.lifestyle_info.diet}` : ""}
${medicalProfile.lifestyle_info.occupation ? `- Occupation: ${medicalProfile.lifestyle_info.occupation}` : ""}

Please use this medical profile information to provide personalized advice and recommendations. Address the patient by name and reference relevant aspects of their medical history when appropriate.
`
    }

    // Format the chat history as a string to include in the task
    let formattedHistoryText = ""
    if (historyFormatted.length > 0) {
      formattedHistoryText = "\n\nChat History:\n"
      historyFormatted.forEach((msg) => {
        formattedHistoryText += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`
      })
    }

    // Combine the user's message with the chat history
    const taskWithHistory = `${formattedHistoryText}\n\nUser: ${message}`

    console.log("Sending chat with history:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      history_sample: historyFormatted.slice(-2), // Log last 2 messages for debugging
      has_medical_profile: !!medicalProfile,
    })

    const payload = {
      agent_config: {
        agent_name: agent.name,
        description: agent.description,
        system_prompt: enhancedSystemPrompt,
        model_name: "claude-3-5-sonnet-20240620",
        role: "worker",
        max_loops: 1,
        max_tokens: 16000,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: taskWithHistory, // Include both the message and history in the task
    }

    console.log("Sending request to chat API:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
    })

    const response = await fetch("/api/agent/chat", {
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

    // If the API processed the output for us, use that
    if (data.processedOutput) {
      return data.processedOutput
    }

    // Otherwise, try to extract the content from the last output
    if (data.outputs && Array.isArray(data.outputs) && data.outputs.length > 0) {
      const lastOutput = data.outputs[data.outputs.length - 1]
      return lastOutput?.content || "No content found in response"
    }

    return "Received response but couldn't extract content"
  } catch (error) {
    console.error("Error chatting with agent:", error)
    throw error
  }
}

export async function streamChatWithAgent(
  agent: Agent,
  message: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void,
  userId?: string,
) {
  try {
    // Format history for the Swarms API
    // Only include messages that have content (not empty strings)
    const historyFormatted = history
      .filter((msg) => msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    // Get user's medical profile if userId is provided
    let medicalProfile: MedicalProfile | null = null
    if (userId) {
      try {
        medicalProfile = await medicalProfileService.getUserMedicalProfile(userId)
      } catch (error) {
        console.error("Error fetching medical profile:", error)
      }
    }

    // Create a system prompt that includes the medical profile if available
    let enhancedSystemPrompt = agent.systemPrompt
    if (medicalProfile) {
      enhancedSystemPrompt = `
${agent.systemPrompt}

PATIENT MEDICAL PROFILE:
Name: ${medicalProfile.first_name} ${medicalProfile.last_name}
Date of Birth: ${medicalProfile.date_of_birth}
Gender: ${medicalProfile.gender}
Height: ${medicalProfile.height_cm ? `${medicalProfile.height_cm} cm` : "Not provided"}
Weight: ${medicalProfile.weight_kg ? `${medicalProfile.weight_kg} kg` : "Not provided"}
Blood Type: ${medicalProfile.blood_type || "Not provided"}

Chronic Conditions: ${medicalProfile.chronic_conditions.length > 0 ? medicalProfile.chronic_conditions.join(", ") : "None reported"}
Allergies: ${medicalProfile.allergies.length > 0 ? medicalProfile.allergies.join(", ") : "None reported"}
Current Medications: ${medicalProfile.current_medications.length > 0 ? medicalProfile.current_medications.join(", ") : "None reported"}

Family History: ${
        Object.entries(medicalProfile.family_medical_history)
          .filter(([key, value]) => value === true && key !== "other")
          .map(([key]) => key.replace(/_/g, " "))
          .join(", ") || "None reported"
      }
${medicalProfile.family_medical_history.other ? `Additional family history: ${medicalProfile.family_medical_history.other}` : ""}

Lifestyle: 
- Smoking: ${medicalProfile.lifestyle_info.smoking_status}
- Alcohol: ${medicalProfile.lifestyle_info.alcohol_consumption}
- Exercise: ${medicalProfile.lifestyle_info.exercise_frequency}
- Stress Level: ${medicalProfile.lifestyle_info.stress_level}
${medicalProfile.lifestyle_info.diet ? `- Diet: ${medicalProfile.lifestyle_info.diet}` : ""}
${medicalProfile.lifestyle_info.occupation ? `- Occupation: ${medicalProfile.lifestyle_info.occupation}` : ""}

Please use this medical profile information to provide personalized advice and recommendations. Address the patient by name and reference relevant aspects of their medical history when appropriate.
`
    }

    // Format the chat history as a string to include in the task
    let formattedHistoryText = ""
    if (historyFormatted.length > 0) {
      formattedHistoryText = "\n\nChat History:\n"
      historyFormatted.forEach((msg) => {
        formattedHistoryText += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`
      })
    }

    // Combine the user's message with the chat history
    const taskWithHistory = `${formattedHistoryText}\n\nUser: ${message}`

    console.log("Streaming chat with history:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      history_sample: historyFormatted.slice(-2), // Log last 2 messages for debugging
      has_medical_profile: !!medicalProfile,
    })

    const payload = {
      agent_config: {
        agent_name: agent.name,
        description: agent.description,
        system_prompt: enhancedSystemPrompt,
        model_name: "claude-3-5-sonnet-20240620",
        role: "worker",
        max_loops: 1,
        max_tokens: 16000,
        temperature: 0.7,
        auto_generate_prompt: false,
      },
      task: taskWithHistory, // Include both the message and history in the task
    }

    console.log("Sending request to stream API:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
    })

    const response = await fetch("/api/agent/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(`API error: ${response.status} - ${errorJson.error || "Unknown error"}`)
      } catch (e) {
        throw new Error(`API error: ${response.status} - ${errorText || "Unknown error"}`)
      }
    }

    // Check if the response is JSON (error) instead of a stream
    const contentType = response.headers.get("Content-Type") || ""
    if (contentType.includes("application/json")) {
      const errorData = await response.json()
      throw new Error(`API returned JSON instead of stream: ${errorData.error || "Unknown error"}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("Response body is null")

    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        onChunk(chunk)
      }
    }
  } catch (error) {
    console.error("Error streaming chat with agent:", error)
    throw error
  }
}
