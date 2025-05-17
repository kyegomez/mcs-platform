export interface MedicalProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  height_cm: number | null
  weight_kg: number | null
  blood_type: string | null
  allergies: string[]
  current_medications: string[]
  chronic_conditions: string[]
  surgical_history: Record<string, any>
  family_medical_history: Record<string, any>
  lifestyle_info: {
    smoking: string
    alcohol: string
    exercise: string
    diet: string
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
  }
  created_at: string
  updated_at: string
}

export type MedicalProfileFormData = Omit<MedicalProfile, "id" | "user_id" | "created_at" | "updated_at">
