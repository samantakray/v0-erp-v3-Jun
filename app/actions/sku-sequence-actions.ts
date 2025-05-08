"use server"

import { createServiceClient } from "@/lib/supabaseClient"
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
    logger.info(`getNextSkuNumber completed successfully`, {
      data: { nextNumber },
      duration,
    })

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
 * Creates a batch of SKUs with pre-generated SKU IDs
 * All SKUs in the batch will share the same sequential number
 *
 * @param skus Array of SKU objects with pre-generated SKU IDs
 * @returns Object with success status and data or error message
 */
export async function createSkuBatch(skus: SkuBatchItem[]) {
  const startTime = performance.now()
  logger.info(`createSkuBatch called`, {
    data: { count: skus.length },
  })

  // Add logging statement to verify backend received data
  logger.debug("Received skus data:", skus)

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

  try {
    // Format data for Supabase
    const supabaseSkuData = skus.map((sku) => ({
      sku_id: sku.skuId, // Pre-generated SKU ID
      name: sku.name,
      category: sku.category,
      collection: sku.collection || null,
      size: sku.size || null,
      gold_type: sku.goldType,
      stone_type: sku.stoneType,
      diamond_type: sku.diamondType || null,
      weight: sku.weight || null,
      image_url: sku.image || "/placeholder.svg?height=80&width=80",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    logger.debug(`Inserting ${skus.length} SKUs into Supabase`, {
      data: {
        firstSkuId: skus[0]?.skuId,
        count: skus.length,
      },
    })

    // Insert SKUs into Supabase
    const { data, error } = await supabase.from("skus").insert(supabaseSkuData).select()

    if (error) {
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
      },
      duration,
    })

    return { success: true, skus: data }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createSkuBatch`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    })
    return { success: false, error: "An unexpected error occurred", skus: null }
  }
}
