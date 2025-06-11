import { v4 as uuidv4 } from "uuid"
import { createReminderFromNote } from "./alert-system"

export interface HealthGoal {
  id: string
  title: string
  description: string
  category: "weight" | "exercise" | "diet" | "sleep" | "mental" | "medication" | "custom"
  targetValue?: number
  currentValue?: number
  unit?: string
  targetDate: Date
  createdAt: Date
  updatedAt: Date
  status: "active" | "completed" | "paused" | "overdue"
  checkInFrequency: "daily" | "weekly" | "biweekly" | "monthly"
  lastCheckIn?: Date
  progress: number // 0-100 percentage
  milestones: GoalMilestone[]
  notes: string[]
}

export interface GoalMilestone {
  id: string
  title: string
  targetValue: number
  achievedAt?: Date
  isCompleted: boolean
}

export interface GoalCheckIn {
  id: string
  goalId: string
  value: number
  notes: string
  createdAt: Date
  mood?: number // 1-10 scale
}

const GOALS_STORAGE_KEY = "mcs-health-goals"
const GOAL_CHECKINS_STORAGE_KEY = "mcs-goal-checkins"

export function getHealthGoals(): HealthGoal[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((goal: any) => ({
        ...goal,
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        lastCheckIn: goal.lastCheckIn ? new Date(goal.lastCheckIn) : undefined,
        milestones: goal.milestones.map((m: any) => ({
          ...m,
          achievedAt: m.achievedAt ? new Date(m.achievedAt) : undefined,
        })),
      }))
    }
  } catch (error) {
    console.error("Error loading health goals:", error)
  }

  return []
}

export function saveHealthGoals(goals: HealthGoal[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch (error) {
    console.error("Error saving health goals:", error)
  }
}

export function createHealthGoal(
  goalData: Omit<HealthGoal, "id" | "createdAt" | "updatedAt" | "status" | "progress" | "milestones" | "notes">,
): HealthGoal {
  const newGoal: HealthGoal = {
    ...goalData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    progress: 0,
    milestones: [],
    notes: [],
  }

  const goals = getHealthGoals()
  goals.push(newGoal)
  saveHealthGoals(goals)

  // Create initial check-in reminder
  scheduleGoalCheckIn(newGoal)

  return newGoal
}

export function updateHealthGoal(goalId: string, updates: Partial<HealthGoal>): void {
  const goals = getHealthGoals()
  const goalIndex = goals.findIndex((g) => g.id === goalId)

  if (goalIndex !== -1) {
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updates,
      updatedAt: new Date(),
    }

    // Recalculate progress if values changed
    if (updates.currentValue !== undefined || updates.targetValue !== undefined) {
      goals[goalIndex].progress = calculateGoalProgress(goals[goalIndex])
    }

    saveHealthGoals(goals)
  }
}

export function deleteHealthGoal(goalId: string): void {
  const goals = getHealthGoals()
  const filteredGoals = goals.filter((g) => g.id !== goalId)
  saveHealthGoals(filteredGoals)
}

export function calculateGoalProgress(goal: HealthGoal): number {
  if (!goal.targetValue || !goal.currentValue) return 0

  const progress = (goal.currentValue / goal.targetValue) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function addGoalCheckIn(goalId: string, value: number, notes: string, mood?: number): void {
  const checkIn: GoalCheckIn = {
    id: uuidv4(),
    goalId,
    value,
    notes,
    createdAt: new Date(),
    mood,
  }

  // Save check-in
  const checkIns = getGoalCheckIns()
  checkIns.push(checkIn)
  saveGoalCheckIns(checkIns)

  // Update goal with new current value and last check-in
  updateHealthGoal(goalId, {
    currentValue: value,
    lastCheckIn: new Date(),
  })

  // Schedule next check-in reminder
  const goals = getHealthGoals()
  const goal = goals.find((g) => g.id === goalId)
  if (goal) {
    scheduleGoalCheckIn(goal)
  }
}

export function getGoalCheckIns(): GoalCheckIn[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(GOAL_CHECKINS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((checkIn: any) => ({
        ...checkIn,
        createdAt: new Date(checkIn.createdAt),
      }))
    }
  } catch (error) {
    console.error("Error loading goal check-ins:", error)
  }

  return []
}

export function saveGoalCheckIns(checkIns: GoalCheckIn[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(GOAL_CHECKINS_STORAGE_KEY, JSON.stringify(checkIns))
  } catch (error) {
    console.error("Error saving goal check-ins:", error)
  }
}

export function scheduleGoalCheckIn(goal: HealthGoal): void {
  const now = new Date()
  const nextCheckIn = new Date()

  // Calculate next check-in date based on frequency
  switch (goal.checkInFrequency) {
    case "daily":
      nextCheckIn.setDate(now.getDate() + 1)
      break
    case "weekly":
      nextCheckIn.setDate(now.getDate() + 7)
      break
    case "biweekly":
      nextCheckIn.setDate(now.getDate() + 14)
      break
    case "monthly":
      nextCheckIn.setMonth(now.getMonth() + 1)
      break
  }

  // Set check-in time to 9 AM
  nextCheckIn.setHours(9, 0, 0, 0)

  // Create reminder alert
  const title = `${goal.title} Progress Check-in`
  const description = `Time to update your progress on "${goal.title}". How are you doing with your ${goal.category} goal?`

  createReminderFromNote(goal.id, title, description, nextCheckIn, "09:00", "custom")
}

export function getGoalsByStatus(status: HealthGoal["status"]): HealthGoal[] {
  return getHealthGoals().filter((goal) => goal.status === status)
}

export function getOverdueGoals(): HealthGoal[] {
  const now = new Date()
  return getHealthGoals().filter((goal) => goal.status === "active" && goal.targetDate < now)
}

export function updateGoalStatuses(): void {
  const goals = getHealthGoals()
  const now = new Date()
  let hasUpdates = false

  goals.forEach((goal) => {
    if (goal.status === "active" && goal.targetDate < now && goal.progress < 100) {
      goal.status = "overdue"
      hasUpdates = true
    } else if (goal.progress >= 100 && goal.status !== "completed") {
      goal.status = "completed"
      hasUpdates = true
    }
  })

  if (hasUpdates) {
    saveHealthGoals(goals)
  }
}

export const goalCategories = [
  { value: "weight", label: "Weight Management", icon: "⚖️", color: "from-green-500 to-green-600" },
  { value: "exercise", label: "Exercise & Fitness", icon: "💪", color: "from-blue-500 to-blue-600" },
  { value: "diet", label: "Diet & Nutrition", icon: "🥗", color: "from-orange-500 to-orange-600" },
  { value: "sleep", label: "Sleep Quality", icon: "😴", color: "from-purple-500 to-purple-600" },
  { value: "mental", label: "Mental Health", icon: "🧠", color: "from-pink-500 to-pink-600" },
  { value: "medication", label: "Medication", icon: "💊", color: "from-red-500 to-red-600" },
  { value: "custom", label: "Custom Goal", icon: "🎯", color: "from-gray-500 to-gray-600" },
] as const

export const checkInFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
] as const
