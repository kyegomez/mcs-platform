"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Mail, Globe } from "lucide-react"
import Image from "next/image"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    website: "",
  })

  const supabase = getSupabaseClient()

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          throw error
        }

        if (data) {
          setProfile(data)
          setFormData({
            username: data.username || "",
            full_name: data.full_name || "",
            website: data.website || "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [user, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSaving(true)
      setError(null)

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username || null,
          full_name: formData.full_name || null,
          website: formData.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mcs-blue" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-black border-mcs-gray md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-2 border-mcs-blue">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-mcs-gray">
                  <User className="h-16 w-16 text-mcs-gray-light" />
                </div>
              )}
            </div>
            <div className="text-sm text-mcs-gray-light text-center">
              Profile picture is managed through your Google account
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-mcs-gray md:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-500 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center border border-mcs-gray rounded-md px-3 py-2 bg-mcs-gray/20">
                  <Mail className="h-4 w-4 text-mcs-gray-light mr-2" />
                  <span className="text-mcs-gray-light">{user?.email}</span>
                </div>
                <p className="text-xs text-mcs-gray-light">Email is managed through your Google account</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-mcs-gray-light mr-2" />
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving} className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
