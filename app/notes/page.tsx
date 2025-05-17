"use client"

import { useState, useEffect } from "react"
import type { Note } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash, Save, X, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { notesService } from "@/lib/services/notes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NotesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadNotes = async () => {
      setIsLoading(true)
      try {
        const userNotes = await notesService.getUserNotes(user.id)
        setNotes(userNotes)
      } catch (error) {
        console.error("Error loading notes:", error)
        setError("Failed to load notes. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [user])

  const handleAddNote = async () => {
    if (!title.trim() || !user) return

    setIsSaving(true)
    setError(null)

    try {
      const newNote = await notesService.createNote(user.id, {
        title: title.trim(),
        content: content.trim(),
      })

      setNotes([newNote, ...notes])
      setTitle("")
      setContent("")
    } catch (error) {
      console.error("Error adding note:", error)
      setError("Failed to add note. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id)
      setNotes(notes.filter((note) => note.id !== id))
    } catch (error) {
      console.error("Error deleting note:", error)
      setError("Failed to delete note. Please try again.")
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return

    setIsSaving(true)
    setError(null)

    try {
      const updatedNote = await notesService.updateNote(id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })

      setNotes(notes.map((note) => (note.id === id ? updatedNote : note)))
      setEditingId(null)
    } catch (error) {
      console.error("Error updating note:", error)
      setError("Failed to update note. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcs-blue mx-auto"></div>
          <p className="mt-4 text-mcs-gray-light">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md bg-black border-mcs-gray">
          <CardHeader>
            <CardTitle className="text-xl text-center">Not Logged In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-mcs-gray-light mb-4">You need to be logged in to view and manage notes.</p>
            <Button asChild className="bg-mcs-blue hover:bg-mcs-blue-light text-white">
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Health Notes</h1>
        <p className="text-mcs-gray-light">Keep track of your symptoms, feelings, and health observations.</p>
      </div>

      {error && (
        <Alert className="mb-4 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-black border-mcs-gray">
        <CardHeader>
          <CardTitle className="text-xl">Add New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="How are you feeling today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAddNote}
            disabled={!title.trim() || isSaving}
            className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Your Notes</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mcs-blue"></div>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-mcs-gray-light">No notes yet. Add your first note above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="bg-black border-mcs-gray">
                <CardHeader className="pb-2">
                  {editingId === note.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  ) : (
                    <CardTitle>{note.title}</CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  {editingId === note.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="resize-none bg-mcs-gray border-mcs-gray focus-visible:ring-mcs-blue"
                    />
                  ) : (
                    <p className="text-mcs-gray-light whitespace-pre-wrap">{note.content || "No content"}</p>
                  )}
                  <p className="text-xs text-mcs-gray-light mt-4">
                    {note.updatedAt.toLocaleDateString()} at{" "}
                    {note.updatedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {editingId === note.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                        className="text-mcs-gray-light hover:text-white"
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(note.id)}
                        disabled={!editTitle.trim() || isSaving}
                        className="bg-mcs-blue hover:bg-mcs-blue-light text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" /> Save
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        className="text-mcs-gray-light hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
