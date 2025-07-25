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
  // 🔍 DEBUG LOGGING - Validation flow tracking
  console.log("🔍 validateImageFile DEBUG - Starting validation:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    environment: typeof window === 'undefined' ? 'server' : 'client'
  })

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    console.log("🔍 validateImageFile DEBUG - File type validation failed:", {
      fileType: file.type,
      allowedTypes: ALLOWED_FILE_TYPES
    })
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    console.log("🔍 validateImageFile DEBUG - File size validation failed:", {
      fileSize: file.size,
      maxSize: MAX_FILE_SIZE,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      maxSizeMB: (MAX_FILE_SIZE / (1024 * 1024)).toFixed(2)
    })
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  // Check image dimensions
  try {
    console.log("🔍 validateImageFile DEBUG - Starting dimension validation...")
    const dimensions = await getImageDimensions(file)
    console.log("🔍 validateImageFile DEBUG - Dimensions obtained:", dimensions)
    
    if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
      console.log("🔍 validateImageFile DEBUG - Dimension validation failed:", {
        actualDimensions: dimensions,
        maxDimensions: MAX_DIMENSIONS
      })
      return {
        isValid: false,
        error: `Image dimensions too large. Maximum: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px`,
      }
    }
  } catch (error) {
    console.error("🔍 validateImageFile ERROR - Dimension reading failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileName: file.name
    })
    return {
      isValid: false,
      error: "Unable to read image dimensions",
    }
  }

  console.log("🔍 validateImageFile DEBUG - Validation completed successfully")
  return { isValid: true }
}

/**
 * Helper function to get image dimensions
 * @param file - The image file
 * @returns Promise<{width: number, height: number}>
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // 🔍 DEBUG LOGGING - Environment detection
    console.log("🔍 getImageDimensions DEBUG - Environment check:", {
      hasImage: typeof Image !== 'undefined',
      hasCreateObjectURL: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
      isServer: typeof window === 'undefined',
      fileInfo: { name: file.name, size: file.size, type: file.type }
    })
    
    if (typeof Image === 'undefined') {
      console.error("🔍 getImageDimensions ERROR - Image constructor not available (server environment)")
      reject(new Error("Image constructor not available in server environment"))
      return
    }
    
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      console.error("🔍 getImageDimensions ERROR - URL.createObjectURL not available (server environment)")
      reject(new Error("URL.createObjectURL not available in server environment"))
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      console.log("🔍 getImageDimensions DEBUG - Image loaded successfully:", {
        width: img.width,
        height: img.height,
        fileName: file.name
      })
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      console.error("🔍 getImageDimensions ERROR - Image failed to load:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })
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
  skipValidation = false
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 🔍 DEBUG LOGGING - Starting upload
    console.log("🔍 uploadImageToSupabase DEBUG - Starting upload:", {
      fileName: file.name,
      fileSize: file.size,
      bucket,
      path,
      skipValidation
    })

    // Validate file first (unless skipped for server environment)
    if (!skipValidation) {
      const validation = await validateImageFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        }
      }
    } else {
      console.log("🔍 uploadImageToSupabase DEBUG - Skipping validation (server environment)")
      
      // Basic file type check without dimension validation
      const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        }
      }
      
      // Basic file size check
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File size too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        }
      }
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting existing files
    })

    // 🔍 DEBUG LOGGING - Supabase upload response
    console.log("🔍 uploadImageToSupabase DEBUG - Supabase upload response:", {
      data,
      error,
      hasData: !!data,
      hasError: !!error,
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

    // 🔍 DEBUG LOGGING - Public URL generation
    console.log("🔍 uploadImageToSupabase DEBUG - Public URL generation:", {
      urlData,
      publicUrl: urlData.publicUrl,
      hasPublicUrl: !!urlData.publicUrl,
    })

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

  // Since all uploads are converted to WebP, always use the .webp extension.
  const extension = "webp";

  if (skuId) {
    // Permanent path for existing SKU
    return `skus/${skuId}/original.${extension}`
  } else {
    // Temporary path for new SKU (before SKU ID is generated)
    return `temp/${timestamp}-${randomId}.${extension}`
  }
}
