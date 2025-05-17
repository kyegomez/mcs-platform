"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { MedicalProfileForm } from "@/components/onboarding/medical-profile-form"

export default function OnboardingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Check if user already has a medical profile
    if (user) {
      const checkProfile = async () => {
        const hasProfile = await medicalProfileService.hasMedicalProfile(user.id)
        if (hasProfile) {
          // Redirect to dashboard if profile already exists
          router.push("/dashboard?profile=exists")
        }
      }
      checkProfile()
    }
  }, [user, isLoading, router])

  if (isLoading) {
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
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Complete Your Medical Profile</h1>
        <p className="mt-2 text-mcs-gray-light">
          This information helps our healthcare agents provide personalized advice tailored to your needs.
        </p>
      </div>
      <div className="flex justify-center">
        <MedicalProfileForm />
      </div>
    </div>
  )
}
