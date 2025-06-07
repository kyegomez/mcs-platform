"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarView } from "@/components/calendar-view"
import { getAlertPreferences, type AlertSchedule } from "@/lib/alert-system"
import type { Note } from "@/types/agent"
import { Calendar, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [reminders, setReminders] = useState<AlertSchedule[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()

  // Load notes and reminders
  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("mcs-notes")
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          tags: note.tags || [],
          category: note.category || "General",
          attachments: note.attachments || [],
          color: note.color || "blue",
          pinned: note.pinned || false,
        }))
        setNotes(notesWithDates)
      } catch (error) {
        console.error("Error parsing notes:", error)
      }
    }

    // Load reminders from alert system
    const preferences = getAlertPreferences()
    setReminders(preferences.schedules)
  }, [])

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Handle note view/edit
  const handleViewNote = (note: Note) => {
    // Store the note ID to edit in localStorage
    localStorage.setItem("mcs-edit-note-id", note.id)
    // Navigate to notes page
    router.push("/notes")
  }

  // Create a new note for the selected date
  const createNoteForSelectedDate = () => {
    if (!selectedDate) return

    // Format the date
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Create a note template
    const noteData = {
      title: `Health Log - ${formattedDate}`,
      content: `Date: ${formattedDate}\n\nHealth observations:\n\n`,
      category: "General",
    }

    // Store the note data in localStorage for the notes page to pick up
    localStorage.setItem("mcs-pending-note", JSON.stringify(noteData))

    // Navigate to notes page
    router.push("/notes")
  }

  // Create a reminder for the selected date
  const createReminderForSelectedDate = () => {
    if (!selectedDate) return

    // Format the date for display
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Store the date in localStorage for the reminder creation page
    localStorage.setItem(
      "mcs-pending-reminder",
      JSON.stringify({
        date: selectedDate.toISOString(),
        formattedDate,
      }),
    )

    // Navigate to reminders page
    router.push("/reminders")
  }

  return (
    <div className="space-y-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Health Calendar</h1>
            <p className="text-gray-400">View and manage your health notes and reminders in a calendar format.</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedDate
                    ? `Create for ${selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "Create New"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => {
                    createNoteForSelectedDate()
                    setIsCreateDialogOpen(false)
                  }}
                  className="w-full btn-primary"
                  disabled={!selectedDate}
                >
                  Create Note
                </Button>
                <Button
                  onClick={() => {
                    createReminderForSelectedDate()
                    setIsCreateDialogOpen(false)
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={!selectedDate}
                >
                  Create Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar View */}
      <CalendarView notes={notes} reminders={reminders} onSelectDate={handleDateSelect} onViewNote={handleViewNote} />

      {/* Selected Date Actions */}
      {selectedDate && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-mcs-blue/20">
                  <Calendar className="h-5 w-5 text-mcs-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {notes.filter((note) => new Date(note.createdAt).toDateString() === selectedDate.toDateString())
                      .length > 0
                      ? `${
                          notes.filter(
                            (note) => new Date(note.createdAt).toDateString() === selectedDate.toDateString(),
                          ).length
                        } notes`
                      : "No notes for this date"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    createNoteForSelectedDate()
                  }}
                >
                  Add Note
                </Button>
                <Button
                  onClick={() => {
                    createReminderForSelectedDate()
                  }}
                  className="btn-primary"
                >
                  Set Reminder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
