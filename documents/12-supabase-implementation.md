# Supabase Implementation

## Overview

This document provides detailed information about the Supabase implementation in the Jewelry ERP application. It covers the database schema, API integration, authentication, and best practices.

## Database Schema

### Tables

The application uses the following tables in Supabase:

#### SKUs Table

\`\`\`sql
CREATE TABLE skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  gold_type TEXT,
  stone_type TEXT,
  diamond_type TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_skus_sku_id ON skus(sku_id);
\`\`\`

#### Orders Table

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL,
  customer_name TEXT,
  customer_id UUID,
  production_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL,
  remarks TEXT,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_order_id ON orders(order_id);
\`\`\`

#### Order Items Table

\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  size TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
\`\`\`

#### Jobs Table

\`\`\`sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id),
  size TEXT,
  status TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  production_date DATE,
  due_date DATE,
  stone_data JSONB,
  diamond_data JSONB,
  manufacturer_data JSONB,
  qc_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_job_id ON jobs(job_id);
CREATE INDEX idx_jobs_order_id ON jobs(order_id);
\`\`\`

#### Job History Table

\`\`\`sql
CREATE TABLE job_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_history_job_id ON job_history(job_id);
\`\`\`

### Triggers

The application uses the following triggers to maintain data integrity:

#### Updated At Trigger

\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skus_updated_at
BEFORE UPDATE ON skus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
\`\`\`

#### Job History Trigger

\`\`\`sql
CREATE OR REPLACE FUNCTION record_job_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO job_history (job_id, status, action, data)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status, 
            jsonb_build_object('old_phase', OLD.current_phase, 'new_phase', NEW.current_phase));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_job_history_trigger
AFTER UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION record_job_history();
\`\`\`

## API Integration

### Supabase Client Setup

The application uses the Supabase JavaScript client to interact with the database:

\`\`\`typescript
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
import type { Order, SKU, Job } from "@/types"
import { mockOrders, mockSkus, mockJobs } from "./mock-data"

// Helper to determine if we should use mock data
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true"

export async function fetchOrder(orderId: string): Promise<{ order: Order | null }> {
  if (useMocks) {
    // Use mock data
    const order = mockOrders.find((o) => o.id === orderId) || null
    return { order }
  }

  try {
    // Get order from Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single()

    // Handle error and transform data
    // ...
  } catch (error) {
    // Handle unexpected errors
    // ...
  }
}

// Other API functions follow the same pattern
\`\`\`

### Data Transformation

The API service transforms Supabase data to match the application's data models:

\`\`\`typescript
// Example of transforming Supabase data to application model
const order: Order = {
  id: orderData.order_id,
  orderType: orderData.order_type,
  customerName: orderData.customer_name,
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
  })),
  dueDate: orderData.delivery_date,
  productionDate: orderData.production_date,
  status: orderData.status,
  action: orderData.action || "View details",
  remarks: orderData.remarks,
  createdAt: orderData.created_at,
}
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

### Protected Routes

The application uses middleware to protect routes that require authentication:

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && !req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}
\`\`\`

## Row-Level Security (RLS)

### RLS Policies

The application uses Supabase Row-Level Security (RLS) policies to control access to data:

\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- SKUs policies
CREATE POLICY "Allow anyone to read SKUs"
ON skus FOR SELECT
TO authenticated, anon
USING (true);

-- Orders policies
CREATE POLICY "Allow anyone to read orders"
ON orders FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow authenticated users to create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

-- Order items policies
CREATE POLICY "Allow anyone to read order items"
ON order_items FOR SELECT
TO authenticated, anon
USING (true);

-- Jobs policies
CREATE POLICY "Allow anyone to read jobs"
ON jobs FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow authenticated users to update jobs"
ON jobs FOR UPDATE
TO authenticated
USING (true);

-- Job history policies
CREATE POLICY "Allow anyone to read job history"
ON job_history FOR SELECT
TO authenticated, anon
USING (true);
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

### Security Considerations

The application follows these security best practices:

1. **Environment Variables**: Storing sensitive information in environment variables
2. **Service Role**: Using the service role client only for server-side operations
3. **RLS Policies**: Implementing RLS policies to control data access
4. **Input Validation**: Validating user input before sending it to Supabase
5. **Error Handling**: Not exposing detailed error messages to users

## Monitoring and Debugging

### Logging

The application uses a comprehensive logging system to monitor Supabase operations:

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

1. **Environment Variables**: Verifies that all required Supabase environment variables are set
2. **Database Schema**: Checks that all required tables and columns exist
3. **Permissions**: Verifies that the application has the necessary permissions to perform operations

This validation runs at application startup and logs any issues.

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

## Conclusion

The Supabase implementation in the Jewelry ERP application provides a robust, scalable, and secure backend for the application. By following best practices for error handling, performance optimization, and security, the application ensures a reliable and efficient user experience.

The dual-mode operation (mock data or Supabase) allows for flexible development and testing, while the comprehensive logging and validation systems help identify and resolve issues quickly.
