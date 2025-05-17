import { getSupabaseClient } from "@/lib/supabase/client"
import type { PatientProfile, PatientProfileFormData } from "@/types/patient"

export const patientService = {
  // Get patient profile by user ID
  async getPatientProfile(userId: string): Promise<PatientProfile | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("patient_profiles").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found
        return null
      }
      console.error("Error fetching patient profile:", error)
      throw error
    }

    return data as PatientProfile
  },

  // Create or update patient profile
  async savePatientProfile(userId: string, profileData: PatientProfileFormData): Promise<PatientProfile> {
    const supabase = getSupabaseClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("patient_profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    const now = new Date().toISOString()

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("patient_profiles")
        .update({
          ...profileData,
          updated_at: now,
        })
        .eq("id", existingProfile.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating patient profile:", error)
        throw error
      }

      return data as PatientProfile
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("patient_profiles")
        .insert({
          user_id: userId,
          ...profileData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating patient profile:", error)
        throw error
      }

      return data as PatientProfile
    }
  },
}
