# API Reference

## Overview

The Jewelry ERP application provides a set of API functions for interacting with the database. This document describes these functions and their usage.

## API Service

The API service is implemented in `/lib/api-service.ts` and provides functions for fetching and updating data.

### Order APIs

#### `fetchOrder(orderId: string): Promise<{ order: Order | null }>`

Fetches a single order by ID.

**Parameters:**
- `orderId`: The ID of the order to fetch

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

Fetches all orders.

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

Fetches a single job by ID.

**Parameters:**
- `jobId`: The ID of the job to fetch

**Returns:**
- Promise resolving to the job or null if not found

**Example:**
\`\`\`typescript
import { fetchJob } from "@/lib/api-service"

async function getJobDetails(jobId: string) {
  const job = await fetchJob(jobId)
  if (job) {
    console.log(`Job ${job.id} is in phase ${job.currentPhase}`)
  }
}
\`\`\`

#### `fetchJobs(orderId: string): Promise<Job[]>`

Fetches all jobs for a specific order.

**Parameters:**
- `orderId`: The ID of the order to fetch jobs for

**Returns:**
- Promise resolving to an array of jobs

**Example:**
\`\`\`typescript
import { fetchJobs } from "@/lib/api-service"

async function getOrderJobs(orderId: string) {
  const jobs = await fetchJobs(orderId)
  console.log(`Order ${orderId} has ${jobs.length} jobs`)
}
\`\`\`

### SKU APIs

#### `fetchSkus(): Promise<SKU[]>`

Fetches all SKUs.

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

## Server Actions

The application uses Next.js Server Actions for data mutations. These are implemented in various files throughout the application.

### Job Actions

#### `updateJobPhase(jobId: string, phase: string, data: any): Promise<Job>`

Updates a job's phase and associated data.

**Parameters:**
- `jobId`: The ID of the job to update
- `phase`: The new phase
- `data`: Phase-specific data

**Returns:**
- Promise resolving to the updated job

**Example:**
\`\`\`typescript
import { updateJobPhase } from "@/actions/job-actions"

async function completeStoneSelection(jobId: string, stoneData: any) {
  const updatedJob = await updateJobPhase(jobId, "diamond", stoneData)
  return updatedJob
}
\`\`\`

## Supabase Integration

### Client Configuration

The Supabase client is configured in `lib/supabaseClient.ts` and provides two client instances:

1. **Anonymous Client**: For operations that can be performed by unauthenticated users
2. **Service Role Client**: For operations that require elevated permissions

\`\`\`typescript
// Anonymous client for browser-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations
export const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}
\`\`\`

### Enhanced Logging

All Supabase operations are logged using a custom logging system:

\`\`\`typescript
// Example of logged Supabase operation
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("order_id", orderId)
  .single()

// This operation will generate logs with:
// - Operation type (SELECT)
// - Table name (orders)
// - Parameters (order_id)
// - Execution time
// - Result summary
// - Any errors
\`\`\`

### Data Transformation

The API service transforms Supabase data to match the application's data models:

\`\`\`typescript
// Example of data transformation
const order: Order = {
  id: orderData.order_id,
  orderType: orderData.order_type,
  customerName: orderData.customer_name,
  // ... other fields
}
\`\`\`

### Error Handling

All Supabase operations include error handling:

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

### Switching Between Mock and Real Data

The application can switch between mock data and real Supabase data using the `NEXT_PUBLIC_USE_MOCKS` environment variable:

- When set to `"true"`, the application uses mock data
- When set to `"false"`, the application uses Supabase

**Example Environment Configuration:**
\`\`\`
NEXT_PUBLIC_USE_MOCKS=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### Validation System

The application includes a validation system that checks:

1. **Environment Variables**: Verifies that all required Supabase environment variables are set
2. **Database Schema**: Checks that all required tables and columns exist
3. **Permissions**: Verifies that the application has the necessary permissions to perform operations

This validation runs at application startup and logs any issues.
