import { getSupabaseClient } from "@/lib/supabase/client"
import type { MedicalProfile, MedicalProfileFormData } from "@/types/medical-profile"

export const medicalProfileService = {
  // Get a user's medical profile
  async getUserMedicalProfile(userId: string): Promise<MedicalProfile | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("medical_profiles").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found
        return null
      }
      console.error("Error fetching medical profile:", error)
      throw error
    }

    return data as MedicalProfile
  },

  // Create a new medical profile
  async createMedicalProfile(userId: string, profileData: MedicalProfileFormData): Promise<MedicalProfile> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("medical_profiles")
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating medical profile:", error)
      throw error
    }

    return data as MedicalProfile
  },

  // Update an existing medical profile
  async updateMedicalProfile(userId: string, profileData: Partial<MedicalProfileFormData>): Promise<MedicalProfile> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("medical_profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating medical profile:", error)
      throw error
    }

    return data as MedicalProfile
  },

  // Delete a medical profile
  async deleteMedicalProfile(userId: string): Promise<void> {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("medical_profiles").delete().eq("user_id", userId)

    if (error) {
      console.error("Error deleting medical profile:", error)
      throw error
    }
  },
}
