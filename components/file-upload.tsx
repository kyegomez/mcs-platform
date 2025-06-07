"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadFile, testSupabaseConnection } from "@/lib/supabase"
import type { FileAttachment } from "@/types/agent"
import { Upload, X, File, ImageIcon, FileText, Download, AlertCircle, CheckCircle, WifiOff } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function FileUpload({ onFilesUploaded, maxFiles = 5, acceptedTypes }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultAcceptedTypes = [
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

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection()
        setConnectionStatus(result.success ? "connected" : "disconnected")
        if (!result.success) {
          setError(result.message)
        }
      } catch (error) {
        setConnectionStatus("disconnected")
        setError("Failed to connect to storage service")
      }
    }

    checkConnection()
  }, [])

  const validateFile = (file: File): string | null => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds 10MB limit`
    }

    // Check file type
    const allowedTypes = acceptedTypes || defaultAcceptedTypes
    if (!allowedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported`
    }

    return null
  }

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    const uploadedFiles: FileAttachment[] = []
    const totalFiles = Math.min(files.length, maxFiles)
    const errors: string[] = []

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i]

        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(validationError)
          continue
        }

        try {
          // Upload to Supabase
          const url = await uploadFile(file)

          const fileAttachment: FileAttachment = {
            id: uuidv4(),
            name: file.name,
            type: file.type,
            size: file.size,
            url,
            uploadedAt: new Date(),
          }

          uploadedFiles.push(fileAttachment)
          setUploadProgress(((i + 1) / totalFiles) * 100)
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown upload error"
          errors.push(`Failed to upload "${file.name}": ${errorMessage}`)
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles)
      }

      if (errors.length > 0) {
        setError(errors.join("\n"))
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload files. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const retryConnection = async () => {
    setConnectionStatus("checking")
    setError(null)

    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result.success ? "connected" : "disconnected")
      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      setError("Failed to connect to storage service")
    }
  }

  const isDisabled = uploading || connectionStatus !== "connected"

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        {connectionStatus === "checking" && (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-mcs-blue border-t-transparent rounded-full" />
            <span className="text-gray-400">Checking storage connection...</span>
          </>
        )}
        {connectionStatus === "connected" && (
          <>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-green-400">Storage connected</span>
          </>
        )}
        {connectionStatus === "disconnected" && (
          <>
            <WifiOff className="h-4 w-4 text-red-400" />
            <span className="text-red-400">Storage disconnected</span>
            <Button variant="ghost" size="sm" onClick={retryConnection} className="text-xs">
              Retry
            </Button>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400 whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive ? "border-mcs-blue bg-mcs-blue/5" : "border-gray-600 hover:border-gray-500"
        } ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={defaultAcceptedTypes.join(",")}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isDisabled}
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-mcs-blue/20 to-mcs-blue-light/20 flex items-center justify-center">
            <Upload className="h-6 w-6 text-mcs-blue" />
          </div>

          <div>
            <p className="text-lg font-medium text-white mb-2">
              {dragActive
                ? "Drop files here"
                : connectionStatus === "connected"
                  ? "Upload documents"
                  : "Storage unavailable"}
            </p>
            <p className="text-sm text-gray-400">
              {connectionStatus === "connected"
                ? "Drag and drop files here, or click to browse"
                : "Please check your Supabase configuration"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports images, PDFs, documents (max {maxFiles} files, 10MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Uploading...</span>
            <span className="text-mcs-blue">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}

interface FilePreviewProps {
  files: FileAttachment[]
  onRemove: (fileId: string) => void
  editable?: boolean
}

export function FilePreview({ files, onRemove, editable = true }: FilePreviewProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-400" />
    if (type === "application/pdf") return <FileText className="h-5 w-5 text-red-400" />
    return <File className="h-5 w-5 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300">Attachments ({files.length})</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map((file) => (
          <div key={file.id} className="glass-card p-3 rounded-lg group">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, "_blank")}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(file.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
