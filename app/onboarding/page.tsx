"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { MedicalProfileForm } from "@/components/onboarding/medical-profile-form"

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is already onboarded
    const checkOnboardingStatus = async () => {
      if (!user) return

      try {
        const profile = await medicalProfileService.getUserMedicalProfile(user.id)

        // If profile exists, redirect to dashboard
        if (profile) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }

    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login")
      } else {
        checkOnboardingStatus()
      }
    }
  }, [user, authLoading, router])

  if (authLoading) {
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

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Medical Profile</h1>
      <MedicalProfileForm />
    </div>
  )
}
