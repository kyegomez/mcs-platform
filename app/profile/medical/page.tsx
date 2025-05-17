"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import type { MedicalProfile } from "@/types/medical-profile"

export default function MedicalProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<MedicalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const medicalProfile = await medicalProfileService.getUserMedicalProfile(user.id)
        setProfile(medicalProfile)
      } catch (error) {
        console.error("Error loading medical profile:", error)
        setError("Failed to load your medical profile. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else {
        loadProfile()
      }
    }
  }, [user, authLoading, router])

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

  if (!user) {
    return null // Will redirect to login
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Medical Profile</h1>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>No Medical Profile Found</CardTitle>
            <CardDescription>You haven't completed your medical profile yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-mcs-gray-light mb-4">
              Complete your medical profile to help our healthcare agents provide you with better care.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
              <Link href="/onboarding">Complete Medical Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Medical Profile</h1>
        <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
          <Link href="/profile/medical/edit">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-mcs-gray-light">Full Name</p>
                <p className="font-medium">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Date of Birth</p>
                <p className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Gender</p>
                <p className="font-medium">{profile.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Physical Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-mcs-gray-light">Height</p>
                <p className="font-medium">{profile.height_cm ? `${profile.height_cm} cm` : "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Weight</p>
                <p className="font-medium">{profile.weight_kg ? `${profile.weight_kg} kg` : "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Blood Type</p>
                <p className="font-medium">{profile.blood_type || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-mcs-gray-light mb-2">Chronic Conditions</p>
              {profile.chronic_conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.chronic_conditions.map((condition, index) => (
                    <div key={index} className="bg-mcs-gray/30 px-3 py-1 rounded-full text-sm">
                      {condition}
                    </div>
                  ))}
                </div>
              ) : (
                <p>None provided</p>
              )}
            </div>

            <div>
              <p className="text-sm text-mcs-gray-light mb-2">Allergies</p>
              {profile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, index) => (
                    <div key={index} className="bg-mcs-gray/30 px-3 py-1 rounded-full text-sm">
                      {allergy}
                    </div>
                  ))}
                </div>
              ) : (
                <p>None provided</p>
              )}
            </div>

            <div>
              <p className="text-sm text-mcs-gray-light mb-2">Current Medications</p>
              {profile.current_medications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.current_medications.map((medication, index) => (
                    <div key={index} className="bg-mcs-gray/30 px-3 py-1 rounded-full text-sm">
                      {medication}
                    </div>
                  ))}
                </div>
              ) : (
                <p>None provided</p>
              )}
            </div>

            {profile.surgical_history.length > 0 && (
              <div>
                <p className="text-sm text-mcs-gray-light mb-2">Surgical History</p>
                <div className="space-y-2">
                  {profile.surgical_history.map((surgery, index) => (
                    <div key={index} className="bg-mcs-gray/30 p-3 rounded-md">
                      <p className="font-medium">{surgery.procedure}</p>
                      <p className="text-sm text-mcs-gray-light">Date: {new Date(surgery.date).toLocaleDateString()}</p>
                      {surgery.notes && <p className="text-sm mt-1">{surgery.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Family Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.family_medical_history.heart_disease && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Heart Disease</div>
              )}
              {profile.family_medical_history.diabetes && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Diabetes</div>
              )}
              {profile.family_medical_history.cancer && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Cancer</div>
              )}
              {profile.family_medical_history.stroke && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Stroke</div>
              )}
              {profile.family_medical_history.hypertension && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Hypertension</div>
              )}
              {profile.family_medical_history.mental_health_disorders && (
                <div className="bg-mcs-gray/30 px-3 py-2 rounded-md text-sm">Mental Health Disorders</div>
              )}
            </div>

            {profile.family_medical_history.other && (
              <div className="mt-4">
                <p className="text-sm text-mcs-gray-light mb-2">Other Family History</p>
                <p>{profile.family_medical_history.other}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Lifestyle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-mcs-gray-light">Smoking Status</p>
                <p className="font-medium capitalize">{profile.lifestyle_info.smoking_status}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Alcohol Consumption</p>
                <p className="font-medium capitalize">{profile.lifestyle_info.alcohol_consumption}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Exercise Frequency</p>
                <p className="font-medium capitalize">{profile.lifestyle_info.exercise_frequency}</p>
              </div>
              <div>
                <p className="text-sm text-mcs-gray-light">Stress Level</p>
                <p className="font-medium capitalize">{profile.lifestyle_info.stress_level}</p>
              </div>
            </div>

            {profile.lifestyle_info.occupation && (
              <div className="mt-4">
                <p className="text-sm text-mcs-gray-light">Occupation</p>
                <p>{profile.lifestyle_info.occupation}</p>
              </div>
            )}

            {profile.lifestyle_info.diet && (
              <div className="mt-4">
                <p className="text-sm text-mcs-gray-light">Diet</p>
                <p>{profile.lifestyle_info.diet}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.emergency_contact.name ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-mcs-gray-light">Name</p>
                  <p className="font-medium">{profile.emergency_contact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-mcs-gray-light">Relationship</p>
                  <p>{profile.emergency_contact.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-mcs-gray-light">Phone</p>
                  <p>{profile.emergency_contact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-mcs-gray-light">Email</p>
                  <p>{profile.emergency_contact.email}</p>
                </div>
              </div>
            ) : (
              <p>No emergency contact provided</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
