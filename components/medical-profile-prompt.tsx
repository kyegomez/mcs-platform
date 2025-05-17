"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function MedicalProfilePrompt() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  useEffect(() => {
    if (!isLoading && user) {
      const checkProfile = async () => {
        setIsCheckingProfile(true)
        try {
          const hasProfile = await medicalProfileService.hasMedicalProfile(user.id)
          setHasProfile(hasProfile)
        } catch (error) {
          console.error("Error checking medical profile:", error)
        } finally {
          setIsCheckingProfile(false)
        }
      }
      checkProfile()
    }
  }, [user, isLoading])

  if (isLoading || isCheckingProfile || hasProfile === null || hasProfile === true) {
    return null
  }

  return (
    <Card className="mb-6 border-mcs-blue bg-mcs-blue/10">
      <CardContent className="flex items-start gap-4 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-mcs-blue" />
        <div>
          <h3 className="font-medium">Complete Your Medical Profile</h3>
          <p className="mt-1 text-sm">
            To receive personalized healthcare advice, please complete your medical profile. This information helps our
            healthcare agents provide recommendations tailored to your specific needs.
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button onClick={() => router.push("/onboarding")} className="bg-mcs-blue hover:bg-mcs-blue-light">
          Complete Medical Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
