import { supabase, createServiceClient } from "./supabaseClient"
import { logger } from "./logger"

// Expected table schemas
const expectedSchemas = {
  skus: [
    "id",
    "sku_id",
    "name",
    "category",
    "gold_type",
    "stone_type",
    "diamond_type",
    "image_url",
    "created_at",
    "updated_at",
  ],
  orders: [
    "id",
    "order_id",
    "order_type",
    "customer_name",
    "customer_id",
    "production_date",
    "delivery_date",
    "status",
    "remarks",
    "action",
    "created_at",
    "updated_at",
  ],
  jobs: [
    "id",
    "job_id",
    "order_id",
    "sku_id",
    "size",
    "status",
    "current_phase",
    "production_date",
    "due_date",
    "stone_data",
    "diamond_data",
    "manufacturer_data",
    "qc_data",
    "created_at",
    "updated_at",
  ],
  order_items: ["id", "order_id", "sku_id", "quantity", "size", "remarks", "created_at", "updated_at"],
  job_history: ["id", "job_id", "status", "action", "data", "created_at"],
}

// Validate environment variables
export async function validateEnvironment() {
  logger.info("Validating environment variables")

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  }

  const issues = []

  // Check if variables are defined
  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      issues.push(`${key} is not defined`)
    }
  }

  // Check if Supabase URL is valid
  if (envVars.NEXT_PUBLIC_SUPABASE_URL && !envVars.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
    issues.push(`NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid URL: ${envVars.NEXT_PUBLIC_SUPABASE_URL}`)
  }

  // Check if keys have expected format (simple length check)
  if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 20) {
    issues.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be too short`)
  }

  if (envVars.SUPABASE_SERVICE_ROLE_KEY && envVars.SUPABASE_SERVICE_ROLE_KEY.length < 20) {
    issues.push(`SUPABASE_SERVICE_ROLE_KEY appears to be too short`)
  }

  // Log results
  if (issues.length > 0) {
    logger.error("Environment validation failed", { data: { issues } })
    return false
  } else {
    logger.info("Environment validation passed", {
      data: {
        useMocks: envVars.NEXT_PUBLIC_USE_MOCKS,
        supabaseUrl: envVars.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...", // Only log part of the URL for security
      },
    })
    return true
  }
}

// Validate database schema
export async function validateDatabaseSchema() {
  logger.info("Validating database schema")

  // Use service client for schema validation
  const serviceClient = createServiceClient()
  const schemaIssues = []

  for (const [table, expectedColumns] of Object.entries(expectedSchemas)) {
    try {
      // Try to get a single row to check if table exists
      const { data, error } = await serviceClient.from(table).select("*").limit(1)

      if (error) {
        schemaIssues.push(`Table '${table}' error: ${error.message}`)
        continue
      }

      // If we can't get column info from data, try a different approach
      if (!data || data.length === 0) {
        // Try to get column info using system tables (requires additional permissions)
        const { data: columnData, error: columnError } = await serviceClient.rpc("get_table_columns", {
          table_name: table,
        })

        if (columnError) {
          schemaIssues.push(`Could not validate columns for table '${table}': ${columnError.message}`)
          continue
        }

        if (columnData) {
          const actualColumns = columnData.map((col: any) => col.column_name)
          const missingColumns = expectedColumns.filter((col) => !actualColumns.includes(col))

          if (missingColumns.length > 0) {
            schemaIssues.push(`Table '${table}' is missing columns: ${missingColumns.join(", ")}`)
          }
        }
      } else {
        // We got a row, check if it has all expected columns
        const row = data[0]
        const actualColumns = Object.keys(row)
        const missingColumns = expectedColumns.filter((col) => !actualColumns.includes(col))

        if (missingColumns.length > 0) {
          schemaIssues.push(`Table '${table}' is missing columns: ${missingColumns.join(", ")}`)
        }
      }
    } catch (err) {
      schemaIssues.push(`Error validating table '${table}': ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Log results
  if (schemaIssues.length > 0) {
    logger.error("Database schema validation failed", { data: { issues: schemaIssues } })
    return false
  } else {
    logger.info("Database schema validation passed")
    return true
  }
}

// Validate permissions
export async function validatePermissions() {
  logger.info("Validating Supabase permissions")

  const permissionTests = [
    { name: "Anonymous read access", client: supabase, table: "skus", operation: "select" },
    { name: "Service role write access", client: createServiceClient(), table: "skus", operation: "insert" },
  ]

  const permissionIssues = []

  for (const test of permissionTests) {
    try {
      let result

      if (test.operation === "select") {
        // Test read permission
        result = await test.client.from(test.table).select("id").limit(1)
      } else if (test.operation === "insert") {
        // Test write permission with a dummy record that we'll immediately delete
        // Use a transaction to avoid leaving test data
        result = await test.client.rpc("test_permissions", { table_name: test.table })
      }

      if (result?.error) {
        permissionIssues.push(`${test.name} failed: ${result.error.message}`)
      }
    } catch (err) {
      permissionIssues.push(`${test.name} failed with exception: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Log results
  if (permissionIssues.length > 0) {
    logger.error("Permission validation failed", { data: { issues: permissionIssues } })
    return false
  } else {
    logger.info("Permission validation passed")
    return true
  }
}

// Create a stored procedure for testing permissions
export async function createPermissionTestFunction() {
  const serviceClient = createServiceClient()

  // Create a function to test permissions without actually modifying data
  const { error } = await serviceClient.rpc("create_permission_test_function")

  if (error) {
    logger.error("Failed to create permission test function", { error })
    return false
  }

  return true
}

// Main validation function that runs all checks
export async function validateSupabaseSetup() {
  logger.info("Starting Supabase validation")

  const envValid = await validateEnvironment()

  // Only continue if environment variables are valid
  if (!envValid) {
    logger.error("Validation stopped: Environment variables are invalid")
    return false
  }

  // Check if we're using mocks
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    logger.info("Using mock data, skipping database validation")
    return true
  }

  // Create permission test function if needed
  await createPermissionTestFunction()

  // Run all validations
  const schemaValid = await validateDatabaseSchema()
  const permissionsValid = await validatePermissions()

  const isValid = schemaValid && permissionsValid

  if (isValid) {
    logger.info("Supabase validation completed successfully")
  } else {
    logger.error("Supabase validation failed", {
      data: {
        schemaValid,
        permissionsValid,
      },
    })
  }

  return isValid
}
