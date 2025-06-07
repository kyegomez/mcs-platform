"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  checkAndTriggerAlerts,
  getAlertPreferences,
  saveAlertPreferences,
  dismissAlert,
  type AlertSchedule,
  type AlertPreferences,
} from "@/lib/alert-system"
import type { Alert } from "@/types/agent"
import { Settings, Utensils, Moon, Pill, Activity, Heart, Droplets, Brain } from "lucide-react"

const alertTypeIcons = {
  diet: Utensils,
  sleep: Moon,
  medication: Pill,
  exercise: Activity,
  mood: Brain,
  symptoms: Heart,
  water: Droplets,
}

const alertTypeColors = {
  diet: "text-green-400",
  sleep: "text-purple-400",
  medication: "text-red-400",
  exercise: "text-blue-400",
  mood: "text-yellow-400",
  symptoms: "text-orange-400",
  water: "text-cyan-400",
}

export function AlertManager() {
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null)
  const [newAlerts, setNewAlerts] = useState<Alert[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<AlertSchedule | null>(null)

  useEffect(() => {
    // Load preferences
    const prefs = getAlertPreferences()
    setPreferences(prefs)

    // Check for new alerts
    const alerts = checkAndTriggerAlerts()
    setNewAlerts(alerts)

    // Set up interval to check for alerts every minute
    const interval = setInterval(() => {
      const newAlertsCheck = checkAndTriggerAlerts()
      if (newAlertsCheck.length > 0) {
        setNewAlerts((prev) => [...prev, ...newAlertsCheck])
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const updatePreferences = (newPrefs: AlertPreferences) => {
    setPreferences(newPrefs)
    saveAlertPreferences(newPrefs)
  }

  const toggleSchedule = (scheduleId: string, enabled: boolean) => {
    if (!preferences) return

    const updatedSchedules = preferences.schedules.map((schedule) =>
      schedule.id === scheduleId ? { ...schedule, enabled } : schedule,
    )

    updatePreferences({
      ...preferences,
      schedules: updatedSchedules,
    })
  }

  const updateScheduleTime = (scheduleId: string, time: string) => {
    if (!preferences) return

    const updatedSchedules = preferences.schedules.map((schedule) =>
      schedule.id === scheduleId ? { ...schedule, time } : schedule,
    )

    updatePreferences({
      ...preferences,
      schedules: updatedSchedules,
    })
  }

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId)
    setNewAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const createNoteFromAlert = (alert: Alert) => {
    // Navigate to notes page with pre-filled content based on alert type
    const noteContent = generateNoteTemplate(alert)
    const noteData = {
      title: alert.title,
      content: noteContent,
      category: getCategoryFromAlert(alert),
    }

    // Store the note data in localStorage for the notes page to pick up
    localStorage.setItem("mcs-pending-note", JSON.stringify(noteData))

    // Dismiss the alert
    handleDismissAlert(alert.id)

    // Navigate to notes page
    window.location.href = "/notes"
  }

  const generateNoteTemplate = (alert: Alert): string => {
    const now = new Date()
    const dateStr = now.toLocaleDateString()
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (
      alert.title.includes("Diet") ||
      alert.title.includes("Breakfast") ||
      alert.title.includes("Lunch") ||
      alert.title.includes("Dinner")
    ) {
      return `Date: ${dateStr}
Time: ${timeStr}

Meal Details:
- What I ate: 
- Portion size: 
- How I felt: 
- Energy level after eating: 

Notes:
`
    }

    if (alert.title.includes("Sleep")) {
      return `Date: ${dateStr}

Sleep Log:
- Bedtime: 
- Wake up time: 
- Total sleep hours: 
- Sleep quality (1-10): 
- How I feel this morning: 
- Dreams/disturbances: 

Notes:
`
    }

    if (alert.title.includes("Exercise")) {
      return `Date: ${dateStr}
Time: ${timeStr}

Exercise Log:
- Type of activity: 
- Duration: 
- Intensity (1-10): 
- How I felt during: 
- How I feel after: 

Notes:
`
    }

    if (alert.title.includes("Mood") || alert.title.includes("Check-in")) {
      return `Date: ${dateStr}
Time: ${timeStr}

Mood Check-in:
- Overall mood (1-10): 
- Energy level (1-10): 
- Stress level (1-10): 
- What's going well: 
- What's challenging: 

Notes:
`
    }

    if (alert.title.includes("Water") || alert.title.includes("Hydration")) {
      return `Date: ${dateStr}
Time: ${timeStr}

Hydration Log:
- Glasses of water today: 
- Other fluids: 
- Urine color (pale/yellow/dark): 
- Thirst level: 

Notes:
`
    }

    return `Date: ${dateStr}
Time: ${timeStr}

${alert.description}

Details:


Notes:
`
  }

  const getCategoryFromAlert = (alert: Alert): string => {
    if (
      alert.title.includes("Diet") ||
      alert.title.includes("Breakfast") ||
      alert.title.includes("Lunch") ||
      alert.title.includes("Dinner")
    ) {
      return "Diet"
    }
    if (alert.title.includes("Sleep")) return "General"
    if (alert.title.includes("Exercise")) return "Exercise"
    if (alert.title.includes("Mood")) return "Mental Health"
    if (alert.title.includes("Medication")) return "Medications"
    return "General"
  }

  if (!preferences) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="animate-spin h-4 w-4 border-2 border-mcs-blue border-t-transparent rounded-full" />
        Loading alerts...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* New Alerts */}
      {newAlerts.length > 0 && (
        <div className="space-y-3">
          {newAlerts.map((alert) => {
            const alertType = preferences.schedules.find((s) => s.title === alert.title)?.type || "symptoms"
            const IconComponent = alertTypeIcons[alertType]
            const iconColor = alertTypeColors[alertType]

            return (
              <Card key={alert.id} className="glass-card border-mcs-blue/50 bg-mcs-blue/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-black/30 ${iconColor}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                      <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => createNoteFromAlert(alert)} className="btn-primary text-xs">
                          Log Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissAlert(alert.id)}
                          className="text-xs"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Alert Settings */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Alert Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Health Alert Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Global Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">General Settings</h3>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Health Alerts</label>
                  <p className="text-xs text-gray-400">Receive automatic reminders for health tracking</p>
                </div>
                <Switch
                  checked={preferences.enabled}
                  onCheckedChange={(enabled) => updatePreferences({ ...preferences, enabled })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Max Alerts Per Day</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.maxAlertsPerDay}
                    onChange={(e) =>
                      updatePreferences({
                        ...preferences,
                        maxAlertsPerDay: Number.parseInt(e.target.value) || 10,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Snooze Duration (minutes)</label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={preferences.snoozeMinutes}
                    onChange={(e) =>
                      updatePreferences({
                        ...preferences,
                        snoozeMinutes: Number.parseInt(e.target.value) || 30,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Alert Schedules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Alert Schedules</h3>

              <div className="space-y-3">
                {preferences.schedules.map((schedule) => {
                  const IconComponent = alertTypeIcons[schedule.type]
                  const iconColor = alertTypeColors[schedule.type]

                  return (
                    <Card key={schedule.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-black/30 ${iconColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{schedule.title}</h4>
                            <p className="text-xs text-gray-400">{schedule.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={schedule.time}
                              onChange={(e) => updateScheduleTime(schedule.id, e.target.value)}
                              className="w-24 bg-white/5 border-white/10 text-white text-xs"
                            />
                            <Switch
                              checked={schedule.enabled}
                              onCheckedChange={(enabled) => toggleSchedule(schedule.id, enabled)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
