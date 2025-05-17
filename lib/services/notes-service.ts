import { getSupabaseClient } from "@/lib/supabase/client"
import type { Note } from "@/types/agent"

// Client-side notes service
export const notesService = {
  // Get all notes for a user
  async getUserNotes(userId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching notes:", error)
      throw error
    }

    return data.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
    })) as Note[]
  },

  // Create a new note
  async createNote(userId: string, note: { title: string; content: string }) {
    const supabase = getSupabaseClient()

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: note.title,
        content: note.content,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating note:", error)
      throw error
    }

    return {
      id: data.id,
      title: note.title,
      content: note.content,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    } as Note
  },

  // Update an existing note
  async updateNote(noteId: string, updates: { title?: string; content?: string }) {
    const supabase = getSupabaseClient()

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("notes").update(updateData).eq("id", noteId).select("*").single()

    if (error) {
      console.error("Error updating note:", error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    } as Note
  },

  // Delete a note
  async deleteNote(noteId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("notes").delete().eq("id", noteId)

    if (error) {
      console.error("Error deleting note:", error)
      throw error
    }

    return true
  },
}
