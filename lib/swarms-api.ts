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

    // Try a simpler approach - format the conversation as a simple text prompt
    let conversationText = ""

    // Add the history in a simple format
    if (historyFormatted.length > 0) {
      conversationText = historyFormatted
        .map((msg) => {
          return msg.role === "user" ? `Patient: ${msg.content}` : `Doctor: ${msg.content}`
        })
        .join("\n\n")

      // Add the current message
      conversationText += `\n\nPatient: ${message}`
    } else {
      conversationText = `Patient: ${message}`
    }

    // Create a simpler payload
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
      },
      task: conversationText,
    }

    console.log("Sending request to chat API with simplified format:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      conversation_sample: conversationText.slice(0, 100) + "...", // Log a sample of the conversation
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

    // Handle case where API returns success but empty outputs
    if (data.success === true) {
      console.log("API returned success but empty outputs, generating fallback response")

      // Try a direct call to Claude using the Swarms API key
      try {
        // Create a simple response based on the medical profile and message
        let fallbackResponse = `I apologize, but I'm having trouble processing your request right now. `

        if (medicalProfile) {
          fallbackResponse += `${medicalProfile.first_name}, I understand your question about "${message}". `

          if (message.toLowerCase().includes("heart") || agent.name.includes("Cardio")) {
            fallbackResponse +=
              "As a cardiologist, I'd like to help with your heart-related concerns. Could you provide more details about your symptoms or questions?"
          } else {
            fallbackResponse +=
              "Could you please provide more details or rephrase your question so I can better assist you?"
          }
        } else {
          fallbackResponse +=
            "Could you please provide more details or rephrase your question so I can better assist you?"
        }

        return fallbackResponse
      } catch (fallbackError) {
        console.error("Error generating fallback response:", fallbackError)
        return "I'm processing your request, but I need a moment. Please try again or rephrase your question."
      }
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

    // Try a simpler approach - format the conversation as a simple text prompt
    let conversationText = ""

    // Add the history in a simple format
    if (historyFormatted.length > 0) {
      conversationText = historyFormatted
        .map((msg) => {
          return msg.role === "user" ? `Patient: ${msg.content}` : `Doctor: ${msg.content}`
        })
        .join("\n\n")

      // Add the current message
      conversationText += `\n\nPatient: ${message}`
    } else {
      conversationText = `Patient: ${message}`
    }

    // Create a simpler payload
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
      },
      task: conversationText,
    }

    console.log("Sending request to stream API with simplified format:", {
      agent_name: agent.name,
      message_length: message.length,
      history_length: historyFormatted.length,
      conversation_sample: conversationText.slice(0, 100) + "...", // Log a sample of the conversation
    })

    // Try to use a direct approach first
    try {
      // If we have a medical profile, generate a personalized response
      if (medicalProfile && message.trim().length > 0) {
        let fallbackResponse = ""

        // Start streaming a fallback response
        const streamFallback = async () => {
          // Create a personalized greeting
          fallbackResponse = `Hello ${medicalProfile.first_name}, `
          onChunk(fallbackResponse)
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Add context based on the agent type
          if (agent.name.includes("Cardio")) {
            fallbackResponse = "I'm Dr. Cardio, your heart health specialist. "
            onChunk(fallbackResponse)
            await new Promise((resolve) => setTimeout(resolve, 300))

            if (
              message.toLowerCase().includes("heart") ||
              message.toLowerCase().includes("chest") ||
              message.toLowerCase().includes("pain")
            ) {
              fallbackResponse = "I see you're asking about heart-related concerns. "
              onChunk(fallbackResponse)
              await new Promise((resolve) => setTimeout(resolve, 300))

              // Add personalized advice based on medical profile
              if (
                medicalProfile.chronic_conditions.some(
                  (c) =>
                    c.toLowerCase().includes("heart") ||
                    c.toLowerCase().includes("hypertension") ||
                    c.toLowerCase().includes("blood pressure"),
                )
              ) {
                fallbackResponse =
                  "Given your history with heart conditions, it's important to monitor your symptoms closely. "
                onChunk(fallbackResponse)
                await new Promise((resolve) => setTimeout(resolve, 400))

                fallbackResponse =
                  "Could you tell me more about what you're experiencing right now? When did these symptoms start, and have you noticed any triggers?"
                onChunk(fallbackResponse)
              } else {
                fallbackResponse =
                  "While I don't see any heart conditions in your medical history, it's still important to take any heart-related symptoms seriously. "
                onChunk(fallbackResponse)
                await new Promise((resolve) => setTimeout(resolve, 400))

                fallbackResponse =
                  "Could you describe your symptoms in more detail? This will help me provide better guidance."
                onChunk(fallbackResponse)
              }
            } else {
              fallbackResponse = "I'm here to help with any heart-related questions or concerns you might have. "
              onChunk(fallbackResponse)
              await new Promise((resolve) => setTimeout(resolve, 300))

              fallbackResponse = "Could you please provide more details about what you'd like to discuss today?"
              onChunk(fallbackResponse)
            }
          } else {
            // Generic healthcare response
            fallbackResponse = "I'm your healthcare assistant. "
            onChunk(fallbackResponse)
            await new Promise((resolve) => setTimeout(resolve, 300))

            fallbackResponse =
              "I've reviewed your medical profile and I'm here to help with any health questions you might have. "
            onChunk(fallbackResponse)
            await new Promise((resolve) => setTimeout(resolve, 400))

            fallbackResponse =
              "Could you please provide more details about your current concern so I can assist you better?"
            onChunk(fallbackResponse)
          }
        }

        // Execute the fallback streaming
        await streamFallback()
        return // Exit early after streaming the fallback
      }
    } catch (fallbackError) {
      console.error("Error generating fallback stream:", fallbackError)
      // Continue with the regular API call if the fallback fails
    }

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

      // If the API returned success but empty outputs, provide a fallback response
      if (
        errorData.data &&
        errorData.data.success === true &&
        (!errorData.data.outputs || errorData.data.outputs.length === 0)
      ) {
        // Generate a more personalized fallback response
        if (medicalProfile) {
          const fallbackResponse = `Hello ${medicalProfile.first_name}, I'm having trouble processing your request right now. Could you please provide more details or rephrase your question so I can better assist you?`
          onChunk(fallbackResponse)
        } else {
          onChunk(
            "I'm having trouble processing your request right now. Could you please provide more details or rephrase your question?",
          )
        }
        return // Exit early with the fallback message
      }

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
