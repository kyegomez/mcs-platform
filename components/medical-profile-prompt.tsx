"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { medicalProfileService } from "@/lib/services/medical-profile-service"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileBarChart, X } from "lucide-react"
import Link from "next/link"

export function MedicalProfilePrompt() {
  const { user } = useAuth()
  const router = useRouter()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMedicalProfile = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const profile = await medicalProfileService.getUserMedicalProfile(user.id)

        // Show prompt if no profile exists
        setShowPrompt(!profile)
      } catch (error) {
        console.error("Error checking medical profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      checkMedicalProfile()
    }
  }, [user])

  if (isLoading || !user || !showPrompt) {
    return null
  }

  return (
    <Card className="bg-mcs-blue/10 border-mcs-blue/30 mb-6">
      <CardContent className="pt-6 pb-2 flex items-start justify-between">
        <div className="flex gap-3">
          <FileBarChart className="h-5 w-5 text-mcs-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Complete your medical profile</p>
            <p className="text-sm text-mcs-gray-light mt-1">
              Provide your medical information to receive personalized care from our healthcare specialists.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompt(false)}
          className="text-mcs-gray-light hover:text-white -mt-2 -mr-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
      <CardFooter className="pb-4">
        <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
          <Link href="/onboarding">Complete Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
