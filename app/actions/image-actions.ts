"use server"

import { uploadImageToSupabase, deleteImageFromSupabase, generateSkuImagePath } from "@/lib/supabase-storage"
import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"

/**
 * Uploads an image for a specific SKU
 * @param file - The image file to upload
 * @param skuId - The SKU ID to associate the image with
 * @returns Object with success status and image URL or error message
 */
export async function uploadSkuImage(file: File, skuId: string) {
  const startTime = performance.now()
  logger.info(`uploadSkuImage called`, {
    data: {
      skuId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    },
  })

  try {
    // Generate path for the image
    const imagePath = generateSkuImagePath(skuId, file.name)

    // Upload image to Supabase Storage
    const uploadResult = await uploadImageToSupabase(file, "product-images", imagePath)

    if (!uploadResult.success) {
      const duration = performance.now() - startTime
      logger.error(`Failed to upload image for SKU`, {
        data: { skuId, fileName: file.name },
        error: uploadResult.error,
        duration,
      })
      return {
        success: false,
        error: uploadResult.error || "Failed to upload image",
        url: null,
      }
    }

    // Update SKU record with new image URL
    const supabase = createServiceClient()
    const { error: updateError } = await supabase
      .from("skus")
      .update({
        image_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq("sku_id", skuId)

    if (updateError) {
      // If database update fails, clean up the uploaded image
      await deleteImageFromSupabase(uploadResult.url!)

      const duration = performance.now() - startTime
      logger.error(`Failed to update SKU with image URL`, {
        data: { skuId, imageUrl: uploadResult.url },
        error: updateError,
        duration,
      })
      return {
        success: false,
        error: "Failed to update SKU with image URL",
        url: null,
      }
    }

    // Revalidate paths
    revalidatePath("/skus")
    revalidatePath(`/skus/${skuId}`)

    const duration = performance.now() - startTime
    logger.info(`uploadSkuImage completed successfully`, {
      data: {
        skuId,
        imageUrl: uploadResult.url,
        fileName: file.name,
      },
      duration,
    })

    return {
      success: true,
      url: uploadResult.url,
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in uploadSkuImage`, {
      data: { skuId, fileName: file.name },
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return {
      success: false,
      error: "An unexpected error occurred during image upload",
      url: null,
    }
  }
}

/**
 * Updates an existing SKU's image
 * @param skuId - The SKU ID
 * @param newFile - The new image file
 * @returns Object with success status and new image URL or error message
 */
export async function updateSkuImage(skuId: string, newFile: File) {
  const startTime = performance.now()
  logger.info(`updateSkuImage called`, {
    data: {
      skuId,
      fileName: newFile.name,
      fileSize: newFile.size,
      fileType: newFile.type,
    },
  })

  const supabase = createServiceClient()

  try {
    // First, get the current image URL to delete it later
    const { data: currentSku, error: fetchError } = await supabase
      .from("skus")
      .select("image_url")
      .eq("sku_id", skuId)
      .single()

    if (fetchError) {
      const duration = performance.now() - startTime
      logger.error(`Failed to fetch current SKU for image update`, {
        data: { skuId },
        error: fetchError,
        duration,
      })
      return {
        success: false,
        error: "Failed to fetch current SKU information",
        url: null,
      }
    }

    // Upload new image
    const imagePath = generateSkuImagePath(skuId, newFile.name)
    const uploadResult = await uploadImageToSupabase(newFile, "product-images", imagePath)

    if (!uploadResult.success) {
      const duration = performance.now() - startTime
      logger.error(`Failed to upload new image for SKU update`, {
        data: { skuId, fileName: newFile.name },
        error: uploadResult.error,
        duration,
      })
      return {
        success: false,
        error: uploadResult.error || "Failed to upload new image",
        url: null,
      }
    }

    // Update SKU record with new image URL
    const { error: updateError } = await supabase
      .from("skus")
      .update({
        image_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq("sku_id", skuId)

    if (updateError) {
      // If database update fails, clean up the new uploaded image
      await deleteImageFromSupabase(uploadResult.url!)

      const duration = performance.now() - startTime
      logger.error(`Failed to update SKU with new image URL`, {
        data: { skuId, newImageUrl: uploadResult.url },
        error: updateError,
        duration,
      })
      return {
        success: false,
        error: "Failed to update SKU with new image URL",
        url: null,
      }
    }

    // Delete old image if it exists and is not a placeholder
    if (currentSku.image_url && !currentSku.image_url.includes("placeholder.svg")) {
      const deleteResult = await deleteImageFromSupabase(currentSku.image_url)
      if (!deleteResult.success) {
        // Log warning but don't fail the operation
        logger.warn(`Failed to delete old image during update`, {
          data: { skuId, oldImageUrl: currentSku.image_url },
          error: deleteResult.error,
        })
      }
    }

    // Revalidate paths
    revalidatePath("/skus")
    revalidatePath(`/skus/${skuId}`)

    const duration = performance.now() - startTime
    logger.info(`updateSkuImage completed successfully`, {
      data: {
        skuId,
        newImageUrl: uploadResult.url,
        oldImageUrl: currentSku.image_url,
        fileName: newFile.name,
      },
      duration,
    })

    return {
      success: true,
      url: uploadResult.url,
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in updateSkuImage`, {
      data: { skuId, fileName: newFile.name },
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return {
      success: false,
      error: "An unexpected error occurred during image update",
      url: null,
    }
  }
}

/**
 * Deletes an image associated with a SKU
 * @param skuId - The SKU ID
 * @returns Object with success status and error message if applicable
 */
export async function deleteSkuImage(skuId: string) {
  const startTime = performance.now()
  logger.info(`deleteSkuImage called`, { data: { skuId } })

  const supabase = createServiceClient()

  try {
    // Get the current image URL
    const { data: currentSku, error: fetchError } = await supabase
      .from("skus")
      .select("image_url")
      .eq("sku_id", skuId)
      .single()

    if (fetchError) {
      const duration = performance.now() - startTime
      logger.error(`Failed to fetch SKU for image deletion`, {
        data: { skuId },
        error: fetchError,
        duration,
      })
      return {
        success: false,
        error: "Failed to fetch SKU information",
      }
    }

    // Check if there's an image to delete (not a placeholder)
    if (!currentSku.image_url || currentSku.image_url.includes("placeholder.svg")) {
      const duration = performance.now() - startTime
      logger.info(`No image to delete for SKU (placeholder or null)`, {
        data: { skuId, imageUrl: currentSku.image_url },
        duration,
      })
      return {
        success: true,
        message: "No image to delete",
      }
    }

    // Delete image from storage
    const deleteResult = await deleteImageFromSupabase(currentSku.image_url)
    if (!deleteResult.success) {
      const duration = performance.now() - startTime
      logger.error(`Failed to delete image from storage`, {
        data: { skuId, imageUrl: currentSku.image_url },
        error: deleteResult.error,
        duration,
      })
      return {
        success: false,
        error: deleteResult.error || "Failed to delete image from storage",
      }
    }

    // Update SKU record to remove image URL (set to placeholder)
    const { error: updateError } = await supabase
      .from("skus")
      .update({
        image_url: "/placeholder.svg?height=80&width=80",
        updated_at: new Date().toISOString(),
      })
      .eq("sku_id", skuId)

    if (updateError) {
      const duration = performance.now() - startTime
      logger.error(`Failed to update SKU after image deletion`, {
        data: { skuId },
        error: updateError,
        duration,
      })
      return {
        success: false,
        error: "Failed to update SKU after image deletion",
      }
    }

    // Revalidate paths
    revalidatePath("/skus")
    revalidatePath(`/skus/${skuId}`)

    const duration = performance.now() - startTime
    logger.info(`deleteSkuImage completed successfully`, {
      data: { skuId, deletedImageUrl: currentSku.image_url },
      duration,
    })

    return {
      success: true,
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in deleteSkuImage`, {
      data: { skuId },
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return {
      success: false,
      error: "An unexpected error occurred during image deletion",
    }
  }
}
