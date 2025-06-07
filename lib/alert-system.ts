import type { Alert } from "@/types/agent"
import { v4 as uuidv4 } from "uuid"

export interface AlertSchedule {
  id: string
  type: "diet" | "sleep" | "medication" | "exercise" | "mood" | "symptoms" | "water" | "custom"
  title: string
  description: string
  time: string // HH:MM format
  enabled: boolean
  lastTriggered?: Date
  frequency: "daily" | "weekly" | "custom"
  customDays?: number[] // For weekly: 0-6 for Sunday-Saturday, For custom: timestamps
  noteId?: string // Optional reference to a note
}

export interface AlertPreferences {
  enabled: boolean
  schedules: AlertSchedule[]
  snoozeMinutes: number
  maxAlertsPerDay: number
}

const DEFAULT_ALERT_SCHEDULES: AlertSchedule[] = [
  {
    id: "morning-mood",
    type: "mood",
    title: "Morning Check-in",
    description: "How are you feeling this morning? Log your mood and energy levels.",
    time: "08:00",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "breakfast-log",
    type: "diet",
    title: "Breakfast Logging",
    description: "Don't forget to log what you had for breakfast today!",
    time: "09:30",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "lunch-log",
    type: "diet",
    title: "Lunch Logging",
    description: "Time to record your lunch! Keep track of your nutrition.",
    time: "13:30",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "afternoon-water",
    type: "water",
    title: "Hydration Check",
    description: "Remember to stay hydrated! Log your water intake.",
    time: "15:00",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "dinner-log",
    type: "diet",
    title: "Dinner Logging",
    description: "Log your dinner to complete your daily nutrition tracking.",
    time: "19:30",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "evening-exercise",
    type: "exercise",
    title: "Exercise Reminder",
    description: "Did you get any physical activity today? Log your exercise.",
    time: "20:00",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "sleep-prep",
    type: "sleep",
    title: "Sleep Preparation",
    description: "Time to wind down! Log yesterday's sleep and prepare for tonight.",
    time: "21:30",
    enabled: true,
    frequency: "daily",
  },
  {
    id: "medication-morning",
    type: "medication",
    title: "Morning Medication",
    description: "Don't forget to take your morning medications.",
    time: "08:30",
    enabled: false, // Disabled by default, user can enable
    frequency: "daily",
  },
  {
    id: "medication-evening",
    type: "medication",
    title: "Evening Medication",
    description: "Time for your evening medications.",
    time: "20:30",
    enabled: false,
    frequency: "daily",
  },
]

const ALERT_STORAGE_KEY = "mcs-alert-preferences"
const TRIGGERED_ALERTS_KEY = "mcs-triggered-alerts"

export function getAlertPreferences(): AlertPreferences {
  if (typeof window === "undefined") {
    return {
      enabled: true,
      schedules: DEFAULT_ALERT_SCHEDULES,
      snoozeMinutes: 30,
      maxAlertsPerDay: 10,
    }
  }

  try {
    const stored = localStorage.getItem(ALERT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        schedules: parsed.schedules.map((schedule: any) => ({
          ...schedule,
          lastTriggered: schedule.lastTriggered ? new Date(schedule.lastTriggered) : undefined,
        })),
      }
    }
  } catch (error) {
    console.error("Error loading alert preferences:", error)
  }

  return {
    enabled: true,
    schedules: DEFAULT_ALERT_SCHEDULES,
    snoozeMinutes: 30,
    maxAlertsPerDay: 10,
  }
}

export function saveAlertPreferences(preferences: AlertPreferences): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving alert preferences:", error)
  }
}

export function getTriggeredAlerts(): Alert[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(TRIGGERED_ALERTS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
      }))
    }
  } catch (error) {
    console.error("Error loading triggered alerts:", error)
  }

  return []
}

export function saveTriggeredAlerts(alerts: Alert[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(TRIGGERED_ALERTS_KEY, JSON.stringify(alerts))
  } catch (error) {
    console.error("Error saving triggered alerts:", error)
  }
}

export function shouldTriggerAlert(schedule: AlertSchedule): boolean {
  if (!schedule.enabled) return false

  const now = new Date()
  const [hours, minutes] = schedule.time.split(":").map(Number)

  // Create target time for today
  const targetTime = new Date()
  targetTime.setHours(hours, minutes, 0, 0)

  // For daily reminders
  if (schedule.frequency === "daily") {
    // If target time has passed today and we haven't triggered yet today
    if (now >= targetTime) {
      if (!schedule.lastTriggered) return true

      const lastTriggeredDate = new Date(schedule.lastTriggered)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastTriggeredDate.setHours(0, 0, 0, 0)

      // Check if we haven't triggered today
      return lastTriggeredDate < today
    }
  }

  // For weekly reminders
  else if (schedule.frequency === "weekly" && schedule.customDays) {
    const dayOfWeek = now.getDay()

    // Check if today is one of the selected days
    if (schedule.customDays.includes(dayOfWeek)) {
      // If target time has passed today and we haven't triggered yet today
      if (now >= targetTime) {
        if (!schedule.lastTriggered) return true

        const lastTriggeredDate = new Date(schedule.lastTriggered)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        lastTriggeredDate.setHours(0, 0, 0, 0)

        // Check if we haven't triggered today
        return lastTriggeredDate < today
      }
    }
  }

  // For custom date reminders
  else if (schedule.frequency === "custom" && schedule.customDays && schedule.customDays.length > 0) {
    const customDate = new Date(schedule.customDays[0])
    const today = new Date()

    // Check if today is the custom date
    if (
      customDate.getDate() === today.getDate() &&
      customDate.getMonth() === today.getMonth() &&
      customDate.getFullYear() === today.getFullYear()
    ) {
      // If target time has passed today and we haven't triggered yet
      if (now >= targetTime) {
        if (!schedule.lastTriggered) return true

        const lastTriggeredDate = new Date(schedule.lastTriggered)
        today.setHours(0, 0, 0, 0)
        lastTriggeredDate.setHours(0, 0, 0, 0)

        // Check if we haven't triggered today
        return lastTriggeredDate < today
      }
    }
  }

  return false
}

export function createAlertFromSchedule(schedule: AlertSchedule): Alert {
  const alertTypeMap = {
    diet: "nutrition-specialist",
    sleep: "mental-specialist",
    medication: "cardio-specialist",
    exercise: "sports-specialist",
    mood: "mental-specialist",
    symptoms: "cardio-specialist",
    water: "nutrition-specialist",
    custom: "cardio-specialist", // Default for custom type
  }

  return {
    id: uuidv4(),
    title: schedule.title,
    description: schedule.description,
    severity: "medium",
    read: false,
    createdAt: new Date(),
    agentId: alertTypeMap[schedule.type],
    noteId: schedule.noteId,
  }
}

export function checkAndTriggerAlerts(): Alert[] {
  const preferences = getAlertPreferences()
  if (!preferences.enabled) return []

  const triggeredAlerts = getTriggeredAlerts()
  const newAlerts: Alert[] = []

  // Check daily alert limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayAlerts = triggeredAlerts.filter((alert) => {
    const alertDate = new Date(alert.createdAt)
    alertDate.setHours(0, 0, 0, 0)
    return alertDate.getTime() === today.getTime()
  })

  if (todayAlerts.length >= preferences.maxAlertsPerDay) {
    return []
  }

  for (const schedule of preferences.schedules) {
    if (shouldTriggerAlert(schedule)) {
      const alert = createAlertFromSchedule(schedule)
      newAlerts.push(alert)

      // Update last triggered time
      schedule.lastTriggered = new Date()
    }
  }

  if (newAlerts.length > 0) {
    // Save updated preferences with new lastTriggered times
    saveAlertPreferences(preferences)

    // Save new alerts
    const allAlerts = [...triggeredAlerts, ...newAlerts]
    saveTriggeredAlerts(allAlerts)
  }

  return newAlerts
}

export function snoozeAlert(alertId: string, minutes: number): void {
  // Implementation for snoozing alerts
  // This could create a delayed trigger or modify the schedule
  console.log(`Snoozing alert ${alertId} for ${minutes} minutes`)
}

export function dismissAlert(alertId: string): void {
  const alerts = getTriggeredAlerts()
  const updatedAlerts = alerts.map((alert) => (alert.id === alertId ? { ...alert, read: true } : alert))
  saveTriggeredAlerts(updatedAlerts)
}

export function createReminderFromNote(
  noteId: string,
  title: string,
  description: string,
  date: Date,
  time: string,
  type: "diet" | "sleep" | "medication" | "exercise" | "mood" | "symptoms" | "water" | "custom" = "custom",
): void {
  const preferences = getAlertPreferences()

  // Create a new reminder
  const newReminder: AlertSchedule = {
    id: uuidv4(),
    type,
    title,
    description,
    time,
    enabled: true,
    frequency: "custom",
    customDays: [date.getTime()],
    noteId,
  }

  // Add the reminder to preferences
  preferences.schedules.push(newReminder)

  // Save updated preferences
  saveAlertPreferences(preferences)
}
