import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if bucket exists and create if needed
export async function ensureBucketExists(bucketName = "health-documents"): Promise<boolean> {
  try {
    // Try to get bucket info
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return false
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Try to create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return false
      }

      console.log("Bucket created successfully:", data)
    }

    return true
  } catch (error) {
    console.error("Error ensuring bucket exists:", error)
    return false
  }
}

// File upload function with better error handling
export async function uploadFile(file: File, bucket = "health-documents"): Promise<string> {
  try {
    // Ensure bucket exists
    const bucketReady = await ensureBucketExists(bucket)
    if (!bucketReady) {
      throw new Error("Storage bucket is not available. Please check your Supabase configuration.")
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit")
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`)
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    console.log("Uploading file:", { fileName, fileSize: file.size, fileType: file.type })

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error details:", error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file")
    }

    console.log("File uploaded successfully:", urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

// Delete file function with better error handling
export async function deleteFile(url: string, bucket = "health-documents"): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = url.split("/")
    const bucketIndex = urlParts.findIndex((part) => part === bucket)

    if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
      throw new Error("Invalid file URL format")
    }

    // Get the path after the bucket name
    const filePath = urlParts.slice(bucketIndex + 1).join("/")

    console.log("Deleting file:", { filePath, bucket })

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("Delete error details:", error)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log("File deleted successfully")
  } catch (error) {
    console.error("Delete error:", error)
    throw error
  }
}

// Test connection function
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      }
    }

    return {
      success: true,
      message: `Connected successfully. Found ${data?.length || 0} buckets.`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
