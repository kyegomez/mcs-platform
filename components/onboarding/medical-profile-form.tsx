"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import type { MedicalProfileFormData } from "@/types/medical-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

const initialFormData: MedicalProfileFormData = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  blood_type: "",
  allergies: [],
  chronic_conditions: [],
  current_medications: [],
  surgical_history: {
    has_previous_surgeries: false,
    surgeries: [{ procedure: "", year: "", notes: "" }],
  },
  family_medical_history: {
    heart_disease: false,
    diabetes: false,
    cancer: false,
    hypertension: false,
    stroke: false,
    mental_health_disorders: false,
    respiratory_disorders: false,
    other: "",
  },
  lifestyle_info: {
    smoking_status: "Prefer not to say",
    alcohol_consumption: "Prefer not to say",
    exercise_frequency: "Prefer not to say",
    diet: "",
    occupation: "",
    stress_level: "Prefer not to say",
  },
  emergency_contact: {
    name: "",
    relationship: "",
    phone: "",
    email: "",
  },
}

export function MedicalProfileForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<MedicalProfileFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [newMedication, setNewMedication] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    }
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }))
      setNewAllergy("")
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }))
  }

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setFormData((prev) => ({
        ...prev,
        chronic_conditions: [...prev.chronic_conditions, newCondition.trim()],
      }))
      setNewCondition("")
    }
  }

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.filter((_, i) => i !== index),
    }))
  }

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setFormData((prev) => ({
        ...prev,
        current_medications: [...prev.current_medications, newMedication.trim()],
      }))
      setNewMedication("")
    }
  }

  const handleRemoveMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      current_medications: prev.current_medications.filter((_, i) => i !== index),
    }))
  }

  const handleAddSurgery = () => {
    setFormData((prev) => ({
      ...prev,
      surgical_history: {
        ...prev.surgical_history,
        surgeries: [...prev.surgical_history.surgeries, { procedure: "", year: "", notes: "" }],
      },
    }))
  }

  const handleRemoveSurgery = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      surgical_history: {
        ...prev.surgical_history,
        surgeries: prev.surgical_history.surgeries.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSurgeryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      surgical_history: {
        ...prev.surgical_history,
        surgeries: prev.surgical_history.surgeries.map((surgery, i) =>
          i === index ? { ...surgery, [field]: value } : surgery,
        ),
      },
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to submit your medical profile.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await medicalProfileService.createMedicalProfile(user.id, formData)
      if (result) {
        router.push("/dashboard?profile=created")
      } else {
        setError("Failed to create medical profile. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting medical profile:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 1: // Physical Characteristics
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  placeholder="e.g., 175"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  placeholder="e.g., 70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_type">Blood Type</Label>
              <Select value={formData.blood_type} onValueChange={(value) => handleSelectChange("blood_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type (if known)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2: // Medical History
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_previous_surgeries"
                  checked={formData.surgical_history.has_previous_surgeries}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("surgical_history.has_previous_surgeries", checked as boolean)
                  }
                />
                <Label htmlFor="has_previous_surgeries">Have you had any previous surgeries?</Label>
              </div>

              {formData.surgical_history.has_previous_surgeries && (
                <div className="space-y-4 pl-6">
                  {formData.surgical_history.surgeries.map((surgery, index) => (
                    <div key={index} className="space-y-4 rounded-md border p-4">
                      <div className="space-y-2">
                        <Label htmlFor={`surgery-procedure-${index}`}>Procedure</Label>
                        <Input
                          id={`surgery-procedure-${index}`}
                          value={surgery.procedure}
                          onChange={(e) => handleSurgeryChange(index, "procedure", e.target.value)}
                          placeholder="e.g., Appendectomy"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`surgery-year-${index}`}>Year</Label>
                        <Input
                          id={`surgery-year-${index}`}
                          value={surgery.year}
                          onChange={(e) => handleSurgeryChange(index, "year", e.target.value)}
                          placeholder="e.g., 2018"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`surgery-notes-${index}`}>Notes (optional)</Label>
                        <Textarea
                          id={`surgery-notes-${index}`}
                          value={surgery.notes}
                          onChange={(e) => handleSurgeryChange(index, "notes", e.target.value)}
                          placeholder="Any additional information"
                        />
                      </div>
                      {formData.surgical_history.surgeries.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveSurgery(index)}
                        >
                          Remove Surgery
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSurgery}>
                    Add Another Surgery
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Chronic Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {formData.chronic_conditions.map((condition, index) => (
                  <div key={index} className="flex items-center rounded-full bg-mcs-gray px-3 py-1 text-sm text-white">
                    <span>{condition}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-5 w-5 p-0 text-white hover:bg-mcs-gray-light hover:text-white"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add a chronic condition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCondition()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCondition}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )

      case 3: // Medications & Allergies
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Current Medications</Label>
              <div className="flex flex-wrap gap-2">
                {formData.current_medications.map((medication, index) => (
                  <div key={index} className="flex items-center rounded-full bg-mcs-gray px-3 py-1 text-sm text-white">
                    <span>{medication}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-5 w-5 p-0 text-white hover:bg-mcs-gray-light hover:text-white"
                      onClick={() => handleRemoveMedication(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add a medication"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddMedication()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddMedication}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Allergies</Label>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center rounded-full bg-mcs-gray px-3 py-1 text-sm text-white">
                    <span>{allergy}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-5 w-5 p-0 text-white hover:bg-mcs-gray-light hover:text-white"
                      onClick={() => handleRemoveAllergy(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add an allergy"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddAllergy()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddAllergy}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )

      case 4: // Family History
        return (
          <div className="space-y-4">
            <Label>Family Medical History (Check all that apply)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="heart_disease"
                  checked={formData.family_medical_history.heart_disease}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.heart_disease", checked as boolean)
                  }
                />
                <Label htmlFor="heart_disease">Heart Disease</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="diabetes"
                  checked={formData.family_medical_history.diabetes}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.diabetes", checked as boolean)
                  }
                />
                <Label htmlFor="diabetes">Diabetes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancer"
                  checked={formData.family_medical_history.cancer}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.cancer", checked as boolean)
                  }
                />
                <Label htmlFor="cancer">Cancer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hypertension"
                  checked={formData.family_medical_history.hypertension}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.hypertension", checked as boolean)
                  }
                />
                <Label htmlFor="hypertension">Hypertension</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stroke"
                  checked={formData.family_medical_history.stroke}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.stroke", checked as boolean)
                  }
                />
                <Label htmlFor="stroke">Stroke</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mental_health_disorders"
                  checked={formData.family_medical_history.mental_health_disorders}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.mental_health_disorders", checked as boolean)
                  }
                />
                <Label htmlFor="mental_health_disorders">Mental Health Disorders</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="respiratory_disorders"
                  checked={formData.family_medical_history.respiratory_disorders}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("family_medical_history.respiratory_disorders", checked as boolean)
                  }
                />
                <Label htmlFor="respiratory_disorders">Respiratory Disorders</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="family_other">Other Family Medical History</Label>
              <Textarea
                id="family_other"
                name="family_medical_history.other"
                value={formData.family_medical_history.other}
                onChange={handleInputChange}
                placeholder="Please specify any other relevant family medical history"
              />
            </div>
          </div>
        )

      case 5: // Lifestyle
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smoking_status">Smoking Status</Label>
              <Select
                value={formData.lifestyle_info.smoking_status}
                onValueChange={(value) => handleSelectChange("lifestyle_info.smoking_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select smoking status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never smoked">Never smoked</SelectItem>
                  <SelectItem value="Former smoker">Former smoker</SelectItem>
                  <SelectItem value="Current smoker">Current smoker</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alcohol_consumption">Alcohol Consumption</Label>
              <Select
                value={formData.lifestyle_info.alcohol_consumption}
                onValueChange={(value) => handleSelectChange("lifestyle_info.alcohol_consumption", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alcohol consumption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Occasional">Occasional</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercise_frequency">Exercise Frequency</Label>
              <Select
                value={formData.lifestyle_info.exercise_frequency}
                onValueChange={(value) => handleSelectChange("lifestyle_info.exercise_frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="1-2 times per week">1-2 times per week</SelectItem>
                  <SelectItem value="3-4 times per week">3-4 times per week</SelectItem>
                  <SelectItem value="5+ times per week">5+ times per week</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diet">Diet (optional)</Label>
              <Textarea
                id="diet"
                name="lifestyle_info.diet"
                value={formData.lifestyle_info.diet}
                onChange={handleInputChange}
                placeholder="Describe your typical diet (e.g., vegetarian, keto, etc.)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation (optional)</Label>
              <Input
                id="occupation"
                name="lifestyle_info.occupation"
                value={formData.lifestyle_info.occupation}
                onChange={handleInputChange}
                placeholder="Your current occupation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stress_level">Stress Level</Label>
              <Select
                value={formData.lifestyle_info.stress_level}
                onValueChange={(value) => handleSelectChange("lifestyle_info.stress_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
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
                name="emergency_contact.name"
                value={formData.emergency_contact.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_relationship">Relationship</Label>
              <Input
                id="emergency_relationship"
                name="emergency_contact.relationship"
                value={formData.emergency_contact.relationship}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Phone Number</Label>
              <Input
                id="emergency_phone"
                name="emergency_contact.phone"
                value={formData.emergency_contact.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_email">Email (optional)</Label>
              <Input
                id="emergency_email"
                name="emergency_contact.email"
                type="email"
                value={formData.emergency_contact.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )

      case 7: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium">Name:</span> {formData.first_name} {formData.last_name}
                </div>
                <div>
                  <span className="font-medium">Date of Birth:</span> {formData.date_of_birth}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {formData.gender}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Physical Characteristics</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium">Height:</span>{" "}
                  {formData.height_cm ? `${formData.height_cm} cm` : "Not provided"}
                </div>
                <div>
                  <span className="font-medium">Weight:</span>{" "}
                  {formData.weight_kg ? `${formData.weight_kg} kg` : "Not provided"}
                </div>
                <div>
                  <span className="font-medium">Blood Type:</span> {formData.blood_type || "Not provided"}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Medical History</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Chronic Conditions:</span>{" "}
                  {formData.chronic_conditions.length > 0 ? formData.chronic_conditions.join(", ") : "None reported"}
                </div>
                <div>
                  <span className="font-medium">Previous Surgeries:</span>{" "}
                  {formData.surgical_history.has_previous_surgeries ? "Yes" : "No"}
                </div>
                {formData.surgical_history.has_previous_surgeries && (
                  <div className="pl-4">
                    {formData.surgical_history.surgeries.map((surgery, index) => (
                      <div key={index} className="mb-1">
                        {surgery.procedure} ({surgery.year}){surgery.notes && ` - ${surgery.notes}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Medications & Allergies</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Current Medications:</span>{" "}
                  {formData.current_medications.length > 0 ? formData.current_medications.join(", ") : "None reported"}
                </div>
                <div>
                  <span className="font-medium">Allergies:</span>{" "}
                  {formData.allergies.length > 0 ? formData.allergies.join(", ") : "None reported"}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Family Medical History</h3>
              <div className="space-y-2 text-sm">
                <div>
                  {Object.entries(formData.family_medical_history)
                    .filter(([key, value]) => value === true && key !== "other")
                    .map(([key]) => key.replace(/_/g, " "))
                    .join(", ") || "None reported"}
                </div>
                {formData.family_medical_history.other && (
                  <div>
                    <span className="font-medium">Other:</span> {formData.family_medical_history.other}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Lifestyle Information</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium">Smoking:</span> {formData.lifestyle_info.smoking_status}
                </div>
                <div>
                  <span className="font-medium">Alcohol:</span> {formData.lifestyle_info.alcohol_consumption}
                </div>
                <div>
                  <span className="font-medium">Exercise:</span> {formData.lifestyle_info.exercise_frequency}
                </div>
                <div>
                  <span className="font-medium">Stress Level:</span> {formData.lifestyle_info.stress_level}
                </div>
                {formData.lifestyle_info.diet && (
                  <div>
                    <span className="font-medium">Diet:</span> {formData.lifestyle_info.diet}
                  </div>
                )}
                {formData.lifestyle_info.occupation && (
                  <div>
                    <span className="font-medium">Occupation:</span> {formData.lifestyle_info.occupation}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Emergency Contact</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="font-medium">Name:</span> {formData.emergency_contact.name}
                </div>
                <div>
                  <span className="font-medium">Relationship:</span> {formData.emergency_contact.relationship}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {formData.emergency_contact.phone}
                </div>
                {formData.emergency_contact.email && (
                  <div>
                    <span className="font-medium">Email:</span> {formData.emergency_contact.email}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-mcs-blue bg-mcs-blue/10 p-4">
              <p className="text-sm">
                By submitting this form, you confirm that the information provided is accurate to the best of your
                knowledge. This information will be used to provide personalized healthcare recommendations.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Medical Profile</CardTitle>
        <CardDescription>
          Please provide your medical information to help our healthcare agents provide personalized advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span>{STEPS[currentStep]}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-mcs-gray/20">
            <div
              className="h-full bg-mcs-blue transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={(e) => e.preventDefault()}>{renderStep()}</form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button type="button" onClick={nextStep} className="flex items-center gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1 bg-mcs-blue hover:bg-mcs-blue-light"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Submit
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
