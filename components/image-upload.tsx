"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, X, RefreshCw, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImageToSupabase, validateImageFile, generateSkuImagePath } from "@/lib/supabase-storage"

interface ImageUploadProps {
  value?: string // Current image URL
  onChange: (url: string | null, file: File | null) => void
  onFileChange?: (file: File | null) => void // Optional callback for file object
  skuId?: string // Optional SKU ID for permanent storage path
  disabled?: boolean
  className?: string
  showPreview?: boolean
  allowDelete?: boolean
  maxSizeMB?: number
  acceptedTypes?: string[]
  tempId?: string
  compact?: boolean
  onError?: (error: string) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  retryCount: number
}

const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export function ImageUpload({
  value,
  onChange,
  onFileChange,
  skuId,
  disabled = false,
  className,
  showPreview = true,
  allowDelete = true,
  maxSizeMB = 5,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  tempId,
  compact = false,
  onError,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    retryCount: 0,
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      retryCount: 0,
    })
  }, [])

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (disabled) {
        return
      }

      resetUploadState()
      setUploadState((prev) => ({ ...prev, isUploading: true, progress: 10 }))

      try {
        const validation = await validateImageFile(file)
        if (!validation.isValid) {
          // Keep: This log is directly related to a validation error
          console.log("🔍 ImageUpload DEBUG - File validation failed:", validation.error)
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            error: validation.error || "File validation failed",
          }))
          return
        }

        setUploadState((prev) => ({ ...prev, progress: 30 }))

        const uploadPath = generateSkuImagePath(skuId, file.name)

        setUploadState((prev) => ({ ...prev, progress: 50 }))

        const uploadResult = await uploadImageToSupabase(file, "product-images", uploadPath)

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Upload failed")
        }

        setUploadState((prev) => ({ ...prev, progress: 90 }))

        onChange(uploadResult.url || null, file)
        onFileChange?.(file)

        setUploadState((prev) => ({ ...prev, progress: 100, isUploading: false }))

        // Clear progress after a short delay
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, progress: 0 }))
        }, 1000)
      } catch (error) {
        // Keep: This is an essential error log
        console.error("🔍 ImageUpload DEBUG - Upload error:", error)
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error instanceof Error ? error.message : "Upload failed",
        }))
      }
    },
    [disabled, onChange, onFileChange, skuId, resetUploadState],
  )

  const handleRetry = useCallback(async () => {
    if (uploadState.retryCount >= MAX_RETRY_ATTEMPTS) {
      setUploadState((prev) => ({
        ...prev,
        error: "Maximum retry attempts reached. Please try again later.",
      }))
      return
    }

    // For retry, we need to trigger file selection again
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = acceptedTypes.join(",")
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        setUploadState((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }))
        handleFileSelect(file)
      }
    }
    fileInput.click()
  }, [uploadState.retryCount, handleFileSelect, acceptedTypes])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragOver(false)

      if (disabled) {
        return
      }

      const files = Array.from(event.dataTransfer.files)
      const imageFile = files.find((file) => acceptedTypes.includes(file.type))

      if (imageFile) {
        handleFileSelect(imageFile)
      } else {
        // Keep: This log is directly related to setting an error state
        console.log("🔍 ImageUpload DEBUG - No valid image file found in drop")
        setUploadState((prev) => ({
          ...prev,
          error: `Please select a valid image file (${acceptedTypes.join(", ")})`,
        }))
      }
    },
    [disabled, acceptedTypes, handleFileSelect],
  )

  const handleDelete = useCallback(() => {
    if (disabled) return
    onChange(null, null)
    onFileChange?.(null)
    resetUploadState()
  }, [disabled, onChange, onFileChange, resetUploadState])

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      const fileInput = document.createElement("input")
      fileInput.type = "file"
      fileInput.accept = acceptedTypes.join(",")
      fileInput.onchange = (e) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
          handleFileSelect(file)
        }
      }
      fileInput.click()
    }
  }, [disabled, acceptedTypes, handleFileSelect])

  const handleUploadAreaClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!disabled && !uploadState.isUploading) {
        openFileDialog()
      }
    },
    [disabled, uploadState.isUploading, openFileDialog],
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!value && <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          compact && "p-3",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <div className={cn("flex flex-col items-center justify-center space-y-3", compact && "space-y-2")}>
          {uploadState.isUploading ? (
            <>
              <RefreshCw className={cn("animate-spin text-primary", compact ? "h-6 w-6" : "h-8 w-8")} />
              <p className={cn("text-gray-600", compact ? "text-xs" : "text-sm")}>Uploading image...</p>
            </>
          ) : (
            <>
              <Upload className={cn("text-gray-400", compact ? "h-6 w-6" : "h-8 w-8")} />
              <div className="text-center">
                <p className={cn("font-medium text-gray-900", compact ? "text-xs" : "text-sm")}>
                  Click or drag to upload
                </p>
                {!compact && (
                  <p className="text-xs text-gray-500">
                    {acceptedTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")} up to {maxSizeMB}MB
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>}

      {/* Progress Bar */}
      {uploadState.isUploading && uploadState.progress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadState.progress} className="w-full" />
          <p className="text-xs text-gray-500 text-center">{uploadState.progress}% uploaded</p>
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{uploadState.error}</span>
            {uploadState.retryCount < MAX_RETRY_ATTEMPTS && (
              <Button variant="outline" size="sm" onClick={handleRetry} disabled={uploadState.isUploading}>
              <RefreshCw className="h-3 w-3 mr-1" />
              {value ? "Change Image" : "Retry"}
            </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
    
      {value && showPreview && (
  <div className="space-y-2">
    <div className="flex items-center justify-start space-x-4">
      <div
        className={cn(
          "relative w-full max-h-32 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm",
          !disabled && "cursor-pointer"
        )}
        onClick={() => {
          if (!disabled) {
            setShowPreviewModal(true);
          }
        }}
      >
        <img
          src={value || "/placeholder.svg"}
          alt="Uploaded image"
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg?height=128&width=200&text=Image+Error";
          }}
        />
      </div>
      {allowDelete && (
       
       <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={disabled}
          className="border-red-600 text-red-600 hover:bg-red-50" // Red border and text, hover effect
        >
          <Trash2 className="h-3 w-3 mr-1 text-red-600" /> {/* Red trash icon */}
          Delete
        </Button>
      )}
    </div>
  </div>
)}

      {/* Preview Modal */}
      {showPreviewModal && value && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowPreviewModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={value || "/placeholder.svg"}
              alt="Image preview"
              className="max-w-full max-h-[85vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=600&text=Image+Error"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
