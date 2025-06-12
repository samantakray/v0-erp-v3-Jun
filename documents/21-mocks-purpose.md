# 21-mocks-purpose.md: Understanding and Using Mock Data

The `mocks/` folder in this project serves a crucial role in facilitating development, testing, and demonstration of the application without requiring a live database connection. It provides static, predefined data that mimics the structure and content of the data typically fetched from the Supabase backend.

## Why were Mocks Created?

The primary reasons for creating and utilizing mock data are:

1.  **Offline Development**: Developers can work on features and UI components even when they don't have an active internet connection or access to the Supabase database.
2.  **Faster Iteration**: Fetching data from a local mock file is significantly faster than making network requests to a remote database. This speeds up development cycles, especially for UI-heavy tasks.
3.  **Consistent Test Data**: Mocks provide predictable and consistent data for testing purposes, ensuring that UI components and logic behave as expected under known conditions. This helps in debugging and reproducing issues.
4.  **Reduced Supabase Usage**: During heavy development, using mocks can reduce the number of reads and writes to the Supabase database, potentially saving costs and avoiding rate limits.
5.  **Demonstration**: Mocks allow for easy demonstration of application features without needing to populate a live database with sample data.

## How Mocks are Enabled/Disabled

The use of mock data versus live Supabase data is controlled by an environment variable: `NEXT_PUBLIC_USE_MOCKS`.

-   **To enable mocks**: Set `NEXT_PUBLIC_USE_MOCKS=true` in your `.env.local` file or as an environment variable in your deployment environment (e.g., Vercel).
-   **To disable mocks**: Set `NEXT_PUBLIC_USE_MOCKS=false` or simply omit the variable. By default, if this variable is not set or is set to anything other than `"true"`, the application will attempt to connect to Supabase.

The `lib/api-service.ts` file is responsible for checking this environment variable and conditionally returning mock data or fetching from Supabase.

## How `lib/api-service.ts` Uses Mocks

The `lib/api-service.ts` file is the central point for all data fetching operations in the application. It contains functions like `fetchOrder`, `fetchJobs`, `fetchSkus`, `fetchCustomers`, `fetchManufacturers`, `getSkuStatistics`, `fetchStoneLots`, and `fetchDiamondLots`.

Each of these functions includes a conditional check at the beginning:

\`\`\`typescript
// lib/api-service.ts
import { supabase } from "./supabaseClient"
import { logger } from "./logger"
import type { Order, SKU, Job, StoneLotData, DiamondLotData } from "@/types"
import { orders as mockOrders } from "@/mocks/orders"
import { skus as mockSkus } from "@/mocks/skus"
import { jobs as mockJobs } from "@/mocks/jobs"

// Helper to determine if we should use mock data
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

export async function fetchOrder(orderId: string): Promise<{ order: Order | null }> {
  const startTime = performance.now()
  logger.info(`fetchOrder called`, { data: { orderId, useMocks } })

  if (useMocks) {
    // Use mock data
    const order = mockOrders.find((o) => o.id === orderId) || null
    const duration = performance.now() - startTime
    logger.info(`fetchOrder completed with mock data`, {
      data: { orderId, found: !!order },
      duration,
    })
    return { order }
  }

  // ... (Supabase fetching logic follows if useMocks is false)
}

// Similar logic applies to fetchJobs, fetchSkus, fetchCustomers, fetchManufacturers, getSkuStatistics, fetchStoneLots, and fetchDiamondLots.
\`\`\`

If `useMocks` is `true`, the function immediately returns data from the corresponding mock file. Otherwise, it proceeds to execute the Supabase query. This pattern ensures that the application can seamlessly switch between mock and live data sources.

## Overview of Mock Files

The `mocks/` folder contains several TypeScript files, each providing mock data for a specific entity:

### `mocks/orders.ts`

-   **Purpose**: Provides an array of mock `Order` objects.
-   **Content**: Contains sample order data, including `id`, `orderType`, `customerName`, `skus` (with nested SKU details), `dueDate`, `status`, and other relevant order attributes. This data is used by `fetchOrders` and `fetchOrder` when mocks are enabled.
-   **Example Usage**: When `fetchOrders()` is called with `NEXT_PUBLIC_USE_MOCKS=true`, it returns the `orders` array from this file.

### `mocks/skus.ts`

-   **Purpose**: Provides an array of mock `SKU` (Stock Keeping Unit) objects.
-   **Content**: Defines sample SKU data, including `id`, `name`, `category`, `size`, `goldType`, `stoneType`, `diamondType`, and `image`. This data is used by `fetchSkus` and also referenced within `mocks/orders.ts` and `mocks/jobs.ts` to provide consistent SKU details.
-   **Example Usage**: When `fetchSkus()` is called with `NEXT_PUBLIC_USE_MOCKS=true`, it returns the `skus` array from this file.

### `mocks/jobs.ts`

-   **Purpose**: Provides an array of mock `Job` objects, often generated based on the mock orders.
-   **Content**: Contains logic to generate job data for each SKU within an order, simulating different job statuses and phases. This file ensures that mock jobs are consistent with mock orders. This data is used by `fetchJobs` and `fetchJob` when mocks are enabled.
-   **Example Usage**: When `fetchJobs(orderId)` is called with `NEXT_PUBLIC_USE_MOCKS=true`, it returns the jobs associated with that `orderId` from the data generated in this file.

### Implicit Mocks in `lib/api-service.ts`

For `fetchCustomers`, `fetchManufacturers`, `getSkuStatistics`, `fetchStoneLots`, and `fetchDiamondLots`, if a dedicated mock file (e.g., `mocks/customers.ts`) does not exist, `lib/api-service.ts` includes a small, hardcoded mock array directly within the function's `if (useMocks)` block. This provides a basic fallback for these entities when mocks are enabled, even if a comprehensive mock file hasn't been created yet.

For example, in `fetchCustomers`:

\`\`\`typescript
// lib/api-service.ts (inside fetchCustomers)
  if (useMocks) {
    const mockCustomers = [
      {
        id: "1",
        name: "Mock Customer 1",
        contact_person: "Contact Person 1",
        email: "contact1@example.com",
        phone: "1234567890",
      },
      // ... more mock customers
    ]
    return mockCustomers
  }
\`\`\`

This approach ensures that all data fetching functions have a mock data source when `NEXT_PUBLIC_USE_MOCKS` is true, providing a complete mock environment for development.
