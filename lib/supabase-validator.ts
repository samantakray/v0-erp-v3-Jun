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
          console.warn("\n==================================")
          console.warn("⚠️ SUPABASE VALIDATION FAILED")
          console.warn("This may prevent some features from working correctly.")
          console.warn("See the documentation for setup instructions.")
          console.warn("==================================\n")
        } else {
          logger.info("✅ Supabase validation passed.")
        }
        return isValid
      })
      .catch((error) => {
        logger.error("❌ Supabase validation error", { error })
        console.error("\n==================================")
        console.error("❌ SUPABASE VALIDATION ERROR")
        console.error("This may prevent some features from working correctly.")
        console.error("See the documentation for setup instructions.")
        console.error("==================================\n")
        return false
      })
  }

  return validationPromise
}

// Function to run validation and log results
export async function runValidation() {
  try {
    const isValid = await validateSupabase()

    if (!isValid && process.env.NEXT_PUBLIC_USE_MOCKS !== "true") {
      console.warn("\n==================================")
      console.warn("⚠️ SUPABASE VALIDATION FAILED")
      console.warn("Check the logs for details on what failed.")
      console.warn("You can continue using mock data by setting NEXT_PUBLIC_USE_MOCKS=true")
      console.warn("==================================\n")
    }

    return isValid
  } catch (error) {
    console.error("\n==================================")
    console.error("❌ VALIDATION ERROR")
    console.error("An unexpected error occurred during validation.")
    console.error("You can continue using mock data by setting NEXT_PUBLIC_USE_MOCKS=true")
    console.error("==================================\n")
    return false
  }
}
