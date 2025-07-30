"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { NewStoneLotData } from "@/types"

/**
 * Creates a single Stone Lot in the database.
 *
 * @param lotData The data for the new stone lot.
 * @returns Object with success status and error message if applicable.
 */
export async function createStoneLot(lotData: NewStoneLotData) {
  const startTime = performance.now()
  logger.info(`createStoneLot called`, { data: lotData })

  const supabase = createServiceClient()

  try {
    // Prepare data for Supabase, converting empty strings to null and parsing numbers
    const supabaseData = {
      ...lotData,
      quantity: lotData.quantity ? parseInt(String(lotData.quantity), 10) : null,
      weight: lotData.weight ? parseFloat(String(lotData.weight)) : null,
      // Ensure optional fields are null if empty
      shape: lotData.shape || null,
      quality: lotData.quality || null,
      type: lotData.type || null,
      location: lotData.location || null,
      stone_size: lotData.stone_size || null,
    }

    const { data, error } = await supabase.from("stone_lots").insert(supabaseData).select('*').single()

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error creating stone lot in Supabase`, {
        data: { lot_number: lotData.lot_number },
        error,
        duration,
      })

      // Provide a user-friendly error for unique constraint violation
      if (error.code === "23505") { // Unique violation error code
        return { success: false, error: `A stone lot with Lot Number "${lotData.lot_number}" already exists.` }
      }

      return { success: false, error: error.message || "An unexpected error occurred" }
    }

    revalidatePath("/stones")

    const duration = performance.now() - startTime
    logger.info(`createStoneLot completed successfully`, {
      data: { lot_number: lotData.lot_number },
      duration,
    })

    return { success: true, data }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createStoneLot`, {
      data: { lot_number: lotData.lot_number },
      error,
      duration,
    })
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
