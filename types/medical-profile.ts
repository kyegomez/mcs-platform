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
  surgical_history: {
    has_previous_surgeries: boolean
    surgeries?: Array<{
      procedure: string
      year: number
      notes?: string
    }>
  }
  family_medical_history: {
    heart_disease?: boolean
    diabetes?: boolean
    cancer?: boolean
    hypertension?: boolean
    stroke?: boolean
    mental_health_disorders?: boolean
    respiratory_disorders?: boolean
    other?: string
  }
  lifestyle_info: {
    smoking_status: "Never smoked" | "Former smoker" | "Current smoker" | "Prefer not to say"
    alcohol_consumption: "None" | "Occasional" | "Moderate" | "Heavy" | "Prefer not to say"
    exercise_frequency: "None" | "1-2 times per week" | "3-4 times per week" | "5+ times per week" | "Prefer not to say"
    diet?: string
    occupation?: string
    stress_level: "Low" | "Moderate" | "High" | "Prefer not to say"
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  created_at: string
  updated_at: string
}

export interface MedicalProfileFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  height_cm: string
  weight_kg: string
  blood_type: string
  allergies: string[]
  chronic_conditions: string[]
  current_medications: string[]
  surgical_history: {
    has_previous_surgeries: boolean
    surgeries: Array<{
      procedure: string
      year: string
      notes: string
    }>
  }
  family_medical_history: {
    heart_disease: boolean
    diabetes: boolean
    cancer: boolean
    hypertension: boolean
    stroke: boolean
    mental_health_disorders: boolean
    respiratory_disorders: boolean
    other: string
  }
  lifestyle_info: {
    smoking_status: "Never smoked" | "Former smoker" | "Current smoker" | "Prefer not to say"
    alcohol_consumption: "None" | "Occasional" | "Moderate" | "Heavy" | "Prefer not to say"
    exercise_frequency: "None" | "1-2 times per week" | "3-4 times per week" | "5+ times per week" | "Prefer not to say"
    diet: string
    occupation: string
    stress_level: "Low" | "Moderate" | "High" | "Prefer not to say"
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
    email: string
  }
}
