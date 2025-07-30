"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { NewDiamondLotData } from "@/types"

/**
 * Creates a single Diamond Lot in the database.
 *
 * @param lotData The data for the new diamond lot.
 * @returns Object with success status and error message if applicable.
 */
export async function createDiamondLot(lotData: NewDiamondLotData) {
  const startTime = performance.now()
  logger.info(`createDiamondLot called`, { data: lotData })

  const supabase = createServiceClient()

  try {
    // Prepare data for Supabase, converting empty strings to null and parsing numbers
    const supabaseData = {
      ...lotData,
      quantity: lotData.quantity ? (isNaN(Number(lotData.quantity)) ? null : parseInt(String(lotData.quantity), 10)) : null,
      weight: lotData.weight ? (isNaN(Number(lotData.weight)) ? null : parseFloat(String(lotData.weight))) : null,
      price: lotData.price ? (isNaN(Number(lotData.price)) ? null : parseFloat(String(lotData.price))) : null,
      stonegroup: "diamond", // Always set to diamond
    }

    const { data, error } = await supabase.from("diamond_lots").insert(supabaseData).select('*').single()

    if (error) {
      const duration = performance.now() - startTime
      logger.error(`Error creating diamond lot in Supabase`, {
        data: { lot_number: lotData.lot_number },
        error,
        duration,
      })

      // Provide a user-friendly error for unique constraint violation
      if (error.code === "23505") { // Unique violation error code for POSTGRES_UNIQUE_VIOLATION
        return { success: false, error: `A diamond lot with Lot Number "${lotData.lot_number}" already exists.` }
      }

      return { success: false, error: error.message || "An unexpected error occurred" }
    }

    revalidatePath("/diamonds")

    const duration = performance.now() - startTime
    logger.info(`createDiamondLot completed successfully`, {
      data: { lot_number: lotData.lot_number },
      duration,
    })

    return { success: true, data }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createDiamondLot`, {
      data: { lot_number: lotData.lot_number },
      error,
      duration,
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}
