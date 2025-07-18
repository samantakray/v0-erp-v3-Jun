# Server Actions Documentation

## Summary

This document provides a comprehensive overview of the server actions used in the Jewelry ERP system. Each action file serves a specific purpose:

| Action File | Primary Objective |
|-------------|-------------------|
| **order-actions.ts** | Manages the complete lifecycle of orders including creation, updating, deletion, and status tracking. Handles the complex process of generating order IDs and creating associated jobs. |
| **job-actions.ts** | Controls job workflow progression through different phases, updates job statuses, and manages job history. Synchronizes job statuses with parent order statuses. |
| **image-actions.ts** | Handles all image operations for SKUs including uploading, updating, and deleting images from Supabase Storage. |
| **sku-actions.ts** | Manages individual SKU creation and deletion operations with integrated image handling. |
| **sku-sequence-actions.ts** | Generates sequential SKU IDs and handles batch creation of multiple SKUs with shared sequence numbers. |

## Detailed Documentation

### order-actions.ts

**Purpose**: Manages the complete lifecycle of orders in the system.

#### Functions

##### `createOrder(orderData: Omit<Order, "id">)`

Creates a new order in the system with associated order items and jobs.

**Process Flow**:
1. Checks if mock mode is enabled
2. Creates a Supabase service client
3. Inserts the order record (letting database trigger generate the order_id)
4. Fetches SKU data for referenced SKUs
5. Creates order items linking orders and SKUs
6. Generates jobs for each order item (quantity × items)
7. Creates initial job history entries
8. Revalidates relevant paths

**Supabase Interactions**:
- **Tables**: `orders`, `order_items`, `jobs`, `job_history`, `skus`
- **Operations**: INSERT into multiple tables
- **Transactions**: Implicit (not using explicit transaction blocks)

**Unique Features**:
- Handles bulk job creation with sequential job IDs
- Supports individual production/delivery dates per SKU
- Creates initial history entries for audit trail

##### `updateOrder(orderData: Order)`

Updates an existing order and its associated items.

**Process Flow**:
1. Retrieves the UUID of the order using the order_id
2. Updates the order record
3. Deletes existing order items
4. Creates new order items based on updated data
5. Revalidates paths

**Supabase Interactions**:
- **Tables**: `orders`, `order_items`, `skus`
- **Operations**: SELECT, UPDATE, DELETE, INSERT
- **Transactions**: Implicit

**Unique Features**:
- Implements a delete-and-recreate pattern for order items
- Preserves the original order_id while updating all other fields

##### `deleteOrder(orderId: string)`

Deletes an order and all associated records.

**Process Flow**:
1. Retrieves the UUID of the order using the order_id
2. Deletes order items first (due to foreign key constraints)
3. Deletes jobs associated with the order
4. Deletes the order record
5. Revalidates paths

**Supabase Interactions**:
- **Tables**: `orders`, `order_items`, `jobs`
- **Operations**: SELECT, DELETE (cascading)
- **Transactions**: Implicit

**Unique Features**:
- Handles deletion in the correct order to respect foreign key constraints
- Performs cascading deletion of related records

##### `getPredictedNextOrderNumber()`

Predicts the next order number based on the most recent order.

**Process Flow**:
1. Fetches the most recent order from the database
2. Extracts the numerical part from the order_id
3. Increments by 1 and formats with leading zeros
4. Returns the predicted order ID

**Supabase Interactions**:
- **Tables**: `orders`
- **Operations**: SELECT with ordering and limit
- **Transactions**: None (read-only)

**Unique Features**:
- Used for UI display only, doesn't consume a sequence number
- Handles the case when no orders exist

##### `getOpenOrderCount()`

Gets the count of open orders (not marked as Completed or Cancelled).

**Process Flow**:
1. Queries the database for orders not in "Completed" or "Cancelled" status
2. Returns the count

**Supabase Interactions**:
- **Tables**: `orders`
- **Operations**: SELECT COUNT with filtering
- **Transactions**: None (read-only)

**Unique Features**:
- Uses Supabase's count feature with head:true for efficiency
- Filters using NOT IN operator for statuses

### job-actions.ts

**Purpose**: Controls job workflow progression and status management.

#### Functions

##### `updateJobPhase(jobId: string, phase: string, data: any)`

Updates a job's phase and status, storing phase-specific data.

**Process Flow**:
1. Fetches the job UUID using the job_id
2. Determines the new status and next phase based on the current phase
3. **For the Quality Check phase, validates the incoming data against a Zod schema in `lib/validation.ts`**
4. Prepares phase-specific data for storage, **including complex nested arrays for gold, diamond, and stone usage**
5. Updates the job record
6. Adds a job history entry
7. Updates the parent order status based on all job statuses
8. Revalidates relevant paths

**Supabase Interactions**:
- **Tables**: `jobs`, `job_history`, `orders`
- **Operations**: SELECT, UPDATE, INSERT
- **Transactions**: Implicit

**Unique Features**:
- Handles phase-specific data storage (stone_data, diamond_data, etc.)
- Implements automatic order status synchronization
- Creates audit trail entries in job_history

##### `createJob(orderId: string, skuId: string, size?: string)`

Creates a new job associated with an existing order.

**Process Flow**:
1. Fetches order UUID and production/delivery dates
2. Fetches SKU UUID
3. Counts existing jobs to determine the next sequence number
4. Generates a new job ID
5. Creates the job record
6. Adds an initial job history entry
7. Revalidates paths

**Supabase Interactions**:
- **Tables**: `orders`, `skus`, `jobs`, `job_history`
- **Operations**: SELECT, INSERT, COUNT
- **Transactions**: Implicit

**Unique Features**:
- Generates sequential job IDs based on existing jobs
- Inherits production and delivery dates from the parent order

### image-actions.ts

**Purpose**: Manages image operations for SKUs in Supabase Storage.

#### Functions

##### `uploadSkuImage(file: File, skuId: string)`

Uploads an image for a specific SKU.

**Process Flow**:
1. Generates a storage path for the image
2. Uploads the image to Supabase Storage
3. Updates the SKU record with the new image URL
4. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket
- **Operations**: UPDATE table, UPLOAD to storage
- **Transactions**: None (separate operations)

**Unique Features**:
- Handles cleanup if database update fails after storage upload
- Uses structured path generation for organized storage

##### `updateSkuImage(skuId: string, newFile: File)`

Updates an existing SKU's image.

**Process Flow**:
1. Fetches the current image URL
2. Uploads the new image
3. Updates the SKU record with the new image URL
4. Deletes the old image if it exists and isn't a placeholder
5. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket
- **Operations**: SELECT, UPDATE, UPLOAD, DELETE
- **Transactions**: None (separate operations)

**Unique Features**:
- Handles the complete image replacement workflow
- Includes cleanup of old images to prevent storage bloat

##### `deleteSkuImage(skuId: string)`

Deletes an image associated with a SKU.

**Process Flow**:
1. Fetches the current image URL
2. Checks if there's an actual image to delete (not a placeholder)
3. Deletes the image from storage
4. Updates the SKU record to use a placeholder image
5. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket
- **Operations**: SELECT, UPDATE, DELETE from storage
- **Transactions**: None (separate operations)

**Unique Features**:
- Handles the case when there's no image to delete
- Resets to placeholder image rather than null

### sku-actions.ts

**Purpose**: Manages individual SKU creation and deletion.

#### Functions

##### `createSku(skuData: Omit<SKU, "id" | "createdAt">, preGeneratedId?: string, imageFile?: File)`

Creates a single SKU with optional image upload.

**Process Flow**:
1. Handles image upload if file and preGeneratedId are provided
2. Formats data for Supabase insertion
3. Inserts the SKU record
4. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket (if image provided)
- **Operations**: INSERT, potentially UPLOAD
- **Transactions**: None (separate operations)

**Unique Features**:
- Supports both auto-generated and pre-generated SKU IDs
- Integrates image upload within the SKU creation process
- Includes extensive debug logging

##### `deleteSku(skuId: string)`

Deletes a SKU and its associated image.

**Process Flow**:
1. Fetches the SKU to check for associated images
2. Deletes the image if it exists and isn't a placeholder
3. Deletes the SKU record
4. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket (if image exists)
- **Operations**: SELECT, DELETE from table, potentially DELETE from storage
- **Transactions**: None (separate operations)

**Unique Features**:
- Handles image cleanup during SKU deletion
- Continues SKU deletion even if image deletion fails

### sku-sequence-actions.ts

**Purpose**: Manages SKU ID generation and batch creation.

#### Functions

##### `getPredictedNextSkuNumber()`

Gets the most recent SKU ID to predict the next sequence number.

**Process Flow**:
1. Fetches the most recent SKU from the database
2. Extracts the numerical part from the sku_id
3. Increments by 1 and formats with leading zeros
4. Returns the predicted number

**Supabase Interactions**:
- **Tables**: `skus`
- **Operations**: SELECT with ordering and limit
- **Transactions**: None (read-only)

**Unique Features**:
- Used for UI display only, doesn't consume a sequence number
- Returns both raw number and formatted string

##### `getNextSkuNumber()`

Gets the next sequential number for SKU generation from the database sequence.

**Process Flow**:
1. Calls the database function via RPC
2. Formats the returned number with leading zeros
3. Returns both raw and formatted numbers

**Supabase Interactions**:
- **Functions**: `get_next_sku_sequence_value` (RPC)
- **Operations**: RPC call
- **Transactions**: Handled by the database function

**Unique Features**:
- Uses Supabase RPC to call a database function
- Consumes an actual sequence number from the database

##### `createSkuBatch(skus: SkuBatchItem[])`

Creates multiple SKUs with pre-generated SKU IDs and handles image uploads.

**Process Flow**:
1. Processes image uploads for SKUs with image files
2. Formats data for Supabase insertion
3. Inserts all SKUs in a batch operation
4. Handles cleanup of uploaded images if database insertion fails
5. Revalidates paths

**Supabase Interactions**:
- **Tables**: `skus`
- **Storage**: `product-images` bucket (for SKUs with images)
- **Operations**: INSERT (batch), potentially multiple UPLOADs
- **Transactions**: Implicit for the database insertion

**Unique Features**:
- Handles multiple image uploads in parallel
- Implements cleanup mechanism for partial failures
- Uses pre-generated SKU IDs with shared sequence numbers

## Integration Points

### Cross-File Dependencies

- **order-actions.ts** depends on job-related constants from `constants/job-workflow.ts`
- **job-actions.ts** depends on order status mapping from `constants/job-workflow.ts`
- **image-actions.ts** depends on storage utilities from `lib/supabase-storage.ts`
- **sku-sequence-actions.ts** depends on storage utilities for batch image handling

### Shared Patterns

1. **Performance Monitoring**: All actions use performance.now() to track execution time
2. **Comprehensive Logging**: Consistent logging pattern with info, debug, and error levels
3. **Mock Mode Support**: Order and job actions check for mock mode to support development
4. **Path Revalidation**: All actions that modify data revalidate relevant Next.js paths
5. **Error Handling**: Consistent try/catch patterns with detailed error logging
6. **Service Client Usage**: All actions use the service role client for elevated permissions

## Security Considerations

1. All actions are marked with 'use server' to ensure they only execute on the server
2. Service role client is used for elevated database access
3. No sensitive information is returned to the client
4. Input validation is performed before database operations
5. Error messages are sanitized before returning to the client

## Performance Optimizations

1. Batch operations are used where possible (createSkuBatch)
2. Parallel processing for image uploads in batch operations
3. Efficient queries with count:exact, head:true for counting operations
4. Selective column fetching to minimize data transfer
5. Path revalidation is targeted to specific routes
