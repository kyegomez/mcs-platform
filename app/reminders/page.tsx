"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"
import {
  getAlertPreferences,
  saveAlertPreferences,
  type AlertSchedule,
  type AlertPreferences,
} from "@/lib/alert-system"
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Repeat,
  Utensils,
  Moon,
  Pill,
  Activity,
  Brain,
  Heart,
  Droplets,
} from "lucide-react"

const alertTypeIcons = {
  diet: Utensils,
  sleep: Moon,
  medication: Pill,
  exercise: Activity,
  mood: Brain,
  symptoms: Heart,
  water: Droplets,
  custom: Bell,
}

const alertTypeColors = {
  diet: "text-green-400",
  sleep: "text-purple-400",
  medication: "text-red-400",
  exercise: "text-blue-400",
  mood: "text-yellow-400",
  symptoms: "text-orange-400",
  water: "text-cyan-400",
  custom: "text-mcs-blue",
}

export default function RemindersPage() {
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<AlertSchedule | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState("12:00")
  const [type, setType] = useState<
    "diet" | "sleep" | "medication" | "exercise" | "mood" | "symptoms" | "water" | "custom"
  >("custom")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily")
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [customDate, setCustomDate] = useState<string>("")
  const [enabled, setEnabled] = useState(true)

  // Load preferences
  useEffect(() => {
    const prefs = getAlertPreferences()
    setPreferences(prefs)

    // Check for pending reminder creation
    const pendingReminder = localStorage.getItem("mcs-pending-reminder")
    if (pendingReminder) {
      try {
        const reminderData = JSON.parse(pendingReminder)
        if (reminderData.date) {
          const date = new Date(reminderData.date)
          setCustomDate(date.toISOString().split("T")[0])
          setFrequency("custom")
          setIsDialogOpen(true)
        }
      } catch (error) {
        console.error("Error parsing pending reminder:", error)
      }
      localStorage.removeItem("mcs-pending-reminder")
    }
  }, [])

  // Update preferences
  const updatePreferences = (newPrefs: AlertPreferences) => {
    setPreferences(newPrefs)
    saveAlertPreferences(newPrefs)
  }

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTime("12:00")
    setType("custom")
    setFrequency("daily")
    setSelectedDays([])
    setCustomDate("")
    setEnabled(true)
    setEditingReminder(null)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!preferences || !title.trim()) return

    let customDays: number[] | undefined

    if (frequency === "weekly") {
      customDays = selectedDays
    } else if (frequency === "custom" && customDate) {
      // For custom frequency, store the date as a timestamp
      customDays = [new Date(customDate).getTime()]
    }

    const reminderData: AlertSchedule = {
      id: editingReminder?.id || uuidv4(),
      type,
      title: title.trim(),
      description: description.trim(),
      time,
      enabled,
      frequency,
      customDays,
    }

    let updatedSchedules: AlertSchedule[]

    if (editingReminder) {
      // Update existing reminder
      updatedSchedules = preferences.schedules.map((schedule) =>
        schedule.id === editingReminder.id ? reminderData : schedule,
      )
    } else {
      // Add new reminder
      updatedSchedules = [...preferences.schedules, reminderData]
    }

    updatePreferences({
      ...preferences,
      schedules: updatedSchedules,
    })

    resetForm()
    setIsDialogOpen(false)
  }

  // Handle edit reminder
  const handleEdit = (reminder: AlertSchedule) => {
    setEditingReminder(reminder)
    setTitle(reminder.title)
    setDescription(reminder.description)
    setTime(reminder.time)
    setType(reminder.type)
    setFrequency(reminder.frequency)
    setEnabled(reminder.enabled)

    if (reminder.frequency === "weekly" && reminder.customDays) {
      setSelectedDays(reminder.customDays)
    } else if (reminder.frequency === "custom" && reminder.customDays && reminder.customDays.length > 0) {
      // For custom frequency, convert timestamp back to date string
      const date = new Date(reminder.customDays[0])
      setCustomDate(date.toISOString().split("T")[0])
    }

    setIsDialogOpen(true)
  }

  // Handle delete reminder
  const handleDelete = (id: string) => {
    if (!preferences) return

    const updatedSchedules = preferences.schedules.filter((schedule) => schedule.id !== id)

    updatePreferences({
      ...preferences,
      schedules: updatedSchedules,
    })
  }

  // Toggle reminder enabled state
  const toggleReminder = (id: string, enabled: boolean) => {
    if (!preferences) return

    const updatedSchedules = preferences.schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, enabled } : schedule,
    )

    updatePreferences({
      ...preferences,
      schedules: updatedSchedules,
    })
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Format frequency for display
  const formatFrequency = (reminder: AlertSchedule) => {
    if (reminder.frequency === "daily") {
      return "Every day"
    }

    if (reminder.frequency === "weekly" && reminder.customDays) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const days = reminder.customDays.map((day) => dayNames[day]).join(", ")
      return `Weekly: ${days}`
    }

    if (reminder.frequency === "custom" && reminder.customDays && reminder.customDays.length > 0) {
      const date = new Date(reminder.customDays[0])
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    return "Custom"
  }

  // Day of week options for weekly frequency
  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  // Toggle day selection for weekly frequency
  const toggleDaySelection = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  if (!preferences) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="animate-spin h-4 w-4 border-2 border-mcs-blue border-t-transparent rounded-full" />
        Loading reminders...
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Health Reminders</h1>
            <p className="text-gray-400">Set up custom reminders to track your health consistently.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingReminder ? "Edit Reminder" : "Create New Reminder"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Title</label>
                  <Input
                    placeholder="Enter reminder title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <Input
                    placeholder="Enter reminder description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Type</label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diet">Diet</SelectItem>
                        <SelectItem value="sleep">Sleep</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="mood">Mood</SelectItem>
                        <SelectItem value="symptoms">Symptoms</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Time</label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Frequency</label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {frequency === "weekly" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Days of Week</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={selectedDays.includes(day.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDaySelection(day.value)}
                          className={selectedDays.includes(day.value) ? "bg-mcs-blue hover:bg-mcs-blue-light" : ""}
                        >
                          {day.label.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {frequency === "custom" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Date</label>
                    <Input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Enable Reminder</label>
                    <p className="text-xs text-gray-400">Receive notifications for this reminder</p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary">
                    {editingReminder ? "Update Reminder" : "Create Reminder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Global Settings */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Health Reminders</h3>
              <p className="text-sm text-gray-400">Enable or disable all health reminders</p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(enabled) => updatePreferences({ ...preferences, enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Reminders</h2>
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {preferences.schedules.length} reminders
          </Badge>
        </div>

        {preferences.schedules.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No reminders yet</h3>
              <p className="text-gray-400 mb-4">
                Create your first reminder to start tracking your health consistently.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                Create Your First Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {preferences.schedules.map((reminder) => {
              const IconComponent = alertTypeIcons[reminder.type] || Bell
              const iconColor = alertTypeColors[reminder.type] || "text-mcs-blue"

              return (
                <Card key={reminder.id} className={`glass-card ${!reminder.enabled ? "opacity-60" : ""}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-black/30 ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{reminder.title}</CardTitle>
                        <p className="text-sm text-gray-400">{reminder.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(enabled) => toggleReminder(reminder.id, enabled)}
                    />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Clock className="h-4 w-4 text-mcs-blue" />
                        <span>{formatTime(reminder.time)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Repeat className="h-4 w-4 text-mcs-blue" />
                        <span>{formatFrequency(reminder)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Calendar className="h-4 w-4 text-mcs-blue" />
                        <span>{reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reminder.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reminder)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
