import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { MedicalProfile, MedicalProfileFormData } from "@/types/medical-profile"

class MedicalProfileService {
  private supabase = createClientComponentClient()

  async getUserMedicalProfile(userId: string): Promise<MedicalProfile | null> {
    try {
      const { data, error } = await this.supabase.from("medical_profiles").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching medical profile:", error)
        return null
      }

      return data as MedicalProfile
    } catch (error) {
      console.error("Error in getUserMedicalProfile:", error)
      return null
    }
  }

  async createMedicalProfile(userId: string, profileData: MedicalProfileFormData): Promise<MedicalProfile | null> {
    try {
      // Convert string values to numbers where needed
      const processedData = {
        ...profileData,
        user_id: userId,
        height_cm: profileData.height_cm ? Number.parseFloat(profileData.height_cm) : null,
        weight_kg: profileData.weight_kg ? Number.parseFloat(profileData.weight_kg) : null,
        surgical_history: {
          ...profileData.surgical_history,
          surgeries: profileData.surgical_history.surgeries.map((surgery) => ({
            ...surgery,
            year: Number.parseInt(surgery.year, 10),
          })),
        },
      }

      const { data, error } = await this.supabase.from("medical_profiles").insert([processedData]).select().single()

      if (error) {
        console.error("Error creating medical profile:", error)
        return null
      }

      return data as MedicalProfile
    } catch (error) {
      console.error("Error in createMedicalProfile:", error)
      return null
    }
  }

  async updateMedicalProfile(
    userId: string,
    profileData: Partial<MedicalProfileFormData>,
  ): Promise<MedicalProfile | null> {
    try {
      // Process numeric fields
      const processedData: any = { ...profileData }

      if (profileData.height_cm !== undefined) {
        processedData.height_cm = profileData.height_cm ? Number.parseFloat(profileData.height_cm) : null
      }

      if (profileData.weight_kg !== undefined) {
        processedData.weight_kg = profileData.weight_kg ? Number.parseFloat(profileData.weight_kg) : null
      }

      if (profileData.surgical_history?.surgeries) {
        processedData.surgical_history = {
          ...profileData.surgical_history,
          surgeries: profileData.surgical_history.surgeries.map((surgery) => ({
            ...surgery,
            year: surgery.year ? Number.parseInt(surgery.year, 10) : null,
          })),
        }
      }

      const { data, error } = await this.supabase
        .from("medical_profiles")
        .update(processedData)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating medical profile:", error)
        return null
      }

      return data as MedicalProfile
    } catch (error) {
      console.error("Error in updateMedicalProfile:", error)
      return null
    }
  }

  async deleteMedicalProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("medical_profiles").delete().eq("user_id", userId)

      if (error) {
        console.error("Error deleting medical profile:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deleteMedicalProfile:", error)
      return false
    }
  }

  async hasMedicalProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from("medical_profiles").select("id").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        console.error("Error checking medical profile:", error)
      }

      return !!data
    } catch (error) {
      console.error("Error in hasMedicalProfile:", error)
      return false
    }
  }
}

export const medicalProfileService = new MedicalProfileService()
