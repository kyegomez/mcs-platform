"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { Database } from "@/lib/database.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    theme: "dark",
    notifications_enabled: true,
    language: "en",
  })

  const supabase = getSupabaseClient()

  useEffect(() => {
    const getSettings = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

        if (error) {
          throw error
        }

        if (data) {
          setSettings(data)
          setFormData({
            theme: data.theme,
            notifications_enabled: data.notifications_enabled,
            language: data.language,
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        setError("Failed to load settings data")
      } finally {
        setIsLoading(false)
      }
    }

    getSettings()
  }, [user, supabase])

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      notifications_enabled: checked,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSaving(true)
      setError(null)

      const { error } = await supabase
        .from("user_settings")
        .update({
          theme: formData.theme,
          notifications_enabled: formData.notifications_enabled,
          language: formData.language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Error updating settings:", error)
      setError(error.message || "Failed to update settings")
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
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit}>
        <Card className="bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Customize your MCS experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-500 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent className="bg-black border-mcs-gray">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                <SelectTrigger className="bg-mcs-gray border-mcs-gray focus:ring-mcs-blue">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="bg-black border-mcs-gray">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-mcs-gray-light">Receive notifications about your health and appointments</p>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications_enabled}
                onCheckedChange={handleSwitchChange}
              />
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
        </Card>
      </form>
    </div>
  )
}
