"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { uploadImageToSupabase, deleteImageFromSupabase, generateSkuImagePath } from "@/lib/supabase-storage"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { SKU } from "@/types"

/**
 * Type for the SKU data used in batch creation
 * This extends the base SKU type but makes the ID optional
 * and adds a specific skuId field for pre-generated IDs
 */
export type SkuBatchItem = Omit<SKU, "id" | "createdAt"> & {
  skuId: string
  imageFile?: File // Add optional image file
}

/**
 * Gets the most recent SKU ID from the database to predict the next sequence number
 * This is used for UI display only and doesn't consume a sequence number
 * @returns Object containing the predicted next number or null if no SKUs exist
 */
export async function getPredictedNextSkuNumber() {
  const startTime = performance.now()
  logger.info(`getPredictedNextSkuNumber called`)

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Fetch the most recent SKU from Supabase
    const { data, error } = await supabase
      .from("skus")
      .select("sku_id")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching most recent SKU from Supabase`, {
        error,
        duration,
      })
      return { success: false, error: error.message, predictedNumber: null }
    }

    // If no SKUs exist, return a default starting number
    if (!data || data.length === 0) {
      const duration = performance.now() - startTime
      logger.info(`No existing SKUs found, returning default starting number`, { duration })
      return {
        success: true,
        predictedNumber: 1,
        formattedNumber: "0001",
      }
    }

    // Extract the numerical part (assuming format XX-####)
    const latestSkuId = data[0].sku_id
    const match = latestSkuId.match(/-(\d+)$/)

    if (!match) {
      logger.warn(`Could not extract numerical part from SKU ID: ${latestSkuId}`)
      return {
        success: true,
        predictedNumber: 1,
        formattedNumber: "0001",
      }
    }

    // Increment by 1
    const currentNum = Number.parseInt(match[1], 10)
    const nextNum = currentNum + 1

    const duration = performance.now() - startTime
    logger.info(
      `getPredictedNextSkuNumber completed successfully - Predicted number: ${nextNum} (formatted: ${String(nextNum).padStart(4, "0")})`,
      {
        data: {
          latestSkuId,
          predictedNumber: nextNum,
          formattedNumber: String(nextNum).padStart(4, "0"),
        },
        duration,
      },
    )

    return {
      success: true,
      predictedNumber: nextNum,
      formattedNumber: String(nextNum).padStart(4, "0"),
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in getPredictedNextSkuNumber`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return { success: false, error: "An unexpected error occurred", predictedNumber: null }
  }
}

/**
 * Gets the next sequential number for SKU generation
 * This will be used to construct SKU IDs for all variants in a batch
 * @returns Object containing the next sequential number and its formatted version
 */
export async function getNextSkuNumber() {
  const startTime = performance.now()
  logger.info(`getNextSkuNumber called`)

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Call the wrapper function using rpc()
    const { data, error } = await supabase.rpc("get_next_sku_sequence_value")

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching next sequence value from Supabase via RPC`, {
        error,
        duration,
      })
      return { success: false, error: error.message || "Failed to fetch next SKU number", nextNumber: null }
    }

    // The result 'data' directly contains the value returned by the function
    const nextNumber = data
    if (nextNumber === null || typeof nextNumber !== "number") {
      throw new Error("Invalid number received from sequence function")
    }

    const duration = performance.now() - startTime
    logger.info(
      `getNextSkuNumber completed successfully - Generated number: ${nextNumber} (formatted: ${String(nextNumber).padStart(4, "0")})`,
      {
        data: {
          nextNumber,
          formattedNumber: String(nextNumber).padStart(4, "0"),
        },
        duration,
      },
    )

    return {
      success: true,
      nextNumber,
      // Also return the formatted version with leading zeros
      formattedNumber: String(nextNumber).padStart(4, "0"),
    }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in getNextSkuNumber`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return { success: false, error: "An unexpected error occurred", nextNumber: null }
  }
}

/**
 * Creates a batch of SKUs with pre-generated SKU IDs and handles image uploads
 * All SKUs in the batch will share the same sequential number
 *
 * @param skus Array of SKU objects with pre-generated SKU IDs and optional image files
 * @returns Object with success status and data or error message
 */
export async function createSkuBatch(skus: SkuBatchItem[]) {
  const startTime = performance.now()
  logger.info(`createSkuBatch called`, {
    data: {
      count: skus.length,
      withImages: skus.filter((sku) => sku.imageFile).length,
    },
  })

  // Add logging statement to verify backend received data
  logger.debug("Received skus data:", {
    data: skus.map((sku) => ({
      skuId: sku.skuId,
      name: sku.name,
      hasImageFile: !!sku.imageFile,
    })),
  })

  // Basic validation
  if (!Array.isArray(skus) || skus.length === 0) {
    logger.error(`Invalid or empty SKU data provided for batch insertion`)
    return {
      success: false,
      error: "Invalid or empty SKU data provided",
    }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()
  const uploadedImages: string[] = [] // Track uploaded images for cleanup on failure

  try {
    // Process image uploads first
    const processedSkus = await Promise.all(
      skus.map(async (sku) => {
        let imageUrl = sku.image || "/placeholder.svg?height=80&width=80"

        // 🔍 DEBUG LOGGING - Upload context logging
        console.log("🔍 createSkuBatch DEBUG - Processing SKU image:", {
          skuId: sku.skuId,
          hasImageFile: !!sku.imageFile,
          hasExistingUrl: !!sku.image,
          existingUrl: sku.image,
          fileName: sku.imageFile?.name,
          fileSize: sku.imageFile?.size,
          shouldSkipUpload: !!sku.image && sku.image !== "/placeholder.svg?height=80&width=80",
          environment: typeof window === 'undefined' ? 'server' : 'client'
        })

        // 🔧 FIX: Skip upload if we already have a valid URL
        const hasValidUrl = sku.image && sku.image !== "/placeholder.svg?height=80&width=80"
        
        if (sku.imageFile && !hasValidUrl) {
          console.log("🔍 createSkuBatch DEBUG - About to upload image (no existing URL):", {
            skuId: sku.skuId,
            fileName: sku.imageFile.name,
            hasExistingUrl: !!sku.image,
            environment: typeof window === 'undefined' ? 'server' : 'client'
          })
          
          const imagePath = generateSkuImagePath(sku.skuId, sku.imageFile.name)
          // Skip dimension validation in server environment (already validated on client)
          const uploadResult = await uploadImageToSupabase(sku.imageFile, "product-images", imagePath, true)

          console.log("🔍 createSkuBatch DEBUG - Upload result:", {
            skuId: sku.skuId,
            success: uploadResult.success,
            url: uploadResult.url,
            error: uploadResult.error
          })

          if (!uploadResult.success) {
            logger.error(`Failed to upload image for SKU in batch`, {
              data: { skuId: sku.skuId, fileName: sku.imageFile.name },
              error: uploadResult.error,
            })
            throw new Error(`Image upload failed for SKU ${sku.skuId}: ${uploadResult.error}`)
          }

          imageUrl = uploadResult.url!
          uploadedImages.push(imageUrl) // Track for potential cleanup

          logger.debug(`Image uploaded successfully for SKU in batch`, {
            data: { skuId: sku.skuId, imageUrl },
          })
        } else if (sku.imageFile && hasValidUrl) {
          console.log("🔍 createSkuBatch DEBUG - Skipping upload (using existing URL):", {
            skuId: sku.skuId,
            existingUrl: sku.image,
            fileName: sku.imageFile.name,
            reason: "Already uploaded"
          })
                     // Use existing URL, no upload needed
           imageUrl = sku.image!
        } else {
          console.log("🔍 createSkuBatch DEBUG - Skipping image upload (no file):", {
            skuId: sku.skuId,
            usingExistingUrl: imageUrl
          })
        }

        console.log("🔍 createSkuBatch DEBUG - Final image URL for SKU:", {
          skuId: sku.skuId,
          finalImageUrl: imageUrl,
          wasUploaded: !!sku.imageFile
        })

        return {
          ...sku,
          processedImageUrl: imageUrl,
        }
      }),
    )

    // Format data for Supabase
    const supabaseSkuData = processedSkus.map((sku) => ({
      sku_id: sku.skuId, // Pre-generated SKU ID
      name: sku.name,
      category: sku.category,
      collection: sku.collection || null,
      size: sku.size || null,
      gold_type: sku.goldType,
      stone_type: sku.stoneType,
      diamond_type: sku.diamondType || null,
      weight: sku.weight || null,
      image_url: sku.processedImageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    logger.debug(`Inserting ${skus.length} SKUs into Supabase`, {
      data: {
        firstSkuId: skus[0]?.skuId,
        count: skus.length,
        imagesUploaded: uploadedImages.length,
      },
    })

    // Insert SKUs into Supabase
    const { data, error } = await supabase.from("skus").insert(supabaseSkuData).select()

    if (error) {
      // If database insertion fails, clean up all uploaded images
      if (uploadedImages.length > 0) {
        logger.debug(`Cleaning up ${uploadedImages.length} uploaded images after database error`)
        await Promise.all(
          uploadedImages.map(async (imageUrl) => {
            const deleteResult = await deleteImageFromSupabase(imageUrl)
            if (!deleteResult.success) {
              logger.warn(`Failed to cleanup image during batch creation failure`, {
                data: { imageUrl },
                error: deleteResult.error,
              })
            }
          }),
        )
      }

      const duration = performance.now() - startTime
      logger.error(`Error creating SKU batch in Supabase`, {
        error,
        duration,
      })
      return { success: false, error: error.message || "An unexpected error occurred", skus: null }
    }

    // Revalidate paths
    revalidatePath("/skus")

    const duration = performance.now() - startTime
    logger.info(`createSkuBatch completed successfully`, {
      data: {
        count: data.length,
        imagesUploaded: uploadedImages.length,
      },
      duration,
    })

    return { success: true, skus: data }
  } catch (error) {
    // If any unexpected error occurs, clean up all uploaded images
    if (uploadedImages.length > 0) {
      logger.debug(`Cleaning up ${uploadedImages.length} uploaded images after unexpected error`)
      await Promise.all(
        uploadedImages.map(async (imageUrl) => {
          const deleteResult = await deleteImageFromSupabase(imageUrl)
          if (!deleteResult.success) {
            logger.warn(`Failed to cleanup image during batch creation failure`, {
              data: { imageUrl },
              error: deleteResult.error,
            })
          }
        }),
      )
    }

    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createSkuBatch`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return { success: false, error: "An unexpected error occurred", skus: null }
  }
}
