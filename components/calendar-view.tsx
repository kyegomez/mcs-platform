"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Pin, Tag } from "lucide-react"
import type { Note } from "@/types/agent"
import type { AlertSchedule } from "@/lib/alert-system"

interface CalendarViewProps {
  notes: Note[]
  reminders: AlertSchedule[]
  onSelectDate: (date: Date) => void
  onViewNote: (note: Note) => void
}

export function CalendarView({ notes, reminders, onSelectDate, onViewNote }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

  // Get the current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Get the number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get the number of days in the previous month
  const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Generate days for the calendar grid
  const calendarDays = []

  // Add days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPreviousMonth - i,
      currentMonth: false,
      date: new Date(currentYear, currentMonth - 1, daysInPreviousMonth - i),
    })
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
      date: new Date(currentYear, currentMonth, i),
      isToday: new Date().toDateString() === new Date(currentYear, currentMonth, i).toDateString(),
    })
  }

  // Add days from next month
  const remainingDays = 42 - calendarDays.length // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i),
    })
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Check if a date has notes
  const getNotesForDate = (date: Date) => {
    return notes.filter((note) => {
      const noteDate = new Date(note.createdAt)
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Check if a date has reminders
  const getRemindersForDate = (date: Date) => {
    return reminders.filter((reminder) => {
      if (!reminder.enabled) return false

      // For daily reminders, they apply to every day
      if (reminder.frequency === "daily") return true

      // For weekly reminders, check if the day of week matches
      if (reminder.frequency === "weekly") {
        const dayOfWeek = date.getDay()
        return reminder.customDays?.includes(dayOfWeek) || false
      }

      // For custom reminders, check if the date matches any in the custom days
      if (reminder.frequency === "custom" && reminder.customDays) {
        for (const day of reminder.customDays) {
          const reminderDate = new Date(day)
          if (
            reminderDate.getDate() === date.getDate() &&
            reminderDate.getMonth() === date.getMonth() &&
            reminderDate.getFullYear() === date.getFullYear()
          ) {
            return true
          }
        }
      }

      return false
    })
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onSelectDate(date)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get the month and year for display
  const monthYearDisplay = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Day names for the calendar header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{monthYearDisplay}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg overflow-hidden glass-card border border-white/10">
        {/* Day Names */}
        <div className="grid grid-cols-7 bg-black/30">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateNotes = getNotesForDate(day.date)
            const dateReminders = getRemindersForDate(day.date)
            const hasItems = dateNotes.length > 0 || dateReminders.length > 0

            return (
              <div
                key={index}
                className={`min-h-24 p-1 border border-white/5 ${
                  day.currentMonth ? "bg-transparent" : "bg-black/30 text-gray-500"
                } ${
                  selectedDate &&
                  selectedDate.getDate() === day.date.getDate() &&
                  selectedDate.getMonth() === day.date.getMonth() &&
                  selectedDate.getFullYear() === day.date.getFullYear()
                    ? "ring-2 ring-mcs-blue ring-inset"
                    : ""
                }`}
                onClick={() => handleDateClick(day.date)}
              >
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full mb-1 mx-auto ${
                    day.isToday ? "bg-mcs-blue text-white" : ""
                  }`}
                >
                  {day.day}
                </div>

                {/* Notes and Reminders Indicators */}
                <div className="space-y-1">
                  {dateNotes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dateNotes.slice(0, 2).map((note) => (
                        <div
                          key={note.id}
                          className="text-xs p-1 rounded cursor-pointer truncate hover:bg-white/5"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingNote(note)
                          }}
                          style={{
                            backgroundColor: {
                              blue: "rgba(59, 130, 246, 0.1)",
                              green: "rgba(16, 185, 129, 0.1)",
                              yellow: "rgba(245, 158, 11, 0.1)",
                              red: "rgba(239, 68, 68, 0.1)",
                              purple: "rgba(139, 92, 246, 0.1)",
                              pink: "rgba(236, 72, 153, 0.1)",
                              gray: "rgba(107, 114, 128, 0.1)",
                            }[note.color],
                            borderLeft: `2px solid ${
                              {
                                blue: "rgb(59, 130, 246)",
                                green: "rgb(16, 185, 129)",
                                yellow: "rgb(245, 158, 11)",
                                red: "rgb(239, 68, 68)",
                                purple: "rgb(139, 92, 246)",
                                pink: "rgb(236, 72, 153)",
                                gray: "rgb(107, 114, 128)",
                              }[note.color]
                            }`,
                          }}
                        >
                          {note.title.length > 10 ? note.title.substring(0, 10) + "..." : note.title}
                        </div>
                      ))}
                      {dateNotes.length > 2 && (
                        <div className="text-xs p-1 rounded bg-white/5 text-gray-400">+{dateNotes.length - 2} more</div>
                      )}
                    </div>
                  )}

                  {dateReminders.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dateReminders.slice(0, 2).map((reminder) => (
                        <div
                          key={reminder.id}
                          className="text-xs p-1 rounded truncate bg-mcs-blue/10 border-l-2 border-mcs-blue"
                        >
                          {reminder.time}
                        </div>
                      ))}
                      {dateReminders.length > 2 && (
                        <div className="text-xs p-1 rounded bg-white/5 text-gray-400">
                          +{dateReminders.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Note Preview Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{viewingNote?.title}</DialogTitle>
          </DialogHeader>

          {viewingNote && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {viewingNote.category}
                </Badge>
                {viewingNote.pinned && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10">
                    <Pin className="h-3 w-3 mr-1" /> Pinned
                  </Badge>
                )}
                <div className="text-xs text-gray-400">
                  {new Date(viewingNote.createdAt).toLocaleDateString()} at{" "}
                  {new Date(viewingNote.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="whitespace-pre-wrap text-white bg-white/5 p-4 rounded-lg">{viewingNote.content}</div>

              {viewingNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingNote.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-gray-300 border-gray-600">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewingNote(null)}>
                  Close
                </Button>
                <Button onClick={() => onViewNote(viewingNote)} className="btn-primary">
                  Edit Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
