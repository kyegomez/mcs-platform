"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import type { MedicalProfile } from "@/types/medical-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MedicalProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<MedicalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Load medical profile
    if (user) {
      const loadProfile = async () => {
        setIsLoading(true)
        try {
          const profile = await medicalProfileService.getUserMedicalProfile(user.id)
          setProfile(profile)
        } catch (error) {
          console.error("Error loading medical profile:", error)
          setError("Failed to load your medical profile. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
      loadProfile()
    }
  }, [user, authLoading, router])

  const handleEditProfile = () => {
    router.push("/onboarding")
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

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle>Medical Profile</CardTitle>
            <CardDescription>Your medical profile information</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">You haven't created a medical profile yet.</p>
                <Button onClick={() => router.push("/onboarding")}>Create Medical Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Medical Profile</CardTitle>
            <CardDescription>Your medical profile information</CardDescription>
          </div>
          <Button onClick={handleEditProfile} className="flex items-center gap-1">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">Name:</span> {profile.first_name} {profile.last_name}
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span>{" "}
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {profile.gender}
              </div>
            </div>
          </div>

          {/* Physical Characteristics */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Physical Characteristics</h3>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">Height:</span>{" "}
                {profile.height_cm ? `${profile.height_cm} cm` : "Not provided"}
              </div>
              <div>
                <span className="font-medium">Weight:</span>{" "}
                {profile.weight_kg ? `${profile.weight_kg} kg` : "Not provided"}
              </div>
              <div>
                <span className="font-medium">Blood Type:</span> {profile.blood_type || "Not provided"}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Medical History</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Chronic Conditions:</span>{" "}
                {profile.chronic_conditions.length > 0 ? profile.chronic_conditions.join(", ") : "None reported"}
              </div>
              <div>
                <span className="font-medium">Previous Surgeries:</span>{" "}
                {profile.surgical_history.has_previous_surgeries ? "Yes" : "No"}
              </div>
              {profile.surgical_history.has_previous_surgeries && profile.surgical_history.surgeries && (
                <div className="pl-4">
                  {profile.surgical_history.surgeries.map((surgery: any, index: number) => (
                    <div key={index} className="mb-1">
                      {surgery.procedure} ({surgery.year}){surgery.notes && ` - ${surgery.notes}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Medications & Allergies */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Medications & Allergies</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Current Medications:</span>{" "}
                {profile.current_medications.length > 0 ? profile.current_medications.join(", ") : "None reported"}
              </div>
              <div>
                <span className="font-medium">Allergies:</span>{" "}
                {profile.allergies.length > 0 ? profile.allergies.join(", ") : "None reported"}
              </div>
            </div>
          </div>

          {/* Family Medical History */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Family Medical History</h3>
            <div className="space-y-2 text-sm">
              <div>
                {Object.entries(profile.family_medical_history)
                  .filter(([key, value]) => value === true && key !== "other")
                  .map(([key]) => key.replace(/_/g, " "))
                  .join(", ") || "None reported"}
              </div>
              {profile.family_medical_history.other && (
                <div>
                  <span className="font-medium">Other:</span> {profile.family_medical_history.other}
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle Information */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Lifestyle Information</h3>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">Smoking:</span> {profile.lifestyle_info.smoking_status}
              </div>
              <div>
                <span className="font-medium">Alcohol:</span> {profile.lifestyle_info.alcohol_consumption}
              </div>
              <div>
                <span className="font-medium">Exercise:</span> {profile.lifestyle_info.exercise_frequency}
              </div>
              <div>
                <span className="font-medium">Stress Level:</span> {profile.lifestyle_info.stress_level}
              </div>
              {profile.lifestyle_info.diet && (
                <div>
                  <span className="font-medium">Diet:</span> {profile.lifestyle_info.diet}
                </div>
              )}
              {profile.lifestyle_info.occupation && (
                <div>
                  <span className="font-medium">Occupation:</span> {profile.lifestyle_info.occupation}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">Name:</span> {profile.emergency_contact.name}
              </div>
              <div>
                <span className="font-medium">Relationship:</span> {profile.emergency_contact.relationship}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {profile.emergency_contact.phone}
              </div>
              {profile.emergency_contact.email && (
                <div>
                  <span className="font-medium">Email:</span> {profile.emergency_contact.email}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
