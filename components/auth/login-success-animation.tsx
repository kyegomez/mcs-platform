"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

interface LoginSuccessAnimationProps {
  username: string
  redirectUrl?: string
}

export function LoginSuccessAnimation({ username }: LoginSuccessAnimationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide animation after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="flex flex-col items-center justify-center space-y-6 p-8 rounded-lg">
        <div className="animate-pulse">
          <CheckCircle className="h-24 w-24 text-mcs-blue" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Welcome, {username}!</h2>
          <p className="text-mcs-gray-light">Login successful</p>
        </div>
      </div>
    </div>
  )
}
