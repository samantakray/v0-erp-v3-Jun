import { supabase, createServiceClient } from "./supabaseClient"

// File validation configuration
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const MAX_DIMENSIONS = { width: 4000, height: 4000 }

/**
 * Validates an image file before upload
 * @param file - The file to validate
 * @returns Promise<{isValid: boolean, error?: string}>
 */
export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file)
    if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
      return {
        isValid: false,
        error: `Image dimensions too large. Maximum: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px`,
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Unable to read image dimensions",
    }
  }

  return { isValid: true }
}

/**
 * Helper function to get image dimensions
 * @param file - The image file
 * @returns Promise<{width: number, height: number}>
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

/**
 * Uploads an image file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Promise<{success: boolean, url?: string, error?: string}>
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string,
  path: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file first
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting existing files
    })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Unexpected upload error:", error)
    return {
      success: false,
      error: "Unexpected error during upload",
    }
  }
}

/**
 * Deletes an image from Supabase Storage using its URL
 * @param url - The full URL of the image to delete
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function deleteImageFromSupabase(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract bucket and path from URL
    const urlParts = extractBucketAndPath(url)
    if (!urlParts) {
      return {
        success: false,
        error: "Invalid Supabase Storage URL",
      }
    }

    const { bucket, path } = urlParts

    // Use service client for deletion (requires elevated permissions)
    const serviceClient = createServiceClient()

    const { error } = await serviceClient.storage.from(bucket).remove([path])

    if (error) {
      console.error("Delete error:", error)
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected delete error:", error)
    return {
      success: false,
      error: "Unexpected error during deletion",
    }
  }
}

/**
 * Helper function to extract bucket and path from Supabase Storage URL
 * @param url - The full Supabase Storage URL
 * @returns {bucket: string, path: string} | null
 */
function extractBucketAndPath(url: string): { bucket: string; path: string } | null {
  try {
    // Supabase Storage URLs follow this pattern:
    // https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")

    // Find the index of 'public' in the path
    const publicIndex = pathParts.indexOf("public")
    if (publicIndex === -1 || publicIndex + 2 >= pathParts.length) {
      return null
    }

    const bucket = pathParts[publicIndex + 1]
    const path = pathParts.slice(publicIndex + 2).join("/")

    return { bucket, path }
  } catch (error) {
    console.error("Error parsing Supabase Storage URL:", error)
    return null
  }
}

/**
 * Generates a unique file path for SKU images
 * @param skuId - The SKU ID (optional, will generate temp path if not provided)
 * @param fileName - Original file name
 * @returns string - The generated path
 */
export function generateSkuImagePath(skuId?: string, fileName?: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)

  if (skuId) {
    // Permanent path for existing SKU
    const extension = fileName ? fileName.split(".").pop() : "jpg"
    return `skus/${skuId}/original.${extension}`
  } else {
    // Temporary path for new SKU (before SKU ID is generated)
    const extension = fileName ? fileName.split(".").pop() : "jpg"
    return `temp/${timestamp}-${randomId}.${extension}`
  }
}
