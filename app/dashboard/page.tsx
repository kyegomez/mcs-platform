"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut } from "lucide-react"
import { LoginSuccessAnimation } from "@/components/auth/login-success-animation"
import { MedicalProfilePrompt } from "@/components/medical-profile-prompt"
import Link from "next/link"

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth()
  const [showAnimation, setShowAnimation] = useState(false)

  // Check if this is a fresh login
  useEffect(() => {
    const isNewLogin = sessionStorage.getItem("newLogin") === "true"
    if (isNewLogin && user) {
      setShowAnimation(true)
      sessionStorage.removeItem("newLogin")
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mcs-blue" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle className="text-xl text-center">Not Logged In</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-mcs-gray-light">You need to log in to access this page.</p>
            <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {showAnimation && user && (
        <LoginSuccessAnimation
          username={user.user_metadata?.full_name || user.email || "User"}
          redirectUrl="/dashboard"
        />
      )}

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.user_metadata?.full_name || user.email || "User"}
          </h1>
          <p className="text-mcs-gray-light">Your personal healthcare dashboard</p>
        </div>

        <MedicalProfilePrompt />

        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-mcs-gray-light">{user.email}</p>
            </div>

            {user.user_metadata?.full_name && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-mcs-gray-light">{user.user_metadata.full_name}</p>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
