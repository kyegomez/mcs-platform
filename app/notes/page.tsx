"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Note, FileAttachment } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc, Pin, Tag, X, ChevronDown, ChevronUp } from "lucide-react"
import { NoteCard } from "@/components/note-card"
import { FileUpload, FilePreview } from "@/components/file-upload"
// Supabase functionality removed - file deletion will be handled differently
import { useIsMobile } from "@/hooks/use-mobile"

const categories = [
  "Symptoms",
  "Medications",
  "Appointments",
  "Lab Results",
  "Exercise",
  "Diet",
  "Mental Health",
  "General",
]

const colors = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "yellow" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Gray", value: "gray" },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const isMobile = useIsMobile()

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("General")
  const [color, setColor] = useState("blue")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [attachments, setAttachments] = useState<FileAttachment[]>([])

  // Load notes from localStorage
  useEffect(() => {
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
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length >= 0) {
      localStorage.setItem("mcs-notes", JSON.stringify(notes))
      window.dispatchEvent(new Event("notesUpdated"))
    }
  }, [notes])

  // Handle pre-filled note from alerts
  useEffect(() => {
    const pendingNote = localStorage.getItem("mcs-pending-note")
    if (pendingNote) {
      try {
        const noteData = JSON.parse(pendingNote)
        setTitle(noteData.title || "")
        setContent(noteData.content || "")
        setCategory(noteData.category || "General")
        setIsDialogOpen(true)
        localStorage.removeItem("mcs-pending-note")
      } catch (error) {
        console.error("Error loading pending note:", error)
      }
    }

    // Check if we need to view a specific note
    const viewNoteId = localStorage.getItem("mcs-view-note-id")
    if (viewNoteId) {
      localStorage.removeItem("mcs-view-note-id")

      // Wait for notes to load
      setTimeout(() => {
        const noteToView = notes.find((note) => note.id === viewNoteId)
        if (noteToView) {
          handleEdit(noteToView)
        }
      }, 500)
    }

    // Check if we need to edit a specific note
    const editNoteId = localStorage.getItem("mcs-edit-note-id")
    if (editNoteId) {
      localStorage.removeItem("mcs-edit-note-id")

      // Wait for notes to load
      setTimeout(() => {
        const noteToEdit = notes.find((note) => note.id === editNoteId)
        if (noteToEdit) {
          handleEdit(noteToEdit)
        }
      }, 500)
    }
  }, [notes])

  // Filter and sort notes
  useEffect(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
      const matchesTag = selectedTag === "" || note.tags.includes(selectedTag)
      const matchesPinned = !showPinnedOnly || note.pinned

      return matchesSearch && matchesCategory && matchesTag && matchesPinned
    })

    // Sort notes
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === "date") {
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
      } else {
        comparison = a.title.localeCompare(b.title)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    // Pinned notes always come first
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })

    setFilteredNotes(filtered)
  }, [notes, searchQuery, selectedCategory, selectedTag, sortBy, sortOrder, showPinnedOnly])

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategory("General")
    setColor("blue")
    setTags([])
    setTagInput("")
    setAttachments([])
    setEditingNote(null)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category,
      color,
      tags,
      attachments,
    }

    if (editingNote) {
      // Update existing note
      setNotes(
        notes.map((note) => (note.id === editingNote.id ? { ...note, ...noteData, updatedAt: new Date() } : note)),
      )
    } else {
      // Create new note
      const newNote: Note = {
        id: uuidv4(),
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: false,
      }
      setNotes([newNote, ...notes])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category)
    setColor(note.color)
    setTags(note.tags)
    setAttachments(note.attachments)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    // File deletion temporarily disabled

    const updatedNotes = notes.filter((note) => note.id !== id)
    setNotes(updatedNotes)
  }

  const handleTogglePin = (id: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFilesUploaded = (newFiles: FileAttachment[]) => {
    setAttachments([...attachments, ...newFiles])
  }

  const removeAttachment = async (fileId: string) => {
    const file = attachments.find((f) => f.id === fileId)
    if (file) {
      // File deletion temporarily disabled
        setAttachments(attachments.filter((f) => f.id !== fileId))
    }
  }

  // Create note form component
  const NoteForm = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Title</label>
        <Input
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background/50 border-border/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((colorOption) => (
              <button
                key={colorOption.value}
                onClick={() => setColor(colorOption.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === colorOption.value ? "border-white scale-110" : "border-gray-600"
                }`}
                style={{
                  backgroundColor: {
                    blue: "#3b82f6",
                    green: "#10b981",
                    yellow: "#f59e0b",
                    red: "#ef4444",
                    purple: "#8b5cf6",
                    pink: "#ec4899",
                    gray: "#6b7280",
                  }[colorOption.value],
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Content</label>
        <Textarea
          placeholder="Write your note content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="resize-none bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Tags</label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="bg-background/50 border-border/50 focus-visible:ring-primary text-foreground text-base"
          />
          <Button type="button" onClick={addTag} variant="outline" className="shrink-0">
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-gray-300 border-gray-600">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Attachments</label>
        <FileUpload onFilesUploaded={handleFilesUploaded} />
        <FilePreview files={attachments} onRemove={removeAttachment} />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-white/10">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary w-full sm:w-auto">
          {editingNote ? "Update Note" : "Create Note"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6 relative px-4 sm:px-0">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="space-y-4 spring-bounce">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">Health Journal</h1>
            <p className="text-gray-400 text-sm sm:text-base mt-1">
              Document your health journey with notes, files, and insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isMobile ? (
              <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DrawerTrigger asChild>
                  <Button onClick={resetForm} className="btn-primary flex-1 sm:flex-none btn-interactive btn-mobile">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="glass-card max-h-[90vh]">
                  <DrawerHeader>
                    <DrawerTitle className="text-white">{editingNote ? "Edit Note" : "Create New Note"}</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 overflow-y-auto">
                    <NoteForm />
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="btn-primary btn-interactive">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
                  </DialogHeader>
                  <div className="pt-4">
                    <NoteForm />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card stagger-item">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search notes, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus-visible:ring-mcs-blue text-white text-sm sm:text-base focus-smooth btn-mobile"
                />
              </div>

              {/* Mobile Filter Toggle */}
              {isMobile && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-between btn-interactive btn-mobile"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters & Sort
                  </div>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}

              {/* Filters */}
              <div className={`${isMobile && !showFilters ? "hidden" : "flex"} flex-col sm:flex-row gap-2 flex-wrap`}>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 text-white focus-smooth">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {allTags.length > 0 && (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full sm:w-32 bg-white/5 border-white/10 text-white focus-smooth">
                      <Tag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                    className={`flex-1 sm:flex-none btn-interactive ${showPinnedOnly ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : ""}`}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    Pinned
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="btn-interactive"
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>

                  {!isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      className="btn-interactive"
                    >
                      {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"} found
          </p>
        </div>

        {filteredNotes.length === 0 ? (
          <Card className="glass-card stagger-item">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center elastic-scale">
                <Plus className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No notes found</h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                {notes.length === 0
                  ? "Start documenting your health journey by creating your first note."
                  : "No notes match your current filters. Try adjusting your search criteria."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="btn-primary btn-interactive">
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              isMobile || viewMode === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredNotes.map((note, index) => (
              <div key={note.id} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <NoteCard note={note} onEdit={handleEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
