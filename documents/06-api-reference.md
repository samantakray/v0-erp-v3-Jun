
# API Reference

## Overview

The Jewelry ERP application provides a comprehensive set of API functions and Server Actions for interacting with the database and managing business operations. This document describes these functions, their usage, and implementation details.

## API Service Functions (`/lib/api-service.ts`)

The API service provides read-only functions for fetching data from the database. All functions automatically switch between mock data and real Supabase data based on the `NEXT_PUBLIC_USE_MOCKS` environment variable.

### Order APIs

#### `fetchOrder(orderId: string): Promise<{ order: Order | null }>`

Fetches a single order by ID with all associated SKU items.

**Parameters:**
- `orderId`: The order ID (format: `O-XXXX`)

**Returns:**
- Promise resolving to an object containing the order or null if not found

**Example:**
\`\`\`typescript
import { fetchOrder } from "@/lib/api-service"

async function getOrderDetails(orderId: string) {
  const { order } = await fetchOrder(orderId)
  if (order) {
    console.log(`Order ${order.id} has ${order.skus.length} SKUs`)
  }
}
\`\`\`

#### `fetchOrders(): Promise<Order[]>`

Fetches all orders with their associated SKU items, ordered by creation date (newest first).

**Returns:**
- Promise resolving to an array of orders

**Example:**
\`\`\`typescript
import { fetchOrders } from "@/lib/api-service"

async function getAllOrders() {
  const orders = await fetchOrders()
  console.log(`Found ${orders.length} orders`)
}
\`\`\`

### Job APIs

#### `fetchJob(jobId: string): Promise<Job | null>`

Fetches a single job by ID with all associated data including SKU details, phase data, and order information.

**Parameters:**
- `jobId`: The job ID (format: `J-XXXX-X`)

**Returns:**
- Promise resolving to the job or null if not found

**Example:**
\`\`\`typescript
import { fetchJob } from "@/lib/api-service"

async function getJobDetails(jobId: string) {
  const job = await fetchJob(jobId)
  if (job) {
    console.log(`Job ${job.id} is in phase ${job.currentPhase}`)
    console.log(`Stone data:`, job.stoneData)
    console.log(`Diamond data:`, job.diamondData)
  }
}
\`\`\`

#### `fetchJobs(orderId: string): Promise<Job[]>`

Fetches all jobs for a specific order with complete job details.

**Parameters:**
- `orderId`: The order ID to fetch jobs for

**Returns:**
- Promise resolving to an array of jobs

**Example:**
\`\`\`typescript
import { fetchJobs } from "@/lib/api-service"

async function getOrderJobs(orderId: string) {
  const jobs = await fetchJobs(orderId)
  console.log(`Order ${orderId} has ${jobs.length} jobs`)
  jobs.forEach(job => {
    console.log(`Job ${job.id}: ${job.status} (${job.currentPhase})`)
  })
}
\`\`\`

### SKU APIs

#### `fetchSkus(): Promise<SKU[]>`

Fetches all SKUs ordered by creation date (newest first).

**Returns:**
- Promise resolving to an array of SKUs

**Example:**
\`\`\`typescript
import { fetchSkus } from "@/lib/api-service"

async function getAllSkus() {
  const skus = await fetchSkus()
  console.log(`Found ${skus.length} SKUs`)
}
\`\`\`

### Customer APIs

#### `fetchCustomers(): Promise<Customer[]>`

Fetches all active customers ordered by name.

**Returns:**
- Promise resolving to an array of customer objects

**Example:**
\`\`\`typescript
import { fetchCustomers } from "@/lib/api-service"

async function getActiveCustomers() {
  const customers = await fetchCustomers()
  console.log(`Found ${customers.length} active customers`)
}
\`\`\`

### Manufacturer APIs

#### `fetchManufacturers(): Promise<Manufacturer[]>`

Fetches all manufacturers ordered by name.

**Returns:**
- Promise resolving to an array of manufacturer objects

**Example:**
\`\`\`typescript
import { fetchManufacturers } from "@/lib/api-service"

async function getAllManufacturers() {
  const manufacturers = await fetchManufacturers()
  console.log(`Found ${manufacturers.length} manufacturers`)
}
\`\`\`

#### `createManufacturer(manufacturerData): Promise<{ success: boolean, data?: Manufacturer, error?: string }>`

Creates a new manufacturer in the database.

**Parameters:**
- `manufacturerData`: Object containing manufacturer details
  - `name`: string (required)
  - `current_load`: number (optional)
  - `past_job_count`: number (optional)
  - `rating`: number (optional)
  - `active`: boolean (required)

**Returns:**
- Promise resolving to success status and created manufacturer data

### Statistics APIs

#### `getSkuStatistics(limit?: number): Promise<SkuStatistic[]>`

Fetches statistics about the most ordered SKUs.

**Parameters:**
- `limit`: Number of SKUs to return (default: 5)

**Returns:**
- Promise resolving to an array of SKU statistics with order counts

**Example:**
\`\`\`typescript
import { getSkuStatistics } from "@/lib/api-service"

async function getTopSkus() {
  const stats = await getSkuStatistics(10)
  stats.forEach(stat => {
    console.log(`${stat.name}: ${stat.count} orders`)
  })
}
\`\`\`

### Material Lot APIs

#### `fetchStoneLots(): Promise<StoneLotData[]>`

Fetches all available stone lots for allocation.

**Returns:**
- Promise resolving to an array of stone lot objects

**Data Structure:**
\`\`\`typescript
interface StoneLotData {
  id: string
  lot_number: string
  stone_type: string
  size: string
  quantity: number
  weight: number
  available: boolean
}
\`\`\`

#### `fetchDiamondLots(): Promise<DiamondLotData[]>`

Fetches all available diamond lots for allocation.

**Returns:**
- Promise resolving to an array of diamond lot objects

**Data Structure:**
\`\`\`typescript
interface DiamondLotData {
  id: string
  lot_number: string
  size: string
  shape: string
  quality: string
  a_type: string
  stonegroup: string
  quantity: number
  weight: number
  price: number
  status: string
}
\`\`\`

## Server Actions

Server Actions handle data mutations and are implemented across multiple files for different domains.

### Order Actions (`/app/actions/order-actions.ts`)

#### `createOrder(orderData: Omit<Order, "id">): Promise<{ success: boolean, orderId?: string, error?: string }>`

Creates a new order with automatic job generation.

**Parameters:**
- `orderData`: Order object without ID (ID is auto-generated)

**Returns:**
- Promise resolving to success status and generated order ID

**Features:**
- Automatic order ID generation (O-XXXX format)
- Automatic job creation for each SKU unit
- Job ID generation (J-XXXX-X format)
- Initial job history entries
- Order status management

**Example:**
\`\`\`typescript
import { createOrder } from "@/app/actions/order-actions"

async function submitNewOrder(orderData) {
  const result = await createOrder(orderData)
  if (result.success) {
    console.log(`Order created: ${result.orderId}`)
  } else {
    console.error(`Error: ${result.error}`)
  }
}
\`\`\`

#### `updateOrder(orderData: Order): Promise<{ success: boolean, orderId?: string, error?: string }>`

Updates an existing order and recreates associated order items.

**Parameters:**
- `orderData`: Complete order object with ID

**Returns:**
- Promise resolving to success status

#### `deleteOrder(orderId: string): Promise<{ success: boolean, error?: string }>`

Deletes an order and all associated order items and jobs.

**Parameters:**
- `orderId`: The order ID to delete

**Returns:**
- Promise resolving to success status

#### `getPredictedNextOrderNumber(): Promise<{ success: boolean, predictedOrderId?: string, error?: string }>`

Predicts the next order number for UI display (doesn't consume a sequence).

**Returns:**
- Promise resolving to predicted order ID

#### `getOpenOrderCount(): Promise<{ count: number, error?: string }>`

Gets the count of open orders (not Completed or Cancelled).

**Returns:**
- Promise resolving to order count

### Job Actions (`/app/actions/job-actions.ts`)

#### `updateJobPhase(jobId: string, phase: string, data: any): Promise<{ success: boolean, newStatus?: string, newPhase?: string, error?: string }>`

Updates a job's phase and advances it through the workflow.

**Parameters:**
- `jobId`: The job ID to update
- `phase`: The current phase being completed
- `data`: Phase-specific data

**Phase Transitions:**
- `JOB_PHASE.STONE` → `JOB_STATUS.STONE_SELECTED` → `JOB_PHASE.DIAMOND`
- `JOB_PHASE.DIAMOND` → `JOB_STATUS.DIAMOND_SELECTED` → `JOB_PHASE.MANUFACTURER`
- `JOB_PHASE.MANUFACTURER` → `JOB_STATUS.SENT_TO_MANUFACTURER` → `JOB_PHASE.QUALITY_CHECK`
- `JOB_PHASE.QUALITY_CHECK` → `JOB_STATUS.QC_PASSED/QC_FAILED` → `JOB_PHASE.COMPLETE/MANUFACTURER`
- `JOB_PHASE.COMPLETE` → `JOB_STATUS.COMPLETED`

**Data Structures by Phase:**
\`\`\`typescript
// Stone Selection Data
type StoneSelectionData = {
  allocations: StoneAllocation[]
  total_quantity: number
  total_weight: number
  timestamp: string
}

// Diamond Selection Data
type DiamondSelectionData = {
  allocations: DiamondAllocation[]
  total_quantity: number
  total_weight: number
  timestamp: string
}

// Manufacturer Data
type ManufacturerData = {
  name: string
  expectedCompletionDate: string
  remarks?: string
}

// QC Data (Validated)
type QCData = {
  measuredWeight: number
  passed: boolean
  notes?: string
  goldUsage?: GoldUsageDetail[]
  diamondUsage?: DiamondUsageDetail[]
  coloredStoneUsage?: ColoredStoneUsageDetail[]
}

// Gold Usage Detail for QC
interface GoldUsageDetail {
  description: string
  grossWeight: number
  scrapWeight: number
}

// Diamond Usage Detail for QC
interface DiamondUsageDetail {
  type: string // lot number
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}

// Colored Stone Usage Detail for QC
interface ColoredStoneUsageDetail {
  type: string // lot number
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}
\`\`\`

#### `createJob(orderId: string, skuId: string, size?: string): Promise<{ success: boolean, jobId?: string, error?: string }>`

Creates a new job for an existing order.

**Parameters:**
- `orderId`: The order ID
- `skuId`: The SKU ID
- `size`: Optional size specification

**Returns:**
- Promise resolving to success status and generated job ID

### SKU Actions (`/app/actions/sku-actions.ts`)

#### `createSku(skuData, preGeneratedId?, imageFile?): Promise<{ success: boolean, sku?: SKU, error?: string }>`

Creates a single SKU with optional image upload.

**Parameters:**
- `skuData`: SKU data without ID
- `preGeneratedId`: Optional pre-generated SKU ID
- `imageFile`: Optional image file to upload

**Returns:**
- Promise resolving to success status and created SKU

#### `deleteSku(skuId: string): Promise<{ success: boolean, error?: string }>`

Deletes a SKU and its associated image.

**Parameters:**
- `skuId`: The SKU ID to delete

**Returns:**
- Promise resolving to success status

### SKU Sequence Actions (`/app/actions/sku-sequence-actions.ts`)

#### `getPredictedNextSkuNumber(): Promise<{ success: boolean, predictedNumber?: number, formattedNumber?: string, error?: string }>`

Predicts the next SKU sequence number for UI display.

**Returns:**
- Promise resolving to predicted sequence number

#### `getNextSkuNumber(): Promise<{ success: boolean, nextNumber?: number, formattedNumber?: string, error?: string }>`

Gets the next sequential number for SKU generation (consumes sequence).

**Returns:**
- Promise resolving to next sequence number

#### `createSkuBatch(skus: SkuBatchItem[]): Promise<{ success: boolean, skus?: SKU[], error?: string }>`

Creates multiple SKUs in a single transaction with image handling.

**Parameters:**
- `skus`: Array of SKU objects with pre-generated IDs and optional image files

**Returns:**
- Promise resolving to success status and created SKUs

### Image Actions (`/app/actions/image-actions.ts`)

#### `uploadSkuImage(file: File, skuId: string): Promise<{ success: boolean, url?: string, error?: string }>`

Uploads an image for a specific SKU.

**Parameters:**
- `file`: The image file to upload
- `skuId`: The SKU ID to associate the image with

**Returns:**
- Promise resolving to success status and image URL

#### `updateSkuImage(skuId: string, newFile: File): Promise<{ success: boolean, url?: string, error?: string }>`

Updates an existing SKU's image.

**Parameters:**
- `skuId`: The SKU ID
- `newFile`: The new image file

**Returns:**
- Promise resolving to success status and new image URL

#### `deleteSkuImage(skuId: string): Promise<{ success: boolean, error?: string }>`

Deletes an image associated with a SKU.

**Parameters:**
- `skuId`: The SKU ID

**Returns:**
- Promise resolving to success status

## Supabase Integration

### Client Configuration

The Supabase integration uses two client configurations:

\`\`\`typescript
// Anonymous client for browser-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations
export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}
\`\`\`

### Enhanced Logging

All Supabase operations are logged using a custom logging system that captures:
- Operation type (SELECT, INSERT, UPDATE, DELETE)
- Table name
- Parameters and filters
- Execution time
- Result summary
- Error details

### Data Transformation

The API service transforms Supabase data to match the application's data models:

\`\`\`typescript
// Example: Order transformation
const order: Order = {
  id: orderData.order_id,           // Transform UUID to readable ID
  orderType: orderData.order_type,
  customerName: orderData.customer_name,
  skus: orderItems.map(item => ({   // Transform related data
    id: item.skus.sku_id,
    name: item.skus.name,
    quantity: item.quantity,
    // ... other fields
  })),
  // ... other fields
}
\`\`\`

### Error Handling

All API functions include comprehensive error handling:

\`\`\`typescript
const { data, error } = await supabase.from("orders").select("*")

if (error) {
  logger.error("Error fetching orders from Supabase", {
    error,
    duration,
  })
  return []
}
\`\`\`

### Mock Data Integration

The application seamlessly switches between mock and real data:

\`\`\`typescript
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

if (useMocks) {
  // Return mock data
  return mockOrders
}

// Proceed with Supabase query
\`\`\`

## Environment Variables

### Required Variables

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Mode
NEXT_PUBLIC_USE_MOCKS=false

# Database (if using direct connections)
POSTGRES_URL=your-postgres-url
\`\`\`

### Optional Variables

\`\`\`env
# Additional Supabase keys
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key

# Database connection details
POSTGRES_HOST=your-host
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database
\`\`\`

## Error Handling Patterns

### Server Actions

\`\`\`typescript
export async function createOrder(orderData) {
  try {
    // Operation logic
    return { success: true, orderId: newOrder.order_id }
  } catch (error) {
    logger.error("Unexpected error in createOrder", { error })
    return { success: false, error: "An unexpected error occurred" }
  }
}
\`\`\`

### API Service Functions

\`\`\`typescript
export async function fetchOrders() {
  try {
    const { data, error } = await supabase.from("orders").select("*")
    
    if (error) {
      logger.error("Error fetching orders", { error })
      return []
    }
    
    return data
  } catch (error) {
    logger.error("Unexpected error in fetchOrders", { error })
    return []
  }
}
\`\`\`

## Performance Considerations

### Batch Operations

- Use `createSkuBatch` for creating multiple SKUs
- Order creation automatically handles bulk job generation
- Image uploads are processed in parallel where possible

### Caching and Revalidation

Server Actions automatically revalidate relevant paths:

\`\`\`typescript
// Revalidate paths after mutations
revalidatePath("/orders")
revalidatePath(`/orders/${orderId}/jobs`)
\`\`\`

### Logging Performance

All operations include performance timing:

\`\`\`typescript
const startTime = performance.now()
// ... operation
const duration = performance.now() - startTime
logger.info("Operation completed", { duration })
\`\`\`

## Usage Examples

### Complete Order Creation Flow

\`\`\`typescript
import { createOrder } from "@/app/actions/order-actions"
import { fetchSkus } from "@/lib/api-service"

async function createCompleteOrder() {
  // 1. Fetch available SKUs
  const skus = await fetchSkus()
  
  // 2. Prepare order data
  const orderData = {
    orderType: "Customer",
    customerName: "John Doe",
    customerId: "CUST-001",
    skus: [
      {
        id: skus[0].id,
        name: skus[0].name,
        quantity: 2,
        size: "7",
        remarks: "Special finish"
      }
    ],
    productionDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "New",
    action: "Process",
    remarks: "Rush order"
  }
  
  // 3. Create order (jobs are auto-generated)
  const result = await createOrder(orderData)
  
  if (result.success) {
    console.log(`Order ${result.orderId} created successfully`)
  }
}
\`\`\`

### Job Phase Progression

\`\`\`typescript
import { updateJobPhase } from "@/app/actions/job-actions"
import { fetchStoneLots } from "@/lib/api-service"

async function completeStoneSelection(jobId: string) {
  // 1. Fetch available stone lots
  const stoneLots = await fetchStoneLots()
  
  // 2. Prepare stone allocation data
  const stoneData = {
    allocations: [
      {
        clientId: "stone-1",
        lot_number: stoneLots[0].lot_number,
        stone_type: stoneLots[0].stone_type,
        size: stoneLots[0].size,
        quantity: 5,
        weight: 2.5
      }
    ],
    total_quantity: 5,
    total_weight: 2.5,
    timestamp: new Date().toISOString()
  }
  
  // 3. Update job phase
  const result = await updateJobPhase(jobId, "stone", stoneData)
  
  if (result.success) {
    console.log(`Job ${jobId} advanced to ${result.newPhase}`)
  }
}
\`\`\`

This comprehensive API reference covers all current functionality in the Jewelry ERP application's API layer.
