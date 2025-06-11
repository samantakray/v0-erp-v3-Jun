"use client"

import type React from "react"
import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { v4 as uuidv4 } from "uuid"

interface ImageUploadProps {
  value?: string
  onChange: (url: string, file: File | null) => void
  onError?: (error: string) => void
  tempId?: string
  skuId?: string
  compact?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onError, tempId, skuId, compact }) => {
  const supabaseClient = useSupabaseClient()
  const [imageUrl, setImageUrl] = useState(value || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const generateSkuImagePath = (skuId: string, fileName: string) => {
    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
    return `skus/${skuId}/${uuidv4()}.${fileExtension}`
  }

  const uploadImageToSupabase = async (file: File, bucketName: string, path: string) => {
    try {
      const { data, error } = await supabaseClient.storage.from(bucketName).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
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
    setSelectedFile(file)
    setIsUploading(true)
    setUploadError(null)

    try {
      // If we have a skuId, use it to generate a path
      const path = skuId ? generateSkuImagePath(skuId, file.name) : `temp/${tempId}/${file.name}`

      const result = await uploadImageToSupabase(file, "product-images", path)

      if (result.success && result.url) {
        setImageUrl(result.url)
        // Pass both URL and File to the parent component
        onChange(result.url, file)
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
      onChange("", null)
    } catch (error) {
      console.error("Error removing image:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const placeholderImageUrl = "/placeholder.svg"

  return (
    <div className={`relative ${compact ? "w-[120px] h-[120px]" : "w-[200px] h-[200px]"} rounded-md overflow-hidden`}>
      {isUploading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      {isDeleting && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      {uploadError && (
        <div className="absolute inset-0 bg-red-100 text-red-500 flex items-center justify-center z-10">
          {uploadError}
        </div>
      )}
      <img src={imageUrl || placeholderImageUrl} alt="Uploaded Image" className="object-cover w-full h-full" />
      <label className="absolute bottom-0 right-0 bg-white/75 p-1 rounded-tl-md cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </label>
      {imageUrl && imageUrl !== placeholderImageUrl && (
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
    </div>
  )
}

export default ImageUpload
