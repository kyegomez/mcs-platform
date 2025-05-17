"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Save, CheckCircle } from "lucide-react"
import type { MedicalProfileFormData } from "@/types/patient"

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const [formData, setFormData] = useState<MedicalProfileFormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: null,
    weight_kg: null,
    blood_type: null,
    allergies: [],
    current_medications: [],
    chronic_conditions: [],
    surgical_history: {},
    family_medical_history: {},
    lifestyle_info: {
      smoking: "Never",
      alcohol: "Never",
      exercise: "Sedentary",
      diet: "Regular",
    },
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
    },
  })

  useEffect(() => {
    if (!user) {
      if (!authLoading) {
        router.push("/login")
      }
      return
    }

    const loadMedicalProfile = async () => {
      setIsLoading(true)
      try {
        const profile = await medicalProfileService.getMedicalProfile(user.id)
        if (profile) {
          setFormData({
            first_name: profile.first_name,
            last_name: profile.last_name,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
            height_cm: profile.height_cm,
            weight_kg: profile.weight_kg,
            blood_type: profile.blood_type,
            allergies: profile.allergies || [],
            current_medications: profile.current_medications || [],
            chronic_conditions: profile.chronic_conditions || [],
            surgical_history: profile.surgical_history || {},
            family_medical_history: profile.family_medical_history || {},
            lifestyle_info: profile.lifestyle_info || {
              smoking: "Never",
              alcohol: "Never",
              exercise: "Sedentary",
              diet: "Regular",
            },
            emergency_contact: profile.emergency_contact || {
              name: "",
              relationship: "",
              phone: "",
            },
          })
        }
      } catch (error) {
        console.error("Error loading medical profile:", error)
        setError("Failed to load your medical profile. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadMedicalProfile()
  }, [user, router, authLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number.parseFloat(value),
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLifestyleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      lifestyle_info: {
        ...prev.lifestyle_info,
        [field]: value,
      },
    }))
  }

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [field]: value,
      },
    }))
  }

  const handleArrayFieldChange = (field: string, value: string) => {
    // Split by commas and trim whitespace
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    setFormData((prev) => ({
      ...prev,
      [field]: items,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await medicalProfileService.saveMedicalProfile(user.id, formData)
      setSuccess(true)

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error saving medical profile:", error)
      setError("Failed to save your medical profile. Please try again.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsSaving(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "personal") setActiveTab("medical")
    else if (activeTab === "medical") setActiveTab("lifestyle")
    else if (activeTab === "lifestyle") setActiveTab("emergency")
  }

  const prevTab = () => {
    if (activeTab === "emergency") setActiveTab("lifestyle")
    else if (activeTab === "lifestyle") setActiveTab("medical")
    else if (activeTab === "medical") setActiveTab("personal")
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcs-blue mx-auto"></div>
          <p className="mt-4 text-mcs-gray-light">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-2">Medical Profile</h1>
      <p className="text-mcs-gray-light mb-8">
        Please provide your medical information to help our healthcare specialists provide better care.
      </p>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>
            Your medical profile has been saved successfully! Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="bg-black border-mcs-gray">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Provide your basic personal and physical information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                      required
                    >
                      <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-mcs-gray">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      name="height_cm"
                      type="number"
                      value={formData.height_cm === null ? "" : formData.height_cm}
                      onChange={handleNumberChange}
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      name="weight_kg"
                      type="number"
                      value={formData.weight_kg === null ? "" : formData.weight_kg}
                      onChange={handleNumberChange}
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <Select
                      value={formData.blood_type || ""}
                      onValueChange={(value) => handleSelectChange("blood_type", value)}
                    >
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
                        <SelectItem value="Unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={nextTab} className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card className="bg-black border-mcs-gray">
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
                <CardDescription>
                  Provide information about your medical conditions, allergies, and medications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="allergies">
                    Allergies <span className="text-xs text-mcs-gray-light">(separate with commas)</span>
                  </Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies.join(", ")}
                    onChange={(e) => handleArrayFieldChange("allergies", e.target.value)}
                    placeholder="Penicillin, Peanuts, Latex, etc."
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_medications">
                    Current Medications <span className="text-xs text-mcs-gray-light">(separate with commas)</span>
                  </Label>
                  <Textarea
                    id="current_medications"
                    value={formData.current_medications.join(", ")}
                    onChange={(e) => handleArrayFieldChange("current_medications", e.target.value)}
                    placeholder="Lisinopril 10mg, Metformin 500mg, etc."
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_conditions">
                    Chronic Conditions <span className="text-xs text-mcs-gray-light">(separate with commas)</span>
                  </Label>
                  <Textarea
                    id="chronic_conditions"
                    value={formData.chronic_conditions.join(", ")}
                    onChange={(e) => handleArrayFieldChange("chronic_conditions", e.target.value)}
                    placeholder="Hypertension, Diabetes, Asthma, etc."
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surgical_history_text">
                    Surgical History <span className="text-xs text-mcs-gray-light">(describe major surgeries)</span>
                  </Label>
                  <Textarea
                    id="surgical_history_text"
                    value={
                      JSON.stringify(formData.surgical_history) === "{}"
                        ? ""
                        : JSON.stringify(formData.surgical_history)
                    }
                    onChange={(e) => {
                      try {
                        const value = e.target.value.trim() === "" ? {} : JSON.parse(e.target.value)
                        setFormData((prev) => ({
                          ...prev,
                          surgical_history: value,
                        }))
                      } catch (error) {
                        // If not valid JSON, store as text
                        setFormData((prev) => ({
                          ...prev,
                          surgical_history: { description: e.target.value },
                        }))
                      }
                    }}
                    placeholder="Appendectomy 2010, Knee replacement 2015, etc."
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_medical_history_text">
                    Family Medical History{" "}
                    <span className="text-xs text-mcs-gray-light">(describe relevant history)</span>
                  </Label>
                  <Textarea
                    id="family_medical_history_text"
                    value={
                      JSON.stringify(formData.family_medical_history) === "{}"
                        ? ""
                        : JSON.stringify(formData.family_medical_history)
                    }
                    onChange={(e) => {
                      try {
                        const value = e.target.value.trim() === "" ? {} : JSON.parse(e.target.value)
                        setFormData((prev) => ({
                          ...prev,
                          family_medical_history: value,
                        }))
                      } catch (error) {
                        // If not valid JSON, store as text
                        setFormData((prev) => ({
                          ...prev,
                          family_medical_history: { description: e.target.value },
                        }))
                      }
                    }}
                    placeholder="Heart disease (father), Breast cancer (mother), etc."
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevTab}
                  className="border-mcs-gray text-mcs-gray-light hover:text-white"
                >
                  Previous
                </Button>
                <Button type="button" onClick={nextTab} className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle">
            <Card className="bg-black border-mcs-gray">
              <CardHeader>
                <CardTitle>Lifestyle Information</CardTitle>
                <CardDescription>
                  Provide information about your lifestyle habits that may affect your health.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Status</Label>
                    <Select
                      value={formData.lifestyle_info.smoking}
                      onValueChange={(value) => handleLifestyleChange("smoking", value)}
                    >
                      <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-mcs-gray">
                        <SelectItem value="Never">Never smoked</SelectItem>
                        <SelectItem value="Former">Former smoker</SelectItem>
                        <SelectItem value="Occasional">Occasional smoker</SelectItem>
                        <SelectItem value="Regular">Regular smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Consumption</Label>
                    <Select
                      value={formData.lifestyle_info.alcohol}
                      onValueChange={(value) => handleLifestyleChange("alcohol", value)}
                    >
                      <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-mcs-gray">
                        <SelectItem value="Never">Never</SelectItem>
                        <SelectItem value="Rarely">Rarely (few times a year)</SelectItem>
                        <SelectItem value="Occasionally">Occasionally (few times a month)</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Frequency</Label>
                    <Select
                      value={formData.lifestyle_info.exercise}
                      onValueChange={(value) => handleLifestyleChange("exercise", value)}
                    >
                      <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                        <SelectValue placeholder="Select exercise frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-mcs-gray">
                        <SelectItem value="Sedentary">Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="Light">Light (1-2 days a week)</SelectItem>
                        <SelectItem value="Moderate">Moderate (3-5 days a week)</SelectItem>
                        <SelectItem value="Active">Active (6-7 days a week)</SelectItem>
                        <SelectItem value="Very Active">Very active (multiple times per day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet Type</Label>
                    <Select
                      value={formData.lifestyle_info.diet}
                      onValueChange={(value) => handleLifestyleChange("diet", value)}
                    >
                      <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-mcs-gray">
                        <SelectItem value="Regular">Regular (no restrictions)</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                        <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
                        <SelectItem value="Keto">Keto</SelectItem>
                        <SelectItem value="Paleo">Paleo</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevTab}
                  className="border-mcs-gray text-mcs-gray-light hover:text-white"
                >
                  Previous
                </Button>
                <Button type="button" onClick={nextTab} className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card className="bg-black border-mcs-gray">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Provide information about who to contact in case of an emergency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_name"
                    value={formData.emergency_contact.name}
                    onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={formData.emergency_contact.relationship}
                    onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)}
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Phone Number</Label>
                  <Input
                    id="emergency_phone"
                    value={formData.emergency_contact.phone}
                    onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>

                <Separator className="my-4 bg-mcs-gray" />

                <div className="rounded-md bg-mcs-gray/20 p-4">
                  <p className="text-sm text-mcs-gray-light">
                    By submitting this form, you acknowledge that the information provided is accurate to the best of
                    your knowledge and will be used by our healthcare specialists to provide better care. Your
                    information is protected and will be handled according to our privacy policy.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevTab}
                  className="border-mcs-gray text-mcs-gray-light hover:text-white"
                >
                  Previous
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Medical Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
