# Lib Utilities Documentation

  This document provides comprehensive documentation for all utility
  files in the lib/ folder. These utilities form the foundation of the
  application's data layer, validation, logging, and storage
  management.

 ## Summary


  | File | Primary Objective | Key Features |
  |------|------------------|--------------|
  | supabaseClient.ts | Supabase client management | Creates browser
  and service role clients for database interaction. |
  | api-service.ts | Data fetching abstraction | Provides mock/real
  data switching and comprehensive CRUD operations for all major
  entities. |
  | logger.ts | Application logging | Implements structured logging
  with automatic data sanitization for security. |
  | validation.ts | System validation | Handles environment, schema,
  permissions, and data validation using Zod. |
  | supabase-validator.ts | Validation orchestration | Manages the
  validation lifecycle with promise caching to prevent redundant
  checks. |
  | supabase-storage.ts | File storage management | Manages image
  uploads, validation, and deletion in Supabase Storage. |
  | client-id-generator.ts | Generic ID generation | Offers a simple
  client-side unique ID generator for temporary state. |
  | utils.ts | General-purpose utilities | Provides helper functions
  for CSS class merging and specific ID generation. |

  ---

  1. supabaseClient.ts

  Overview
  Creates and manages Supabase client instances for different use
  cases: a browser-side client using the anonymous key and a
  server-side client factory using the service role key for elevated
  permissions.


  Key Features

  Client Creation


   1 // Browser client for general, user-facing operations
   2 export const supabase = createClient(supabaseUrl,
     supabaseAnonKey)
   3 
   4 // Service client factory for elevated, server-side 
     permissions
   5 export const createServiceClient = () => {
   6   return createClient(supabaseUrl, supabaseServiceKey)
   7 }



  Environment Variables Used
   - NEXT_PUBLIC_SUPABASE_URL: The public URL for your Supabase
     project.
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: The anonymous (public) key for
     browser-side operations.
   - SUPABASE_SERVICE_ROLE_KEY: The service role key for server-side
     operations, bypassing RLS.


  Supabase Database Communication
   - Direct: Creates the foundational clients used by all other lib/
     utilities that interact with the database.
   - Security Model:
     - The browser client respects Row Level Security (RLS) policies.
     - The service client bypasses RLS, intended for administrative or
       backend tasks.


  Usage Patterns
   - Browser client: Used in UI components and client-side data
     fetching.
   - Service client: Used in server actions, API routes, and
     validation functions requiring full access.

  ---

  2. api-service.ts

  Overview
  The main data access layer that abstracts all database operations.
  It provides a fallback to mock data for development and handles
  fetching all major entities with comprehensive logging and error
  handling.

  Key Features


  Mock Data Integration
  A global useMocks flag, controlled by the NEXT_PUBLIC_USE_MOCKS
  environment variable, determines whether to return mock data or
  fetch from Supabase.

   1 const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS ===
     "true"



  Core Fetch Functions
   - fetchOrder(orderId): Fetches a single order with its associated
     items and SKU details.
   - fetchOrders(): Fetches all orders, performing a subsequent query
     for each order's items.
   - fetchJob(jobId): Fetches a single job with full details,
     including SKU and order data.
   - fetchJobs(orderId): Fetches all jobs associated with a specific
     order.
   - fetchAllJobs(): Fetches all jobs from the database, sorted by
     creation date.
   - fetchSkus(): Fetches all SKUs and formats them for UI
     consumption.
   - fetchCustomers(): Fetches all customers marked as active.
   - fetchManufacturers(): Fetches all manufacturers.
   - fetchStoneLots(): Fetches all stone lots with a status of
     "Available" and prepends a "None" option for use in dropdowns.
   - fetchDiamondLots(): Fetches all diamond lots with a status of
     "Available" and prepends a "None" option.


  Advanced Features
   - Performance Monitoring: All functions include timing measurements
     logged via the logger utility.
   - Comprehensive Logging: Detailed debug information is logged for
     all operations, aiding in troubleshooting.
   - Data Transformation: Raw database data is formatted into
     structured TypeScript types for the UI.
   - Error Recovery: Functions gracefully fall back to empty arrays or
     null values on error.


  Entity Management
   - createManufacturer(manufacturerData): Creates a new manufacturer
     with input validation.
   - getSkuStatistics(limit): Aggregates data from order_items to
     calculate and return the most popular SKUs.

  Supabase Database Communication


  Tables Accessed
   - orders, order_items, jobs, skus, customers, manufacturers,
     stone_lots, diamond_lots.
   - information_schema.columns (indirectly via validation.ts).


  Query Patterns
   - Joins: Extensive use of Supabase's foreign key relationships to
     fetch related data in a single query (e.g., fetching a job with
     its corresponding SKU and order details).
   - Filtering: Status-based filtering (e.g., active customers,
     Available lots).
   - Ordering: Consistent sorting by creation date or name.
   - Aggregation: Statistical queries for analytics, such as in
     getSkuStatistics.


  Example Complex Query


    1 // From fetchJob()
    2 const { data: job, error } = await supabase
    3   .from("jobs")
    4   .select(`
    5     *,
    6     skus:sku_id (*),
    7     orders:order_id (order_id)
    8   `)
    9   .eq("job_id", jobId)
   10   .single()


  ---

  3. logger.ts

  Overview
  A centralized logging utility that provides structured, consistent
  logging across the application. It includes automatic data
  sanitization to prevent sensitive information from being exposed in
   logs.


  Key Features

  Log Levels
  Four standard log levels are supported: debug, info, warn, and
  error.

  Main Logger Interface


   1 export const logger = {
   2   debug: (message, options?) => log(message, {
     ...options, level: "debug" }),
   3   info: (message, options?) => log(message, { ...options,
     level: "info" }),
   4   warn: (message, options?) => log(message, { ...options,
     level: "warn" }),
   5   error: (message, options?) => log(message, {
     ...options, level: "error" }),
   6 }


  Advanced Logging Options
  Logs can be enriched with additional context, error objects, and
  performance timings.


   1 interface LogOptions {
   2   level?: LogLevel
   3   data?: any           // Additional context data
   4   error?: any          // Error objects
   5   duration?: number    // Performance timing in ms
   6 }


  Data Sanitization
  A sanitizeData function automatically redacts values for keys that
  are commonly associated with sensitive information.


   1 function sanitizeData(data: any): any {
   2   const sensitiveKeys = ["password", "token", "key",
     "secret", "auth", "credential"]
   3   // Recursively processes objects to replace sensitive 
     values with "[REDACTED]"
   4 }



  Security Features
   - Automatic Redaction: Sensitive data is automatically hidden from
     logs.
   - Deep Object Scanning: Sanitization is applied recursively to
     nested objects and arrays.

  ---

  4. validation.ts

  Overview
  A comprehensive validation system that ensures the application's
  environment, database schema, and permissions are correctly
  configured. It also provides data validation utilities using Zod.

  Key Features


  QC Data Validation
  Uses zod to define and enforce schemas for Quality Check (QC)
  data, ensuring data integrity before it is processed or stored.


    1 // Example Zod schema for gold usage
    2 const goldUsageDetailSchema = z.object({
    3   description: z.string().min(1, "Gold description is 
      required"),
    4   grossWeight: z.number().positive("Gross weight must be
      positive"),
    5   // ...
    6 });
    7 
    8 // Main validation function
    9 export function validateQCData(data: any) {
   10   // ... uses qcDataSchema.safeParse(data)
   11 }



  Environment Validation
  The validateEnvironment function checks for the presence and basic
  format of all required environment variables
  (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.).


  Schema Validation
  The validateDatabaseSchema function compares the columns of tables
  in the live database against a set of expectedSchemas. It performs
  a case-insensitive check to detect missing columns and reports
  detailed errors.


  Permission Testing
  The validatePermissions function runs a series of tests to ensure
  the anonymous and service role clients have the expected
  read/write permissions on critical tables. It distinguishes
  between critical and non-critical failures.


  Supabase Database Communication
   - Direct Database Access: Interacts directly with
     information_schema.columns for schema introspection and runs test
     queries against application tables to validate permissions.
   - Service Client Usage: Primarily uses the service client for its
     schema and permission checks to ensure it has a complete view of
     the database.

  ---

  5. supabase-validator.ts

  Overview
  An orchestration layer for the validation functions defined in
  validation.ts. It uses promise caching to ensure that the validation
  suite runs only once per application lifecycle, improving
  performance.

  Key Features


  Promise Caching
  A validationPromise variable stores the promise returned by the
  first validation run, ensuring subsequent calls receive the cached
  result instead of re-triggering the validation process.


   1 let validationPromise: Promise<boolean> | null = null
   2 
   3 export function validateSupabase() {
   4   if (!validationPromise) {
   5     validationPromise = validateSupabaseSetup()
   6     // ...
   7   }
   8   return validationPromise
   9 }



  Validation Orchestration
  The runValidation function executes the validation suite and
  provides user-friendly, formatted messages to the console,
  indicating success or failure and suggesting fallback options like
  using mock data.

  Integration Points
   - Intended to be called in a central location like app/layout.tsx
     to validate the application's setup on startup.

  ---

  6. supabase-storage.ts


  Overview
  A comprehensive file storage management system for handling image
  uploads, validation, and deletion in Supabase Storage.

  Key Features

  File Validation Configuration
  Defines constants for allowed file types, maximum file size, and
  maximum image dimensions.


   1 const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg",
     "image/png", "image/webp"]
   2 const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB



  Core Functions
   - validateImageFile(file): Validates a file against the defined
     constraints (type, size, dimensions).
   - uploadImageToSupabase(file, bucket, path): Validates a file and
     then uploads it to the specified Supabase Storage bucket,
     returning the public URL.
   - deleteImageFromSupabase(url): Parses a Supabase Storage URL to
     extract the bucket and path, then deletes the file using the
     service client.
   - generateSkuImagePath(skuId, fileName): Generates a structured file
      path, using a temp/ directory for new SKUs without an ID and a
     skus/{sku-id}/ path for permanent storage.


  Supabase Database Communication
   - Storage Operations: Uses supabase.storage for uploads and
     serviceClient.storage for deletions.
   - Security Model: Uploads are handled by the browser client
     (respecting storage policies), while deletions require the
     elevated permissions of the service client.

  ---

  7. client-id-generator.ts


  Overview
  A simple utility for generating unique client-side identifiers.
  This is useful for managing temporary UI state, such as keys for
  dynamically added list items, before a permanent database ID is
  available.

  Key Features

  ID Generation


   1 let clientIdCounter = 0
   2 
   3 export const generateClientId = (): string => {
   4   return `allocation_${++clientIdCounter}_${Date.now()}`
   5 }


  Counter Management
   - resetClientIdCounter(): Resets the internal counter, primarily
     for testing purposes.


  Usage Patterns
   - Generating temporary, unique key props for React components in a
     list.
   - Client-side form management.

  ---

  8. utils.ts

  Overview
  A collection of general-purpose utility functions used throughout
  the application.

  Key Features


  CSS Class Merging
   - cn(...inputs): A helper function that combines clsx and
     tailwind-merge to intelligently merge Tailwind CSS classes,
     preventing style conflicts.


  Allocation ID Generation
   - generateAllocationClientID(): Generates a unique client-side ID
     specifically for allocation rows in forms (e.g., stone or diamond
     allocation). Its format is allocation_{counter}_{timestamp}.
   - resetAllocationIdCounter(): Resets the counter, useful for testing
     environments.

---

## Integration Patterns

### Cross-File Dependencies

#### Core Dependencies
\`\`\`
supabaseClient.ts → (foundation for all database operations)
├── api-service.ts (uses both clients)
├── validation.ts (uses service client)
├── supabase-storage.ts (uses both clients)
└── supabase-validator.ts → validation.ts
\`\`\`

#### Logging Integration
\`\`\`
logger.ts → (used by all database-related utilities)
├── api-service.ts (extensive logging)
├── validation.ts (validation logging)
└── supabase-storage.ts (debug logging)
\`\`\`

### Environment Variable Usage

#### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Used by supabaseClient.ts
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Used by supabaseClient.ts
- `SUPABASE_SERVICE_ROLE_KEY`: Used by supabaseClient.ts
- `NEXT_PUBLIC_USE_MOCKS`: Used by api-service.ts

#### Validation Coverage
All environment variables are validated by validation.ts with detailed error reporting.

### Performance Considerations

#### Caching Strategies
- **Validation Caching**: supabase-validator.ts prevents repeated validation
- **Client Reuse**: supabaseClient.ts provides singleton clients
- **Timing Measurements**: api-service.ts tracks all operation performance

#### Optimization Patterns
- Parallel data fetching where possible
- Efficient query structures with proper joins
- Graceful degradation for non-critical operations

---

## Best Practices

### Error Handling
1. **Graceful Degradation**: Always provide fallback values
2. **Detailed Logging**: Include context for debugging
3. **User-Friendly Messages**: Clear error communication

### Security
1. **Data Sanitization**: Automatic redaction of sensitive information
2. **Client Separation**: Proper use of anonymous vs service clients
3. **Input Validation**: Comprehensive validation before database operations

### Performance
1. **Timing Measurements**: Track operation performance
2. **Efficient Queries**: Use joins instead of multiple queries
3. **Caching**: Prevent redundant operations

### Maintainability
1. **Consistent Patterns**: Similar structure across all utilities
2. **Comprehensive Documentation**: Detailed inline comments
3. **Modular Design**: Clear separation of concerns
