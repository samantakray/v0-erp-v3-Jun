import { validateSupabaseSetup } from "./validation"
import { logger } from "./logger"

let validationPromise: Promise<boolean> | null = null

export function validateSupabase() {
  // Only run validation once
  if (!validationPromise) {
    validationPromise = validateSupabaseSetup()
      .then((isValid) => {
        if (!isValid) {
          logger.warn("⚠️ Supabase validation failed. Check the logs for details.")
        } else {
          logger.info("✅ Supabase validation passed.")
        }
        return isValid
      })
      .catch((error) => {
        logger.error("❌ Supabase validation error", { error })
        return false
      })
  }

  return validationPromise
}

// Function to run validation and log results
export async function runValidation() {
  const isValid = await validateSupabase()

  if (!isValid) {
    console.error("\n==================================")
    console.error("⚠️ SUPABASE VALIDATION FAILED")
    console.error("Check the logs for details on what failed.")
    console.error("==================================\n")
  }

  return isValid
}
