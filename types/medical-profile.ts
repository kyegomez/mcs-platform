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
  chronic_conditions: string[]
  current_medications: string[]
  surgical_history: SurgicalHistory[]
  family_medical_history: FamilyMedicalHistory
  lifestyle_info: LifestyleInfo
  emergency_contact: EmergencyContact
  created_at: string
  updated_at: string
}

export interface SurgicalHistory {
  procedure: string
  date: string
  notes: string
}

export interface FamilyMedicalHistory {
  heart_disease: boolean
  diabetes: boolean
  cancer: boolean
  stroke: boolean
  hypertension: boolean
  mental_health_disorders: boolean
  other: string
}

export interface LifestyleInfo {
  smoking_status: "never" | "former" | "current"
  alcohol_consumption: "none" | "occasional" | "moderate" | "heavy"
  exercise_frequency: "none" | "occasional" | "regular" | "daily"
  diet: string
  occupation: string
  stress_level: "low" | "moderate" | "high"
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email: string
}

export type MedicalProfileFormData = Omit<MedicalProfile, "id" | "user_id" | "created_at" | "updated_at">
