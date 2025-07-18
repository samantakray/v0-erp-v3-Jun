"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { uploadImageToSupabase, deleteImageFromSupabase, generateSkuImagePath } from "@/lib/supabase-storage"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { SKU } from "@/types"

/**
 * Creates a single SKU in the database
 *
 * @param skuData The SKU data to create
 * @param preGeneratedId Optional pre-generated SKU ID. If provided, this ID will be used instead of letting the database generate one.
 * @param imageFile Optional image file to upload
 * @returns Object with success status, error message if applicable, and the created SKU
 */
export async function createSku(skuData: Omit<SKU, "id" | "createdAt">, preGeneratedId?: string, imageFile?: File) {
  const startTime = performance.now()

  // 🔍 DEBUG LOGGING - Function entry
  console.log("🔍 createSku DEBUG - Function called with:", {
    skuData: {
      name: skuData.name,
      image: skuData.image,
      hasImageProperty: !!skuData.image,
      imageType: typeof skuData.image,
    },
    preGeneratedId,
    imageFile: {
      hasImageFile: !!imageFile,
      fileName: imageFile?.name,
      fileSize: imageFile?.size,
      fileType: imageFile?.type,
    },
  })

  logger.info(`createSku called`, {
    data: {
      name: skuData.name,
      category: skuData.category,
      collection: skuData.collection,
      goldType: skuData.goldType,
      stoneType: skuData.stoneType,
      preGeneratedId: preGeneratedId ? "provided" : "not provided",
      hasImageFile: !!imageFile,
    },
  })

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()
  let uploadedImageUrl: string | null = null

  try {
    // Handle image upload if file is provided
    if (imageFile && preGeneratedId) {
      // 🔍 DEBUG LOGGING - Starting image upload
      const imagePath = generateSkuImagePath(preGeneratedId, imageFile.name)
      console.log("🔍 createSku DEBUG - Starting image upload:", {
        preGeneratedId,
        fileName: imageFile.name,
        imagePath,
      })

      const uploadResult = await uploadImageToSupabase(imageFile, "product-images", imagePath)

      // 🔍 DEBUG LOGGING - Upload result
      console.log("🔍 createSku DEBUG - Upload result:", {
        success: uploadResult.success,
        url: uploadResult.url,
        error: uploadResult.error,
      })

      if (!uploadResult.success) {
        logger.error(`Failed to upload image during SKU creation`, {
          data: { name: skuData.name, preGeneratedId },
          error: uploadResult.error,
        })
        return {
          success: false,
          error: `Image upload failed: ${uploadResult.error}`,
          sku: null,
        }
      }

      uploadedImageUrl = uploadResult.url!
      logger.debug(`Image uploaded successfully during SKU creation`, {
        data: { name: skuData.name, imageUrl: uploadedImageUrl },
      })
    } else {
      // 🔍 DEBUG LOGGING - Skipping image upload
      console.log("🔍 createSku DEBUG - Skipping image upload:", {
        hasImageFile: !!imageFile,
        hasPreGeneratedId: !!preGeneratedId,
        reason: !imageFile ? "No image file" : "No preGenerated ID",
      })
    }

    // Format data for Supabase
    const supabaseSkuData = {
      // Only include sku_id if a pre-generated ID is provided
      ...(preGeneratedId && { sku_id: preGeneratedId }),
      name: skuData.name,
      category: skuData.category,
      collection: skuData.collection || null,
      size: skuData.size || null,
      gold_type: skuData.goldType,
      stone_type: skuData.stoneType,
      diamond_type: skuData.diamondType || null,
      weight: skuData.weight || null,
      image_url: uploadedImageUrl || skuData.image || "/placeholder.svg?height=80&width=80",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 🔍 DEBUG LOGGING - Database data
    console.log("🔍 createSku DEBUG - Database data:", {
      image_url: uploadedImageUrl || skuData.image || "/placeholder.svg?height=80&width=80",
      uploadedImageUrl,
      skuDataImage: skuData.image,
      finalImageUrl: uploadedImageUrl || skuData.image || "/placeholder.svg?height=80&width=80",
    })

    logger.debug(`Inserting SKU into Supabase`, {
      data: {
        name: skuData.name,
        category: skuData.category,
        collection: skuData.collection,
        goldType: skuData.goldType,
        stoneType: skuData.stoneType,
        hasPreGeneratedId: !!preGeneratedId,
        hasUploadedImage: !!uploadedImageUrl,
      },
    })

    // Insert SKU into Supabase
    const { data, error } = await supabase.from("skus").insert(supabaseSkuData).select()

    if (error) {
      // If database insertion fails and we uploaded an image, clean it up
      if (uploadedImageUrl) {
        await deleteImageFromSupabase(uploadedImageUrl)
        logger.debug(`Cleaned up uploaded image after database error`, {
          data: { imageUrl: uploadedImageUrl },
        })
      }

      const duration = performance.now() - startTime
      logger.error(`Error creating SKU in Supabase`, {
        data: { name: skuData.name },
        error,
        duration,
      })
      return { success: false, error: error.message || "An unexpected error occurred", sku: null }
    }

    // Revalidate paths
    revalidatePath("/skus")

    const duration = performance.now() - startTime
    logger.info(`createSku completed successfully`, {
      data: {
        skuId: data[0].sku_id,
        name: skuData.name,
        collection: skuData.collection,
        goldType: skuData.goldType,
        stoneType: skuData.stoneType,
        hasImage: !!uploadedImageUrl,
      },
      duration,
    })

    return { success: true, sku: data[0] }
  } catch (error) {
    // If any unexpected error occurs and we uploaded an image, clean it up
    if (uploadedImageUrl) {
      await deleteImageFromSupabase(uploadedImageUrl)
      logger.debug(`Cleaned up uploaded image after unexpected error`, {
        data: { imageUrl: uploadedImageUrl },
      })
    }

    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createSku`, {
      data: { name: skuData.name },
      error,
      duration,
    })
    return { success: false, error: error.message || "An unexpected error occurred", sku: null }
  }
}

export async function deleteSku(skuId: string) {
  const startTime = performance.now()
  logger.info(`deleteSku called`, { data: { skuId } })

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // First, get the SKU to check if it has an image to delete
    const { data: skuData, error: fetchError } = await supabase
      .from("skus")
      .select("image_url")
      .eq("sku_id", skuId)
      .single()

    if (fetchError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching SKU for deletion`, {
        data: { skuId },
        error: fetchError,
        duration,
      })
      return { success: false, error: fetchError.message }
    }

    // Delete associated image if it exists and is not a placeholder
    if (skuData.image_url && !skuData.image_url.includes("placeholder.svg")) {
      const deleteImageResult = await deleteImageFromSupabase(skuData.image_url)
      if (!deleteImageResult.success) {
        // Log warning but don't fail the SKU deletion
        logger.warn(`Failed to delete associated image during SKU deletion`, {
          data: { skuId, imageUrl: skuData.image_url },
          error: deleteImageResult.error,
        })
      } else {
        logger.debug(`Successfully deleted associated image during SKU deletion`, {
          data: { skuId, imageUrl: skuData.image_url },
        })
      }
    }

    logger.debug(`Deleting SKU from Supabase`, { data: { skuId } })

    // Delete SKU from Supabase
    const { error } = await supabase.from("skus").delete().eq("sku_id", skuId)

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error deleting SKU from Supabase`, {
        data: { skuId },
        error,
        duration,
      })
      //return { success: false, error: error.message }

      // Check for specific foreign key violations and create a user-friendly message
      if (error.message.includes("fk_order_items_sku_uuid")) {
        return { success: false, error: "This SKU cannot be deleted because it is part of an existing order." }
      }
      if (error.message.includes("fk_jobs_sku_uuid")) {
        return { success: false, error: "This SKU cannot be deleted because it is part of an existing job." }
      }

      // Return a generic message for all other errors
      return { success: false, error: "Failed to delete SKU since it is part of a current job or order." }
    }

    // Revalidate paths
    revalidatePath("/skus")

    const duration = performance.now() - startTime
    logger.info(`deleteSku completed successfully`, {
      data: { skuId },
      duration,
    })

    return { success: true }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in deleteSku`, {
      data: { skuId },
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}
