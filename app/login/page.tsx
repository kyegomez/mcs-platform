"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Set flag for new login to trigger animation
      if (typeof window !== "undefined") {
        sessionStorage.setItem("newLogin", "true")
      }

      await signInWithGoogle()
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md bg-black border-mcs-gray">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in to MCS</CardTitle>
          <CardDescription>Sign in to access your healthcare dashboard and specialists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-500 rounded-md">{error}</div>
          )}

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-6 border-mcs-gray hover:bg-mcs-gray/20"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-mcs-gray-light text-center">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-mcs-blue hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-mcs-blue hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
