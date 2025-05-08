"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { SKU } from "@/types"

export async function createSku(skuData: Omit<SKU, "id" | "createdAt">) {
  const startTime = performance.now()
  logger.info(`createSku called`, {
    data: {
      name: skuData.name,
      category: skuData.category,
      collection: skuData.collection,
      goldType: skuData.goldType,
      stoneType: skuData.stoneType,
    },
  })

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Format data for Supabase
    const supabaseSkuData = {
      // No sku_id field - let the database generate it
      name: skuData.name,
      category: skuData.category,
      collection: skuData.collection || null, // Add collection field
      size: skuData.size || null, // This will now be a number or null
      gold_type: skuData.goldType,
      stone_type: skuData.stoneType,
      diamond_type: skuData.diamondType || null,
      weight: skuData.weight || null,
      image_url: skuData.image || "/placeholder.svg?height=80&width=80",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    logger.debug(`Inserting SKU into Supabase`, {
      data: {
        name: skuData.name,
        category: skuData.category,
        collection: skuData.collection,
        goldType: skuData.goldType,
        stoneType: skuData.stoneType,
      },
    })

    // Insert SKU into Supabase
    const { data, error } = await supabase.from("skus").insert(supabaseSkuData).select()

    if (error) {
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
      },
      duration,
    })

    return { success: true, sku: data[0] }
  } catch (error) {
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
      return { success: false, error: error.message }
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
