import { getSupabaseClient } from "@/lib/supabase/client"
import type { MedicalProfile } from "@/types/patient"
import type { ChatMessage } from "@/types/agent"

// Add this function to format the medical profile for the agent
export const formatMedicalProfileForAgent = (profile: MedicalProfile): string => {
  return `
PATIENT PROFILE:
Name: ${profile.first_name} ${profile.last_name}
Date of Birth: ${profile.date_of_birth}
Gender: ${profile.gender}
Height: ${profile.height_cm ? `${profile.height_cm} cm` : "Not provided"}
Weight: ${profile.weight_kg ? `${profile.weight_kg} kg` : "Not provided"}
Blood Type: ${profile.blood_type || "Not provided"}

Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(", ") : "None reported"}
Current Medications: ${profile.current_medications.length > 0 ? profile.current_medications.join(", ") : "None reported"}
Chronic Conditions: ${profile.chronic_conditions.length > 0 ? profile.chronic_conditions.join(", ") : "None reported"}

Surgical History: ${
    JSON.stringify(profile.surgical_history) !== "{}"
      ? typeof profile.surgical_history === "object" && profile.surgical_history.description
        ? profile.surgical_history.description
        : JSON.stringify(profile.surgical_history)
      : "None reported"
  }

Family Medical History: ${
    JSON.stringify(profile.family_medical_history) !== "{}"
      ? typeof profile.family_medical_history === "object" && profile.family_medical_history.description
        ? profile.family_medical_history.description
        : JSON.stringify(profile.family_medical_history)
      : "None reported"
  }

Lifestyle:
- Smoking: ${profile.lifestyle_info.smoking}
- Alcohol: ${profile.lifestyle_info.alcohol}
- Exercise: ${profile.lifestyle_info.exercise}
- Diet: ${profile.lifestyle_info.diet}

Emergency Contact:
- Name: ${profile.emergency_contact.name || "Not provided"}
- Relationship: ${profile.emergency_contact.relationship || "Not provided"}
- Phone: ${profile.emergency_contact.phone || "Not provided"}
`
}

// Client-side chat service
export const chatService = {
  // Get or create a chat for a specific agent
  async getOrCreateChat(userId: string, agentId: string) {
    const supabase = getSupabaseClient()

    // Check if a chat already exists for this user and agent
    const { data: existingChats, error: fetchError } = await supabase
      .from("chats")
      .select("id")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error("Error fetching chat:", fetchError)
      throw fetchError
    }

    // If a chat exists, return it
    if (existingChats && existingChats.length > 0) {
      return existingChats[0].id
    }

    // Otherwise, create a new chat
    const { data: newChat, error: createError } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        agent_id: agentId,
      })
      .select("id")
      .single()

    if (createError) {
      console.error("Error creating chat:", createError)
      throw createError
    }

    return newChat.id
  },

  // Get chat messages
  async getChatMessages(chatId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Error fetching chat messages:", error)
      throw error
    }

    return data.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.timestamp),
      chatId: message.chat_id,
    })) as ChatMessage[]
  },

  // Add a message to a chat
  async addMessage(chatId: string, message: Omit<ChatMessage, "id" | "chatId">) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error adding message:", error)
      throw error
    }

    // Update the chat's updated_at timestamp
    await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)

    return {
      ...message,
      id: data.id,
      chatId,
    } as ChatMessage
  },

  // Get all chats for a user
  async getUserChats(userId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("chats")
      .select(`
        id,
        agent_id,
        created_at,
        updated_at,
        chat_messages!chat_messages_chat_id_fkey (
          id,
          role,
          content,
          timestamp
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching user chats:", error)
      throw error
    }

    return data
  },

  // Delete a chat and all its messages
  async deleteChat(chatId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("chats").delete().eq("id", chatId)

    if (error) {
      console.error("Error deleting chat:", error)
      throw error
    }

    return true
  },
}
