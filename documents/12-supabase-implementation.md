# Supabase Implementation

## Overview

This document provides detailed information about the Supabase implementation in the Jewelry ERP application. It covers the database schema, API integration, authentication, Row-Level Security (RLS) policies, storage management, and best practices.

## Database Schema

### Core Tables

The application uses the following core tables in Supabase:

#### Customers Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Users Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL
);
\`\`\`

#### Manufacturers Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  current_load INTEGER DEFAULT 0,
  past_job_count INTEGER DEFAULT 0,
  rating NUMERIC(3,1),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### SKUs Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size NUMERIC,
  gold_type TEXT NOT NULL,
  stone_type TEXT NOT NULL,
  diamond_type TEXT,
  weight NUMERIC(10,2),
  image_url TEXT,
  collection VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Orders Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE,
  order_type TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  production_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL,
  remarks TEXT,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Order Items Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  size TEXT,
  remarks TEXT,
  individual_production_date DATE,
  individual_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Jobs Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  production_date DATE,
  due_date DATE,
  current_phase TEXT NOT NULL,
  size TEXT,
  stone_data JSONB,
  diamond_data JSONB,
  manufacturer_data JSONB,
  qc_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Job History Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

### Inventory Tables

#### Stone Lots Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS stone_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_number TEXT,
  stone_type TEXT NOT NULL,
  quantity INTEGER,
  weight NUMERIC(10,2),
  status TEXT DEFAULT 'Available',
  shape TEXT,
  quality TEXT,
  type TEXT,
  location TEXT,
  stone_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

#### Diamond Lots Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS diamond_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_number TEXT,
  quantity INTEGER,
  weight NUMERIC(10,2),
  status TEXT DEFAULT 'Available',
  shape VARCHAR(10),
  quality VARCHAR(10),
  size VARCHAR(10),
  price NUMERIC(10,2),
  stonegroup VARCHAR(20),
  a_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
\`\`\`

### Database Functions

#### ID Generation Functions

The application uses several database functions to automatically generate IDs:

##### SKU ID Generation

\`\`\`sql
CREATE OR REPLACE FUNCTION generate_sku_id()
RETURNS TRIGGER AS $$
DECLARE
  category_prefix TEXT;
  next_sequential_number INT;
BEGIN
  -- Check if the sku_id is already set in the NEW row (provided by the application)
  IF NEW.sku_id IS NULL THEN
    -- Define category-to-prefix mapping based on the category of the new row
    category_prefix := CASE LOWER(NEW.category) -- Convert category to lowercase for consistent matching
      WHEN 'ring' THEN 'RG'
      WHEN 'bangle' THEN 'BN'
      WHEN 'bracelet' THEN 'BR'
      WHEN 'necklace' THEN 'NK'
      WHEN 'earring' THEN 'ER'
      WHEN 'ball lock' THEN 'BL'
      WHEN 'brouch' THEN 'BO'
      WHEN 'cuff link' THEN 'CF'
      WHEN 'chain' THEN 'CH'
      WHEN 'extras' THEN 'EX'
      WHEN 'tyre' THEN 'TY'
      WHEN 'pendant' THEN 'PN'
      WHEN 'kadi' THEN 'EX'
      WHEN 'earring part' THEN 'EX'
      ELSE 'OO' -- fallback: Use 'OO' for any category not explicitly mapped
    END;

    -- Get the next sequential number from the global sequence.
    SELECT nextval('sku_sequential_number_seq') INTO next_sequential_number;

    -- Construct the new SkuID: Category Prefix + Hyphen + Sequential Number (formatted to 4 digits with leading zeros)
    NEW.sku_id := category_prefix || '-' || LPAD(next_sequential_number::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

##### Order ID Generation

\`\`\`sql
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  max_id INTEGER := 0;
BEGIN
  -- Get the maximum existing order number
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 3) AS INTEGER)), 0)
  INTO max_id
  FROM orders
  WHERE order_id LIKE 'O-%';
  
  -- Increment the maximum ID
  NEW.order_id := 'O-' || LPAD((max_id + 1)::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

##### Job ID Generation

\`\`\`sql
CREATE OR REPLACE FUNCTION generate_job_id()
RETURNS TRIGGER AS $$
DECLARE
  next_number INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM jobs;
  NEW.job_id := 'J-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

#### Utility Functions

\`\`\`sql
CREATE OR REPLACE FUNCTION get_next_sku_sequence_value()
RETURNS BIGINT AS $$
BEGIN
  RETURN nextval('sku_sequential_number_seq');
END;
$$ LANGUAGE plpgsql;
\`\`\`

### Database Triggers

\`\`\`sql
-- Create triggers for automatic ID generation
CREATE TRIGGER set_sku_id_trigger
BEFORE INSERT ON skus
FOR EACH ROW
EXECUTE FUNCTION generate_sku_id();

CREATE TRIGGER set_order_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_id();

CREATE TRIGGER set_job_id
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION generate_job_id();
\`\`\`

## API Integration

### Supabase Client Setup

The application uses two Supabase client configurations:

\`\`\`typescript
// ./lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for browser-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a service role client for server-side operations that need elevated permissions
export const createServiceClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return createClient(supabaseUrl, supabaseServiceKey)
}
\`\`\`

### API Service Implementation

The API service (`lib/api-service.ts`) provides a consistent interface for interacting with the database, whether using mock data or Supabase:

\`\`\`typescript
import { supabase } from "./supabaseClient"
import { logger } from "./logger"
import type { Order, SKU, Job } from "@/types"
import { mockOrders, mockSkus, mockJobs } from "../mocks"

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

  try {
    // Get order from Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (orderError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order from Supabase`, {
        data: { orderId },
        error: orderError,
        duration,
      })
      return { order: null }
    }

    // Get order items with SKU details
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        skus:sku_id (*)
      `)
      .eq("order_id", orderData.id)

    if (itemsError) {
      const duration = performance.now() - startTime
      logger.error(`Error fetching order items from Supabase`, {
        data: { orderId, orderUuid: orderData.id },
        error: itemsError,
        duration,
      })
      return { order: null }
    }

    // Transform data to match application model
    const order: Order = {
      id: orderData.order_id,
      orderType: orderData.order_type,
      customerName: orderData.customer_name,
      customerId: orderData.customer_id,
      skus: orderItems.map((item) => ({
        id: item.skus.sku_id,
        name: item.skus.name,
        quantity: item.quantity,
        size: item.size,
        remarks: item.remarks,
        image: item.skus.image_url,
        category: item.skus.category,
        goldType: item.skus.gold_type,
        stoneType: item.skus.stone_type,
        diamondType: item.skus.diamond_type,
        individualProductionDate: item.individual_production_date,
        individualDeliveryDate: item.individual_delivery_date,
      })),
      dueDate: orderData.delivery_date,
      productionDate: orderData.production_date,
      status: orderData.status,
      action: orderData.action || "View details",
      remarks: orderData.remarks,
      createdAt: orderData.created_at,
    }

    const duration = performance.now() - startTime
    logger.info(`fetchOrder completed successfully`, {
      data: { orderId, skuCount: order.skus.length },
      duration,
    })

    return { order }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in fetchOrder`, {
      data: { orderId },
      error,
      duration,
    })
    return { order: null }
  }
}

// Other API functions follow the same pattern
\`\`\`

### Server Actions

The application uses Next.js Server Actions for data mutations:

\`\`\`typescript
// app/actions/order-actions.ts
"use server"

import { createServiceClient } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import type { Order } from "@/types"

export async function createOrder(orderData: Omit<Order, "id">) {
  const startTime = performance.now()
  logger.info(`createOrder called`, { data: orderData })

  // Check if we're using mocks
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
  if (useMocks) {
    // In mock mode, just log and return success
    const duration = performance.now() - startTime
    logger.info(`createOrder completed with mock data`, {
      data: { orderId: "mock-order-id" },
      duration,
    })
    return { success: true, orderId: "mock-order-id" }
  }

  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Insert order - remove id field to let the database generate it
    logger.debug(`Creating order in Supabase`, { data: orderData })
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        // Remove order_id field to let the database trigger generate it
        order_type: orderData.orderType,
        customer_name: orderData.customerName,
        customer_id: orderData.customerId,
        production_date: orderData.productionDate,
        delivery_date: orderData.dueDate,
        status: orderData.status || ORDER_STATUS.NEW,
        action: orderData.action,
        remarks: orderData.remarks,
        created_at: orderData.createdAt || new Date().toISOString(),
      })
      .select("id, order_id")
      .single()

    if (orderError) {
      const duration = performance.now() - startTime
      logger.error(`Error creating order in Supabase`, {
        data: orderData,
        error: orderError,
        duration,
      })
      return { success: false, error: `Failed to create order: ${orderError.message}` }
    }

    // Additional operations...

    // Revalidate paths
    revalidatePath("/orders")

    const duration = performance.now() - startTime
    logger.info(`createOrder completed successfully`, {
      data: {
        orderId: newOrder.order_id,
        orderUuid: newOrder.id,
        itemCount: orderData.skus?.length || 0,
        jobsCreated: jobs.length,
      },
      duration,
    })

    // Return the server-generated order ID
    return { success: true, orderId: newOrder.order_id }
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`Unexpected error in createOrder`, {
      data: orderData,
      error,
      duration,
    })
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Other server actions follow the same pattern
\`\`\`

## Storage Integration

The application uses Supabase Storage for image management:

\`\`\`typescript
// lib/supabase-storage.ts
import { supabase, createServiceClient } from "./supabaseClient"

// File validation configuration
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const MAX_DIMENSIONS = { width: 4000, height: 4000 }

/**
 * Uploads an image file to Supabase Storage
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string,
  path: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file first
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting existing files
    })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Unexpected upload error:", error)
    return {
      success: false,
      error: "Unexpected error during upload",
    }
  }
}

/**
 * Deletes an image from Supabase Storage using its URL
 */
export async function deleteImageFromSupabase(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract bucket and path from URL
    const urlParts = extractBucketAndPath(url)
    if (!urlParts) {
      return {
        success: false,
        error: "Invalid Supabase Storage URL",
      }
    }

    const { bucket, path } = urlParts

    // Use service client for deletion (requires elevated permissions)
    const serviceClient = createServiceClient()

    const { error } = await serviceClient.storage.from(bucket).remove([path])

    if (error) {
      console.error("Delete error:", error)
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected delete error:", error)
    return {
      success: false,
      error: "Unexpected error during deletion",
    }
  }
}

// Helper functions for file validation and path generation
\`\`\`

## Row-Level Security (RLS)

### RLS Policies

The application uses Supabase Row-Level Security (RLS) policies to control access to data:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stone_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_lots ENABLE ROW LEVEL SECURITY;

-- Customers table policies
CREATE POLICY "Allow anonymous read access for customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update customers" ON customers
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete customers" ON customers
    FOR DELETE USING (auth.role() = 'service_role');

-- Similar policies for other tables...
\`\`\`

## Authentication

### Authentication Setup

The application uses Supabase Authentication for user management:

\`\`\`typescript
import { supabase } from "@/lib/supabaseClient"

// Sign in with email and password
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Sign up with email and password
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
\`\`\`

## Best Practices

### Error Handling

The application uses a consistent approach to error handling:

\`\`\`typescript
try {
  const { data, error } = await supabase.from("orders").select("*")
  
  if (error) {
    logger.error("Error fetching orders from Supabase", {
      error,
      duration,
    })
    return []
  }
  
  // Process data
} catch (error) {
  logger.error("Unexpected error in fetchOrders", {
    error,
    duration,
  })
  return []
}
\`\`\`

### Performance Optimization

The application uses several techniques to optimize performance:

1. **Selective Columns**: Only selecting the columns that are needed
   \`\`\`typescript
   const { data } = await supabase.from("orders").select("id, order_id, status")
   \`\`\`

2. **Pagination**: Using pagination for large result sets
   \`\`\`typescript
   const { data } = await supabase.from("orders").select("*").range(0, 9)
   \`\`\`

3. **Indexes**: Creating indexes on frequently queried columns
   \`\`\`sql
   CREATE INDEX idx_orders_order_id ON orders(order_id);
   \`\`\`

4. **Joins**: Using Supabase's join syntax for related data
   \`\`\`typescript
   const { data } = await supabase
     .from("jobs")
     .select(`
       *,
       skus:sku_id (*),
       orders:order_id (order_id)
     `)
   \`\`\`

5. **Batch Operations**: Using batch inserts for multiple records
   \`\`\`typescript
   const { data } = await supabase.from("job_history").insert(historyEntries)
   \`\`\`

### Security Considerations

The application follows these security best practices:

1. **Environment Variables**: Storing sensitive information in environment variables
2. **Service Role**: Using the service role client only for server-side operations
3. **RLS Policies**: Implementing RLS policies to control data access
4. **Input Validation**: Validating user input before sending it to Supabase
5. **Error Handling**: Not exposing detailed error messages to users
6. **File Validation**: Validating files before upload (type, size, dimensions)

## Monitoring and Debugging

### Logging

The application uses a comprehensive logging system to monitor Supabase operations:

\`\`\`typescript
// lib/logger.ts
import { createLogger, format, transports } from "winston"

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

export { logger }
\`\`\`

Usage in API functions:

\`\`\`typescript
logger.info(`fetchOrder called`, { data: { orderId, useMocks } })

// Log Supabase operations
const { data, error } = await supabase.from("orders").select("*")

logger.info(`fetchOrder completed`, {
  data: { count: data?.length || 0 },
  error,
  duration: performance.now() - startTime,
})
\`\`\`

### Validation

The application includes a validation system that checks:

\`\`\`typescript
// lib/supabase-validator.ts
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
\`\`\`

## Switching Between Mock and Real Data

The application can switch between mock data and real Supabase data using the `NEXT_PUBLIC_USE_MOCKS` environment variable:

\`\`\`typescript
// Helper to determine if we should use mock data
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

export async function fetchOrders(): Promise<Order[]> {
  if (useMocks) {
    // Use mock data
    return mockOrders
  }

  // Use Supabase
  // ...
}
\`\`\`

This allows for development and testing without a Supabase connection, while still providing a seamless transition to real data when needed.

## Environment Variables

The application requires the following environment variables for Supabase integration:

\`\`\`env
# Mock data configuration
NEXT_PUBLIC_USE_MOCKS=false

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Direct PostgreSQL connection (alternative to Supabase)
POSTGRES_URL=postgresql://postgres:password@localhost:5432/jewelry_erp
POSTGRES_PRISMA_URL=postgresql://postgres:password@localhost:5432/jewelry_erp?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:password@localhost:5432/jewelry_erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=jewelry_erp
POSTGRES_HOST=localhost
\`\`\`

## Conclusion

The Supabase implementation in the Jewelry ERP application provides a robust, scalable, and secure backend for the application. By following best practices for error handling, performance optimization, and security, the application ensures a reliable and efficient user experience.

The dual-mode operation (mock data or Supabase) allows for flexible development and testing, while the comprehensive logging and validation systems help identify and resolve issues quickly.
