"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Note } from "@/types/agent"
import { Edit, Trash, Pin, PinOff, Calendar, Paperclip, Tag, Bell } from "lucide-react"
import { FilePreview } from "./file-upload"
import { createReminderFromNote } from "@/lib/alert-system"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("12:00")
  const [reminderType, setReminderType] = useState<
    "diet" | "sleep" | "medication" | "exercise" | "mood" | "symptoms" | "water" | "custom"
  >("custom")

  const colorClasses = {
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-green-500/30 bg-green-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
    red: "border-red-500/30 bg-red-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    pink: "border-pink-500/30 bg-pink-500/5",
    gray: "border-gray-500/30 bg-gray-500/5",
  }

  const truncatedContent = note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content

  const handleSetReminder = () => {
    if (!reminderDate || !reminderTime) return

    const date = new Date(reminderDate)

    createReminderFromNote(
      note.id,
      `Reminder: ${note.title}`,
      `Review your note: ${note.title}`,
      date,
      reminderTime,
      reminderType,
    )

    setIsReminderDialogOpen(false)
  }

  // Determine reminder type based on note category
  const getReminderTypeFromCategory = () => {
    const category = note.category.toLowerCase()
    if (category.includes("diet") || category.includes("nutrition")) return "diet"
    if (category.includes("sleep")) return "sleep"
    if (category.includes("medication")) return "medication"
    if (category.includes("exercise") || category.includes("activity")) return "exercise"
    if (category.includes("mood") || category.includes("mental")) return "mood"
    if (category.includes("symptom")) return "symptoms"
    if (category.includes("water") || category.includes("hydration")) return "water"
    return "custom"
  }

  // Set default values when opening reminder dialog
  const openReminderDialog = () => {
    // Set tomorrow as default date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setReminderDate(tomorrow.toISOString().split("T")[0])

    // Set a reasonable default time
    setReminderTime("09:00")

    // Set type based on note category
    setReminderType(getReminderTypeFromCategory())

    setIsReminderDialogOpen(true)
  }

  return (
    <Card
      className={`glass-card hover-glow group relative ${colorClasses[note.color as keyof typeof colorClasses] || colorClasses.gray}`}
    >
      {note.pinned && (
        <div className="absolute top-3 right-3 z-10">
          <Pin className="h-4 w-4 text-yellow-400 fill-current" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white line-clamp-2 flex-1">{note.title}</h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={openReminderDialog}
              className="h-8 w-8 p-0 text-gray-400 hover:text-mcs-blue"
              title="Set reminder"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(note.id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400"
              title={note.pinned ? "Unpin" : "Pin"}
            >
              {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{note.updatedAt.toLocaleDateString()}</span>
          {note.attachments.length > 0 && (
            <>
              <span>•</span>
              <Paperclip className="h-3 w-3" />
              <span>{note.attachments.length} files</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300 leading-relaxed">
          <div className="whitespace-pre-wrap">{showFullContent ? note.content : truncatedContent}</div>
          {note.content.length > 150 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-mcs-blue hover:text-mcs-blue-light text-xs mt-2 underline"
            >
              {showFullContent ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 border-gray-600 text-gray-300">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {note.attachments.length > 0 && <FilePreview files={note.attachments} onRemove={() => {}} editable={false} />}

        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
            {note.category}
          </Badge>
          <span className="text-xs text-gray-500">
            {note.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </CardContent>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-white">Set Reminder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date</label>
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Time</label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Type</label>
              <Select value={reminderType} onValueChange={(value: any) => setReminderType(value)}>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetReminder} disabled={!reminderDate || !reminderTime} className="btn-primary">
                Set Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
