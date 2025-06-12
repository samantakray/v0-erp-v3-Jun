# Lib Utilities Documentation

This document provides comprehensive documentation for all utility files in the `lib/` folder. These utilities form the foundation of the application's data layer, validation, logging, and storage management.

## Summary

| File | Primary Objective | Key Features |
|------|------------------|--------------|
| `supabaseClient.ts` | Supabase client management | Creates browser and service role clients |
| `api-service.ts` | Data fetching abstraction | Mock/real data switching, comprehensive CRUD operations |
| `logger.ts` | Application logging | Structured logging with data sanitization |
| `validation.ts` | System validation | Environment, schema, and permission validation |
| `supabase-validator.ts` | Validation orchestration | Promise caching and validation execution |
| `supabase-storage.ts` | File storage management | Image upload, validation, and deletion |
| `client-id-generator.ts` | ID generation | Simple client-side unique ID generation |

---

## 1. supabaseClient.ts

### Overview
Creates and manages Supabase client instances for different use cases - browser-side operations with anonymous key and server-side operations with service role key.

### Key Features

#### Client Creation
\`\`\`typescript
// Browser client for general operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client factory for elevated permissions
export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}
\`\`\`

#### Environment Variables Used
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous/public key for browser operations
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server operations

### Supabase Database Communication
- **Direct**: Creates the foundation clients used throughout the application
- **Security Model**: 
  - Browser client respects RLS policies
  - Service client bypasses RLS for administrative operations

### Usage Patterns
- Browser client: Used in components and client-side operations
- Service client: Used in server actions and validation functions

---

## 2. api-service.ts

### Overview
Main data access layer that abstracts database operations and provides mock data fallback. Handles all major entity fetching with comprehensive logging and error handling.

### Key Features

#### Mock Data Integration
\`\`\`typescript
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
\`\`\`

#### Core Fetch Functions
- `fetchOrder(orderId)`: Single order with items and SKU details
- `fetchOrders()`: All orders with pagination support
- `fetchJobs(orderId)`: Jobs for specific order
- `fetchJob(jobId)`: Single job with full details
- `fetchSkus()`: All SKUs with formatting
- `fetchCustomers()`: Active customers with debugging
- `fetchManufacturers()`: All manufacturers
- `fetchStoneLots()`: Available stone inventory
- `fetchDiamondLots()`: Available diamond inventory

#### Advanced Features
- **Performance Monitoring**: All functions include timing measurements
- **Comprehensive Logging**: Detailed debug information for troubleshooting
- **Data Transformation**: Raw database data formatted for UI consumption
- **Error Recovery**: Graceful fallback to empty arrays/null values

#### Statistics and Analytics
\`\`\`typescript
export async function getSkuStatistics(limit = 5) {
  // Aggregates order_items data to show most popular SKUs
  // Processes quantities and sorts by popularity
}
\`\`\`

#### Manufacturer Management
\`\`\`typescript
export async function createManufacturer(manufacturerData) {
  // Creates new manufacturer with validation
  // Handles numeric field formatting
  // Returns success/error status
}
\`\`\`

### Supabase Database Communication

#### Tables Accessed
- `orders`: Order header information
- `order_items`: Order line items with quantities
- `jobs`: Production jobs with status tracking
- `skus`: Product catalog with specifications
- `customers`: Customer information with active filtering
- `manufacturers`: Production partners
- `stone_lots`: Stone inventory with availability
- `diamond_lots`: Diamond inventory with status
- `information_schema.columns`: Schema validation

#### Query Patterns
- **Joins**: Extensive use of Supabase joins for related data
- **Filtering**: Status-based filtering (active, available)
- **Ordering**: Consistent sorting by creation date or name
- **Aggregation**: Statistical queries for analytics

#### Example Complex Query
\`\`\`typescript
const { data: orderItems, error: itemsError } = await supabase
  .from("order_items")
  .select(`
    *,
    skus:sku_id (*)
  `)
  .eq("order_id", orderData.id)
\`\`\`

### Error Handling Strategy
- Detailed error logging with context
- Graceful degradation to empty results
- Performance timing even during errors
- Debug queries for troubleshooting

---

## 3. logger.ts

### Overview
Centralized logging utility that provides structured, consistent logging across the application with automatic data sanitization for security.

### Key Features

#### Log Levels
\`\`\`typescript
type LogLevel = "debug" | "info" | "warn" | "error"
\`\`\`

#### Main Logger Interface
\`\`\`typescript
export const logger = {
  debug: (message, options?) => log(message, { ...options, level: "debug" }),
  info: (message, options?) => log(message, { ...options, level: "info" }),
  warn: (message, options?) => log(message, { ...options, level: "warn" }),
  error: (message, options?) => log(message, { ...options, level: "error" }),
}
\`\`\`

#### Advanced Logging Options
\`\`\`typescript
interface LogOptions {
  level?: LogLevel
  data?: any           // Additional context data
  error?: any          // Error objects
  duration?: number    // Performance timing
}
\`\`\`

#### Data Sanitization
\`\`\`typescript
function sanitizeData(data: any): any {
  // Automatically redacts sensitive fields
  const sensitiveKeys = ["password", "token", "key", "secret", "auth", "credential"]
  // Recursively processes objects to replace sensitive values with "[REDACTED]"
}
\`\`\`

### Security Features
- **Automatic Redaction**: Sensitive data automatically hidden
- **Deep Object Scanning**: Recursive sanitization of nested objects
- **Configurable Sensitivity**: Easy to add new sensitive field patterns

### Usage Patterns
\`\`\`typescript
// Basic logging
logger.info("Operation completed")

// With context data
logger.info("User created", { data: { userId: "123", email: "user@example.com" } })

// With performance timing
logger.info("Database query completed", { duration: 150.5 })

// Error logging
logger.error("Database connection failed", { error: dbError })
\`\`\`

### Supabase Database Communication
- **Indirect**: Does not directly communicate with database
- **Usage**: Extensively used by api-service.ts and validation.ts to log database operations

---

## 4. validation.ts

### Overview
Comprehensive validation system that ensures Supabase setup is correct, including environment variables, database schema, and permissions.

### Key Features

#### Environment Validation
\`\`\`typescript
export async function validateEnvironment() {
  // Validates all required environment variables
  // Checks URL format and key lengths
  // Provides detailed error reporting
}
\`\`\`

#### Schema Validation
\`\`\`typescript
const expectedSchemas = {
  skus: ["id", "sku_id", "name", "category", "size", ...],
  orders: ["id", "order_id", "order_type", "customer_id", ...],
  // ... complete schema definitions
}
\`\`\`

#### Permission Testing
\`\`\`typescript
const permissionTests = [
  { name: "Anonymous read access", client: supabase, table: "skus", operation: "select" },
  { name: "Service role write access", client: createServiceClient(), table: "skus", operation: "insert" },
]
\`\`\`

### Advanced Validation Features

#### Flexible Schema Checking
- Case-insensitive column comparison
- Missing column detection
- Detailed error reporting with specific issues

#### Permission Validation Strategy
- Critical vs non-critical test classification
- Graceful handling of permission failures
- Detailed logging for debugging

#### Error Recovery
- Continues validation even after individual failures
- Provides comprehensive failure reports
- Allows application to continue with warnings

### Supabase Database Communication

#### Direct Database Access
- **information_schema.columns**: Schema introspection
- **Test Queries**: Permission validation on actual tables
- **Service Client Usage**: Elevated permissions for comprehensive testing

#### Validation Queries
\`\`\`typescript
// Schema validation
const { data: columnData } = await serviceClient
  .from("information_schema.columns")
  .select("column_name")
  .eq("table_name", table)
  .eq("table_schema", "public")

// Permission testing
const result = await client.from(table).select("id").limit(1)
\`\`\`

---

## 5. supabase-validator.ts

### Overview
Orchestration layer for validation functions with promise caching to ensure validation runs only once per application lifecycle.

### Key Features

#### Promise Caching
\`\`\`typescript
let validationPromise: Promise<boolean> | null = null

export function validateSupabase() {
  if (!validationPromise) {
    validationPromise = validateSupabaseSetup()
    // ... promise setup and error handling
  }
  return validationPromise
}
\`\`\`

#### Validation Orchestration
\`\`\`typescript
export async function runValidation() {
  // Runs complete validation suite
  // Provides user-friendly console output
  // Suggests fallback options (mock data)
}
\`\`\`

### Console Output Management
- Formatted warning messages for validation failures
- Helpful suggestions for resolving issues
- Clear indication of mock data availability

### Integration Points
- Used by `app/layout.tsx` for application startup validation
- Provides consistent validation interface across the application

### Supabase Database Communication
- **Indirect**: Delegates to validation.ts functions
- **Caching**: Ensures database validation queries run only once

---

## 6. supabase-storage.ts

### Overview
Comprehensive file storage management system for handling image uploads, validation, and deletion in Supabase Storage.

### Key Features

#### File Validation Configuration
\`\`\`typescript
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSIONS = { width: 4000, height: 4000 }
\`\`\`

#### Image Validation
\`\`\`typescript
export async function validateImageFile(file: File) {
  // File type validation
  // Size limit checking
  // Dimension validation using HTML5 Image API
}
\`\`\`

#### Upload Management
\`\`\`typescript
export async function uploadImageToSupabase(file: File, bucket: string, path: string) {
  // Pre-upload validation
  // Supabase Storage upload with caching
  // Public URL generation
  // Comprehensive debug logging
}
\`\`\`

#### Advanced Features

##### Image Dimension Detection
\`\`\`typescript
function getImageDimensions(file: File): Promise<{width: number, height: number}> {
  // Uses HTML5 Image API to read dimensions
  // Promise-based with proper cleanup
}
\`\`\`

##### URL Parsing and Path Generation
\`\`\`typescript
function extractBucketAndPath(url: string) {
  // Parses Supabase Storage URLs
  // Extracts bucket and file path for deletion
}

export function generateSkuImagePath(skuId?: string, fileName?: string) {
  // Generates organized file paths
  // Supports temporary and permanent storage
}
\`\`\`

### Supabase Database Communication

#### Storage Operations
- **Upload**: `supabase.storage.from(bucket).upload(path, file)`
- **Delete**: `serviceClient.storage.from(bucket).remove([path])`
- **Public URLs**: `supabase.storage.from(bucket).getPublicUrl(path)`

#### Security Model
- Browser client for uploads (respects storage policies)
- Service client for deletions (elevated permissions)

#### Storage Structure
\`\`\`
skus/
  ├── {sku-id}/
  │   └── original.{ext}
  └── temp/
      └── {timestamp}-{random}.{ext}
\`\`\`

### Error Handling
- Detailed validation error messages
- Upload failure recovery
- URL parsing error handling
- Debug logging throughout process

---

## 7. client-id-generator.ts

### Overview
Simple utility for generating unique client-side identifiers, primarily used for temporary UI state management.

### Key Features

#### ID Generation
\`\`\`typescript
let clientIdCounter = 0

export const generateClientId = (): string => {
  return `allocation_${++clientIdCounter}_${Date.now()}`
}
\`\`\`

#### Counter Management
\`\`\`typescript
export const resetClientIdCounter = (): void => {
  clientIdCounter = 0
}
\`\`\`

### Usage Patterns
- Temporary allocation IDs in stone/diamond selection
- Client-side form field identification
- UI state management for dynamic components

### Supabase Database Communication
- **None**: Purely client-side utility
- **Usage Context**: Generated IDs used in components that later interact with database

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
