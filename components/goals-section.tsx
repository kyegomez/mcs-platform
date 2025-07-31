"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getHealthGoals,
  createHealthGoal,
  deleteHealthGoal,
  addGoalCheckIn,
  updateGoalStatuses,
  goalCategories,
  checkInFrequencies,
  type HealthGoal,
} from "@/lib/goals-system"
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, Trash2, Activity } from "lucide-react"

export function GoalsSection() {
  const [goals, setGoals] = useState<HealthGoal[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null)
  const [checkInValue, setCheckInValue] = useState("")
  const [checkInNotes, setCheckInNotes] = useState("")
  const [checkInMood, setCheckInMood] = useState<number>(5)

  // Form state for creating goals
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "custom" as const,
    targetValue: "",
    currentValue: "",
    unit: "",
    targetDate: "",
    checkInFrequency: "weekly" as const,
  })

  useEffect(() => {
    loadGoals()

    // Update goal statuses on load
    updateGoalStatuses()

    // Set up interval to check goal statuses
    const interval = setInterval(() => {
      updateGoalStatuses()
      loadGoals()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const loadGoals = () => {
    const loadedGoals = getHealthGoals()
    setGoals(loadedGoals)
  }

  const handleCreateGoal = () => {
    if (!formData.title || !formData.targetDate) return

    const goalData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      targetValue: formData.targetValue ? Number(formData.targetValue) : undefined,
      currentValue: formData.currentValue ? Number(formData.currentValue) : 0,
      unit: formData.unit,
      targetDate: new Date(formData.targetDate),
      checkInFrequency: formData.checkInFrequency,
    }

    createHealthGoal(goalData)
    loadGoals()
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleCheckIn = () => {
    if (!selectedGoal || !checkInValue) return

    addGoalCheckIn(selectedGoal.id, Number(checkInValue), checkInNotes, checkInMood)

    loadGoals()
    setIsCheckInDialogOpen(false)
    setSelectedGoal(null)
    setCheckInValue("")
    setCheckInNotes("")
    setCheckInMood(5)
  }

  const handleDeleteGoal = (goalId: string) => {
    deleteHealthGoal(goalId)
    loadGoals()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "custom",
      targetValue: "",
      currentValue: "",
      unit: "",
      targetDate: "",
      checkInFrequency: "weekly",
    })
  }

  const getStatusColor = (status: HealthGoal["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "active":
        return "bg-mcs-blue/20 text-mcs-blue border-mcs-blue/50"
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getStatusIcon = (status: HealthGoal["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "active":
        return <Activity className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      case "paused":
        return <Clock className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getDaysUntilTarget = (targetDate: Date) => {
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getCategoryInfo = (category: string) => {
    return goalCategories.find((cat) => cat.value === category) || goalCategories[goalCategories.length - 1]
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const overdueGoals = goals.filter((g) => g.status === "overdue")

  return (
    <div className="space-y-6">
      {/* Goals Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-mcs-blue" />
          <h2 className="text-xl font-medium text-foreground">Health Goals</h2>
          {goals.length > 0 && (
            <Badge className="bg-mcs-blue/20 text-mcs-blue border-mcs-blue/50">{activeGoals.length} active</Badge>
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Health Goal</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Goal Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Lose 10 pounds"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal and motivation..."
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {goalCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="text-white">
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Check-in Frequency</Label>
                  <Select
                    value={formData.checkInFrequency}
                    onValueChange={(value: any) => setFormData({ ...formData, checkInFrequency: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {checkInFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value} className="text-white">
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Target Value</Label>
                  <Input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    placeholder="150"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Current Value</Label>
                  <Input
                    type="number"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="160"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Unit</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="lbs"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Target Date</Label>
                <Input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateGoal} className="btn-primary flex-1">
                  Create Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-mcs-blue/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light text-mcs-blue mb-1">{activeGoals.length}</div>
              <p className="text-sm text-gray-400 font-light">Active Goals</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-500/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light text-green-400 mb-1">{completedGoals.length}</div>
              <p className="text-sm text-gray-400 font-light">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-red-500/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light text-red-400 mb-1">{overdueGoals.length}</div>
              <p className="text-sm text-gray-400 font-light">Overdue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="border-0 bg-white/5">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Health Goals Yet</h3>
            <p className="text-gray-400 font-light mb-4">
              Set your first health goal to start tracking your progress and receive helpful reminders.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            const daysUntilTarget = getDaysUntilTarget(goal.targetDate)

            return (
              <Card key={goal.id} className="border-0 bg-white/5 hover:bg-white/10 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-lg`}
                      >
                        {categoryInfo.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{goal.title}</h3>
                        <p className="text-sm text-gray-400 font-light mb-2">{goal.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(goal.status)}>
                            {getStatusIcon(goal.status)}
                            <span className="ml-1 capitalize">{goal.status}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            {categoryInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGoal(goal)
                          setIsCheckInDialogOpen(true)
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-foreground font-medium">{Math.round(goal.progress)}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current: </span>
                        <span className="text-foreground">
                          {goal.currentValue || 0} {goal.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Target: </span>
                        <span className="text-foreground">
                          {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {daysUntilTarget > 0
                            ? `${daysUntilTarget} days left`
                            : daysUntilTarget === 0
                              ? "Due today"
                              : `${Math.abs(daysUntilTarget)} days overdue`}
                        </span>
                      </div>
                      <div className="text-gray-400">Check-in: {goal.checkInFrequency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Progress Check-in</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <h3 className="font-medium text-foreground mb-1">{selectedGoal.title}</h3>
                <p className="text-sm text-gray-400">How are you progressing with your goal?</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Current Value</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={checkInValue}
                    onChange={(e) => setCheckInValue(e.target.value)}
                    placeholder={`Current ${selectedGoal.unit || "value"}`}
                    className="bg-white/5 border-white/10 text-white flex-1"
                  />
                  <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-md">
                    <span className="text-gray-400 text-sm">{selectedGoal.unit}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">How are you feeling? (1-10)</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInMood}
                  onChange={(e) => setCheckInMood(Number(e.target.value))}
                  className="bg-white/5 border-white/10"
                />
                <div className="text-center text-sm text-gray-400">{checkInMood}/10</div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Notes (optional)</Label>
                <Textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="How did this week go? Any challenges or wins?"
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCheckIn} className="btn-primary flex-1">
                  Save Check-in
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckInDialogOpen(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
