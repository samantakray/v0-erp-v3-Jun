"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { v4 as uuidv4 } from "uuid"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null, file: File | null) => void
  onFileChange?: (file: File | null) => void
  skuId?: string
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

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFileChange,
  onError,
  tempId,
  skuId,
  compact,
  disabled,
  showPreview = true,
  allowDelete = true,
  maxSizeMB = 2,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif"],
  className,
}) => {
  const supabaseClient = useSupabaseClient()
  const [imageUrl, setImageUrl] = useState(value || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)

  const generateSkuImagePath = (skuId: string, fileName: string) => {
    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
    return `skus/${skuId}/${uuidv4()}.${fileExtension}`
  }

  const uploadImageToSupabase = async (file: File, bucketName: string, path: string) => {
    try {
      const { data, error, progress } = await supabaseClient.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })
        .on("progress", (progress) => {
          const percentComplete = Math.round((progress.loaded / progress.total) * 100)
          setUploadProgress(percentComplete)
        })

      if (error) {
        console.error("Supabase upload error:", error)
        return { success: false, error: error.message }
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${data.path}`
      return { success: true, url }
    } catch (error: any) {
      console.error("Error uploading to Supabase:", error)
      return { success: false, error: error.message }
    }
  }

  const deleteImageFromSupabase = async (imageUrl: string) => {
    try {
      const imagePath = imageUrl.replace(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`,
        "",
      )

      const { error } = await supabaseClient.storage.from("product-images").remove([imagePath])

      if (error) {
        console.error("Supabase delete error:", error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error deleting from Supabase:", error)
      return { success: false, error: error.message }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    await handleFileSelect(file)
  }

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSizeMB}MB`)
      }

      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported`)
      }

      // If we have a skuId, use it to generate a path
      const path = skuId ? generateSkuImagePath(skuId, file.name) : `temp/${tempId}/${file.name}`

      const result = await uploadImageToSupabase(file, "product-images", path)

      if (result.success && result.url) {
        setImageUrl(result.url)
        // Pass both URL and File to the parent component
        onChange(result.url, file)
        onFileChange?.(file)
      } else {
        setUploadError(result.error || "Failed to upload image")
        onError?.(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setUploadError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = async () => {
    if (!imageUrl) return

    setIsDeleting(true)

    try {
      // Only attempt to delete if it's not a placeholder
      if (!imageUrl.includes("placeholder.svg")) {
        const result = await deleteImageFromSupabase(imageUrl)
        if (!result.success) {
          console.error("Failed to delete image:", result.error)
        }
      }

      setImageUrl("")
      setSelectedFile(null)
      // Pass null for both URL and File
      onChange(null, null)
      onFileChange?.(null)
    } catch (error) {
      console.error("Error removing image:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0])
      }
    },
    [
      skuId,
      tempId,
      maxSizeMB,
      acceptedTypes,
      setImageUrl,
      setSelectedFile,
      setIsUploading,
      setUploadError,
      setUploadProgress,
      onChange,
      onFileChange,
      onError,
    ],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.join(","),
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || isUploading || isDeleting,
  })

  const placeholderImageUrl = "/placeholder.svg"

  return (
    <div
      className={`relative ${compact ? "w-[120px] h-[120px]" : "w-[200px] h-[200px]"} rounded-md overflow-hidden ${className}`}
    >
      {isUploading && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <p>Uploading: {uploadProgress}%</p>
        </div>
      )}
      {isDeleting && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      {uploadError && (
        <div className="absolute inset-0 bg-red-100 text-red-500 flex items-center justify-center z-10 p-4 text-center">
          {uploadError}
          <button
            onClick={() => {
              if (selectedFile) {
                handleFileSelect(selectedFile)
              } else {
                setUploadError("No file to retry.")
              }
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      <img
        src={imageUrl || placeholderImageUrl}
        alt="Uploaded Image"
        className="object-cover w-full h-full cursor-pointer"
        onClick={() => (showPreview && imageUrl ? setShowModal(true) : null)}
      />
      <div {...getRootProps()} className="absolute bottom-0 left-0 w-full bg-white/75 p-1 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm">Drop the files here ...</p>
        ) : (
          <p className="text-sm">{disabled ? "Disabled" : "Click or drag to upload"}</p>
        )}
      </div>

      {allowDelete && imageUrl && imageUrl !== placeholderImageUrl && (
        <button onClick={handleRemove} className="absolute top-0 right-0 bg-white/75 p-1 rounded-bl-md cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {showModal && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white rounded-md max-w-4xl max-h-4xl overflow-hidden">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-white/75 p-1 rounded-full cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Full Size Preview"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export { ImageUpload }
