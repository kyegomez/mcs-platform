"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MedicalProfileFormData } from "@/types/medical-profile"

const STEPS = [
  "Personal Information",
  "Physical Characteristics",
  "Medical History",
  "Medications & Allergies",
  "Family History",
  "Lifestyle",
  "Emergency Contact",
  "Review & Submit",
]

export function MedicalProfileForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<MedicalProfileFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: null,
    weight_kg: null,
    blood_type: null,
    allergies: [],
    chronic_conditions: [],
    current_medications: [],
    surgical_history: [],
    family_medical_history: {
      heart_disease: false,
      diabetes: false,
      cancer: false,
      stroke: false,
      hypertension: false,
      mental_health_disorders: false,
      other: "",
    },
    lifestyle_info: {
      smoking_status: "never",
      alcohol_consumption: "none",
      exercise_frequency: "none",
      diet: "",
      occupation: "",
      stress_level: "low",
    },
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  })

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested object changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  // Handle array field changes
  const handleArrayChange = (field: string, value: string) => {
    if (!value.trim()) return

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }))
  }

  // Remove item from array
  const handleRemoveArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  // Add surgical history item
  const handleAddSurgery = (surgery: { procedure: string; date: string; notes: string }) => {
    if (!surgery.procedure.trim() || !surgery.date) return

    setFormData((prev) => ({
      ...prev,
      surgical_history: [...prev.surgical_history, surgery],
    }))
  }

  // Remove surgical history item
  const handleRemoveSurgery = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      surgical_history: prev.surgical_history.filter((_, i) => i !== index),
    }))
  }

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Submit the form
  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      await medicalProfileService.createMedicalProfile(user.id, formData)
      router.push("/dashboard?onboarded=true")
    } catch (error) {
      console.error("Error submitting medical profile:", error)
      setError("Failed to save your medical profile. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  required
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  required
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                required
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-black border-mcs-gray">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 1: // Physical Characteristics
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm || ""}
                  onChange={(e) => handleChange("height_cm", Number.parseFloat(e.target.value) || null)}
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={formData.weight_kg || ""}
                  onChange={(e) => handleChange("weight_kg", Number.parseFloat(e.target.value) || null)}
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_type">Blood Type</Label>
              <Select value={formData.blood_type || ""} onValueChange={(value) => handleChange("blood_type", value)}>
                <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-mcs-gray">
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2: // Medical History
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Chronic Conditions</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="chronic_condition"
                    placeholder="Add a chronic condition"
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleArrayChange("chronic_conditions", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById("chronic_condition") as HTMLInputElement
                      handleArrayChange("chronic_conditions", input.value)
                      input.value = ""
                    }}
                    className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.chronic_conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-1 bg-mcs-gray/30 px-3 py-1 rounded-full">
                      <span className="text-sm">{condition}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem("chronic_conditions", index)}
                        className="text-mcs-gray-light hover:text-white"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Surgical History</Label>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="surgery_procedure"
                    placeholder="Procedure"
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                  <Input
                    id="surgery_date"
                    type="date"
                    placeholder="Date"
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>
                <Textarea
                  id="surgery_notes"
                  placeholder="Notes"
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const procedure = (document.getElementById("surgery_procedure") as HTMLInputElement).value
                    const date = (document.getElementById("surgery_date") as HTMLInputElement).value
                    const notes = (document.getElementById("surgery_notes") as HTMLTextAreaElement).value

                    handleAddSurgery({ procedure, date, notes })
                    ;(document.getElementById("surgery_procedure") as HTMLInputElement).value = ""
                    ;(document.getElementById("surgery_date") as HTMLInputElement).value = ""
                    ;(document.getElementById("surgery_notes") as HTMLTextAreaElement).value = ""
                  }}
                  className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
                >
                  Add Surgery
                </Button>

                {formData.surgical_history.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Added Surgeries:</Label>
                    <div className="space-y-2">
                      {formData.surgical_history.map((surgery, index) => (
                        <div key={index} className="bg-mcs-gray/30 p-3 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{surgery.procedure}</p>
                              <p className="text-sm text-mcs-gray-light">Date: {surgery.date}</p>
                              {surgery.notes && <p className="text-sm mt-1">{surgery.notes}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSurgery(index)}
                              className="text-mcs-gray-light hover:text-white"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3: // Medications & Allergies
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="medication"
                    placeholder="Add a medication"
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleArrayChange("current_medications", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById("medication") as HTMLInputElement
                      handleArrayChange("current_medications", input.value)
                      input.value = ""
                    }}
                    className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.current_medications.map((medication, index) => (
                    <div key={index} className="flex items-center gap-1 bg-mcs-gray/30 px-3 py-1 rounded-full">
                      <span className="text-sm">{medication}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem("current_medications", index)}
                        className="text-mcs-gray-light hover:text-white"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allergies</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="allergy"
                    placeholder="Add an allergy"
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleArrayChange("allergies", e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById("allergy") as HTMLInputElement
                      handleArrayChange("allergies", input.value)
                      input.value = ""
                    }}
                    className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center gap-1 bg-mcs-gray/30 px-3 py-1 rounded-full">
                      <span className="text-sm">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem("allergies", index)}
                        className="text-mcs-gray-light hover:text-white"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Family History
        return (
          <div className="space-y-4">
            <p className="text-mcs-gray-light">Select any conditions that run in your family:</p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="heart_disease"
                  checked={formData.family_medical_history.heart_disease}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "heart_disease", checked === true)
                  }
                />
                <Label htmlFor="heart_disease">Heart Disease</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="diabetes"
                  checked={formData.family_medical_history.diabetes}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "diabetes", checked === true)
                  }
                />
                <Label htmlFor="diabetes">Diabetes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancer"
                  checked={formData.family_medical_history.cancer}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "cancer", checked === true)
                  }
                />
                <Label htmlFor="cancer">Cancer</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stroke"
                  checked={formData.family_medical_history.stroke}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "stroke", checked === true)
                  }
                />
                <Label htmlFor="stroke">Stroke</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hypertension"
                  checked={formData.family_medical_history.hypertension}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "hypertension", checked === true)
                  }
                />
                <Label htmlFor="hypertension">Hypertension</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mental_health_disorders"
                  checked={formData.family_medical_history.mental_health_disorders}
                  onCheckedChange={(checked) =>
                    handleNestedChange("family_medical_history", "mental_health_disorders", checked === true)
                  }
                />
                <Label htmlFor="mental_health_disorders">Mental Health Disorders</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_family_history">Other Family Medical History</Label>
              <Textarea
                id="other_family_history"
                value={formData.family_medical_history.other}
                onChange={(e) => handleNestedChange("family_medical_history", "other", e.target.value)}
                placeholder="Please describe any other relevant family medical history"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>
          </div>
        )

      case 5: // Lifestyle
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smoking_status">Smoking Status</Label>
              <RadioGroup
                value={formData.lifestyle_info.smoking_status}
                onValueChange={(value) => handleNestedChange("lifestyle_info", "smoking_status", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="smoking_never" />
                  <Label htmlFor="smoking_never">Never Smoked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="former" id="smoking_former" />
                  <Label htmlFor="smoking_former">Former Smoker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="smoking_current" />
                  <Label htmlFor="smoking_current">Current Smoker</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcohol_consumption">Alcohol Consumption</Label>
              <RadioGroup
                value={formData.lifestyle_info.alcohol_consumption}
                onValueChange={(value) => handleNestedChange("lifestyle_info", "alcohol_consumption", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="alcohol_none" />
                  <Label htmlFor="alcohol_none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasional" id="alcohol_occasional" />
                  <Label htmlFor="alcohol_occasional">Occasional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="alcohol_moderate" />
                  <Label htmlFor="alcohol_moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="heavy" id="alcohol_heavy" />
                  <Label htmlFor="alcohol_heavy">Heavy</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise_frequency">Exercise Frequency</Label>
              <RadioGroup
                value={formData.lifestyle_info.exercise_frequency}
                onValueChange={(value) => handleNestedChange("lifestyle_info", "exercise_frequency", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="exercise_none" />
                  <Label htmlFor="exercise_none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasional" id="exercise_occasional" />
                  <Label htmlFor="exercise_occasional">Occasional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="exercise_regular" />
                  <Label htmlFor="exercise_regular">Regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="exercise_daily" />
                  <Label htmlFor="exercise_daily">Daily</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet">Diet</Label>
              <Textarea
                id="diet"
                value={formData.lifestyle_info.diet}
                onChange={(e) => handleNestedChange("lifestyle_info", "diet", e.target.value)}
                placeholder="Describe your typical diet"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.lifestyle_info.occupation}
                onChange={(e) => handleNestedChange("lifestyle_info", "occupation", e.target.value)}
                placeholder="Your occupation"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stress_level">Stress Level</Label>
              <RadioGroup
                value={formData.lifestyle_info.stress_level}
                onValueChange={(value) => handleNestedChange("lifestyle_info", "stress_level", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="stress_low" />
                  <Label htmlFor="stress_low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="stress_moderate" />
                  <Label htmlFor="stress_moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="stress_high" />
                  <Label htmlFor="stress_high">High</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 6: // Emergency Contact
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Emergency Contact Name</Label>
              <Input
                id="emergency_name"
                value={formData.emergency_contact.name}
                onChange={(e) => handleNestedChange("emergency_contact", "name", e.target.value)}
                placeholder="Full name"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_relationship">Relationship</Label>
              <Input
                id="emergency_relationship"
                value={formData.emergency_contact.relationship}
                onChange={(e) => handleNestedChange("emergency_contact", "relationship", e.target.value)}
                placeholder="e.g., Spouse, Parent, Friend"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Phone Number</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_contact.phone}
                onChange={(e) => handleNestedChange("emergency_contact", "phone", e.target.value)}
                placeholder="Phone number"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_email">Email</Label>
              <Input
                id="emergency_email"
                type="email"
                value={formData.emergency_contact.email}
                onChange={(e) => handleNestedChange("emergency_contact", "email", e.target.value)}
                placeholder="Email address"
                className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
              />
            </div>
          </div>
        )

      case 7: // Review & Submit
        return (
          <div className="space-y-6">
            <p className="text-mcs-gray-light">
              Please review your information before submitting. You can go back to any section to make changes.
            </p>

            <div className="space-y-4">
              <div className="bg-mcs-gray/30 p-4 rounded-md">
                <h3 className="font-medium mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-mcs-gray-light">Name:</p>
                    <p>
                      {formData.first_name} {formData.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-mcs-gray-light">Date of Birth:</p>
                    <p>{formData.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-mcs-gray-light">Gender:</p>
                    <p>{formData.gender}</p>
                  </div>
                </div>
              </div>

              <div className="bg-mcs-gray/30 p-4 rounded-md">
                <h3 className="font-medium mb-2">Physical Characteristics</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-mcs-gray-light">Height:</p>
                    <p>{formData.height_cm ? `${formData.height_cm} cm` : "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-mcs-gray-light">Weight:</p>
                    <p>{formData.weight_kg ? `${formData.weight_kg} kg` : "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-mcs-gray-light">Blood Type:</p>
                    <p>{formData.blood_type || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-mcs-gray/30 p-4 rounded-md">
                <h3 className="font-medium mb-2">Medical Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-mcs-gray-light">Chronic Conditions:</p>
                    {formData.chronic_conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.chronic_conditions.map((condition, i) => (
                          <span key={i} className="bg-mcs-gray/50 px-2 py-0.5 rounded-full text-xs">
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None provided</p>
                    )}
                  </div>

                  <div>
                    <p className="text-mcs-gray-light">Allergies:</p>
                    {formData.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.allergies.map((allergy, i) => (
                          <span key={i} className="bg-mcs-gray/50 px-2 py-0.5 rounded-full text-xs">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None provided</p>
                    )}
                  </div>

                  <div>
                    <p className="text-mcs-gray-light">Medications:</p>
                    {formData.current_medications.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.current_medications.map((medication, i) => (
                          <span key={i} className="bg-mcs-gray/50 px-2 py-0.5 rounded-full text-xs">
                            {medication}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>None provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-mcs-gray/30 p-4 rounded-md">
                <h3 className="font-medium mb-2">Emergency Contact</h3>
                <div className="text-sm">
                  {formData.emergency_contact.name ? (
                    <>
                      <p>{formData.emergency_contact.name}</p>
                      <p className="text-mcs-gray-light">{formData.emergency_contact.relationship}</p>
                      <p>{formData.emergency_contact.phone}</p>
                      <p>{formData.emergency_contact.email}</p>
                    </>
                  ) : (
                    <p>No emergency contact provided</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-mcs-blue/10 border border-mcs-blue/30 p-4 rounded-md">
              <p className="text-sm">
                By submitting this form, you confirm that the information provided is accurate to the best of your
                knowledge. This information will be used by our healthcare agents to provide you with better care.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Check if required fields are filled for the current step
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return formData.first_name && formData.last_name && formData.date_of_birth && formData.gender
      default:
        return true
    }
  }

  return (
    <Card className="bg-black border-mcs-gray">
      <CardHeader>
        <CardTitle>Medical Profile</CardTitle>
        <CardDescription>
          Please provide your medical information to help our healthcare agents better assist you.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-mcs-gray-light">{STEPS[currentStep]}</span>
          </div>
          <div className="w-full bg-mcs-gray/30 h-2 rounded-full overflow-hidden">
            <div
              className="bg-mcs-blue h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <form>{renderStep()}</form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="border-mcs-gray text-mcs-gray-light hover:text-white hover:bg-mcs-gray"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
