# Data Models

## Overview

The Jewelry ERP application uses several core data models to represent the business entities. This document describes the structure and relationships of these models based on the actual production database schema.

## Core Data Models

### Customer Model

The Customer model represents clients who place orders.

\`\`\`typescript
export interface Customer {
  id: string           // UUID - Unique identifier
  name: string         // Customer/company name
  contact_person?: string // Primary contact person
  email?: string       // Contact email
  phone?: string       // Contact phone number
  active: boolean      // Whether customer is active
  created_at: string   // Creation timestamp
}
\`\`\`

### User Model

The User model represents system users who can perform actions and are tracked in job history.

\`\`\`typescript
export interface User {
  id: string           // UUID - Unique identifier
  email: string        // User email address
  name: string         // User display name
}
\`\`\`

### Manufacturer Model

The Manufacturer model represents external manufacturers who produce jewelry items.

\`\`\`typescript
export interface Manufacturer {
  id: string           // UUID - Unique identifier
  name: string         // Manufacturer name
  current_load: number // Current number of active jobs
  past_job_count: number // Total completed jobs
  rating?: number      // Performance rating (1-5 scale)
  active: boolean      // Whether manufacturer is active
  created_at: string   // Creation timestamp
}
\`\`\`

### SKU Model

The SKU (Stock Keeping Unit) model represents a jewelry design that can be manufactured.

\`\`\`typescript
export interface SKU {
  id: string           // UUID - Unique identifier
  sku_id: string       // Generated SKU identifier (e.g., "RG-0001")
  name: string         // Display name
  category: string     // Product category (Ring, Necklace, etc.)
  size?: number        // Size specification
  gold_type: string    // Type of gold (Yellow Gold, White Gold, Rose Gold)
  stone_type: string   // Type of stone
  diamond_type?: string // Type of diamond
  weight?: number      // Weight in grams
  image_url?: string   // URL to product image
  collection?: string  // Collection name
  created_at: string   // Creation timestamp
  updated_at: string   // Last update timestamp
}
\`\`\`

### Order Model

The Order model represents a customer or stock order containing multiple items.

\`\`\`typescript
export interface Order {
  id: string           // UUID - Unique identifier
  order_id: string     // Generated order identifier (e.g., "O-0001")
  order_type: string   // Customer or Stock
  customer_id?: string // Reference to customer (UUID)
  customer_name?: string // Customer name (for quick access)
  production_date?: string // Production start date
  delivery_date?: string // Delivery date
  status: string       // Order status
  remarks?: string     // Additional notes
  action?: string      // Current action required
  created_at: string   // Creation timestamp
  updated_at: string   // Last update timestamp
}
\`\`\`

### Order Item Model

The Order Item model represents individual SKUs within an order with specific quantities and requirements.

\`\`\`typescript
export interface OrderItem {
  id: string           // UUID - Unique identifier
  order_id: string     // Reference to parent order (UUID)
  sku_id: string       // Reference to SKU (UUID)
  quantity: number     // Quantity ordered
  size?: string        // Specific size for this item
  remarks?: string     // Item-specific notes
  individual_production_date?: string // Item-specific production date
  individual_delivery_date?: string   // Item-specific delivery date
  created_at: string   // Creation timestamp
  updated_at: string   // Last update timestamp
}
\`\`\`

### Job Model

The Job model represents a single jewelry item being manufactured.

\`\`\`typescript
export interface Job {
  id: string           // UUID - Unique identifier
  job_id: string       // Generated job identifier (e.g., "J-0001")
  order_id: string     // Reference to parent order (UUID)
  order_item_id: string // Reference to specific order item (UUID)
  sku_id: string       // Reference to SKU (UUID)
  status: string       // Current status
  manufacturer_id?: string // Assigned manufacturer (UUID)
  production_date?: string // Date production started
  due_date?: string    // Due date for completion
  current_phase: string // Current workflow phase
  size?: string        // Size specification
  stone_data?: any     // Stone selection data (JSONB)
  diamond_data?: any   // Diamond selection data (JSONB)
  manufacturer_data?: any // Manufacturer data (JSONB)
  qc_data?: any        // Quality control data (JSONB)
  created_at: string   // Creation timestamp
  updated_at: string   // Last update timestamp
}
\`\`\`

### Job History Model

The Job History model provides an audit trail for all job changes.

\`\`\`typescript
export interface JobHistory {
  id: string           // UUID - Unique identifier
  job_id: string       // Reference to job (UUID)
  status: string       // Status at time of change
  action: string       // Action performed
  user_id?: string     // User who performed action (UUID)
  data?: any           // Additional data (JSONB)
  created_at: string   // Timestamp of change
}
\`\`\`

### Stone Lot Model

The Stone Lot model represents inventory of precious stones.

\`\`\`typescript
export interface StoneLot {
  id: string           // UUID - Unique identifier
  lot_number?: string  // Lot identification number
  stone_type: string   // Type of stone (Ruby, Emerald, Sapphire)
  quantity?: number    // Number of stones in lot
  weight?: number      // Total weight in carats
  status: string       // Availability status
  shape?: string       // Stone shape
  quality?: string     // Quality grade
  type?: string        // Stone type classification
  location?: string    // Storage location
  stone_size?: string  // Size specification
  created_at: string   // Creation timestamp
}
\`\`\`

### Diamond Lot Model

The Diamond Lot model represents inventory of diamonds.

\`\`\`typescript
export interface DiamondLot {
  id: string           // UUID - Unique identifier
  lot_number?: string  // Lot identification number
  quantity?: number    // Number of diamonds in lot
  weight?: number      // Total weight in carats
  status: string       // Availability status
  shape?: string       // Diamond shape (max 10 chars)
  quality?: string     // Quality grade (max 10 chars)
  size?: string        // Size specification (max 10 chars)
  price?: number       // Price per unit
  stonegroup?: string  // Stone grouping (max 20 chars)
  a_type?: string      // Additional type classification
  created_at: string   // Creation timestamp
}
\`\`\`

## Database Relationships

The database uses the following foreign key relationships:

1.  **Orders → Customers**: `orders.customer_id` → `customers.id`
2.  **Order Items → Orders**: `order_items.order_id` → `orders.id`
3.  **Order Items → SKUs**: `order_items.sku_id` → `skus.id`
4.  **Jobs → Orders**: `jobs.order_id` → `orders.id`
5.  **Jobs → Order Items**: `jobs.order_item_id` → `order_items.id`
6.  **Jobs → SKUs**: `jobs.sku_id` → `skus.id`
7.  **Jobs → Manufacturers**: `jobs.manufacturer_id` → `manufacturers.id`
8.  **Job History → Jobs**: `job_history.job_id` → `jobs.id`
9.  **Job History → Users**: `job_history.user_id` → `users.id`

## ID Generation Rules

### SKU ID Format
SKU IDs are automatically generated using the format: `[Category Prefix]-[Sequential Number]`

**Category Prefixes:**
- Ring: `RG`
- Bangle: `BN`
- Bracelet: `BR`
- Necklace: `NK`
- Earring: `ER`
- Ball Lock: `BL`
- Brouch: `BO`
- Cuff Link: `CF`
- Chain: `CH`
- Extras: `EX`
- Tyre: `TY`
- Pendant: `PN`
- Kadi: `EX`
- Earring Part: `EX`
- Other: `OO`

**Example:** `RG-0001`, `NK-0002`, `ER-0003`

### Order ID Format
Order IDs follow the pattern: `O-[4-digit number]`
**Example:** `O-0001`, `O-0002`

### Job ID Format
Job IDs follow the pattern: `J-[4-digit number]`
**Example:** `J-0001`, `J-0002`

## Data Validation Rules

1.  **Required Fields**: All models have required fields that must be provided
2.  **UUID References**: All foreign key relationships use UUIDs
3.  **Automatic Timestamps**: `created_at` and `updated_at` fields are automatically managed
4.  **Status Values**: Status fields should use predefined values from the application constants
5.  **JSONB Data**: Complex data structures are stored as JSONB for flexibility and performance

## System Architecture Integration

### Database Layer Architecture

The data models integrate with the system architecture through multiple layers:

#### 1. Database Functions and Triggers

**Automatic ID Generation:**
- `generate_sku_id()`: Triggered on SKU insertion, uses sequence `sku_sequential_number_seq`
- `generate_order_id()`: Triggered on Order insertion, finds max ID and increments
- `generate_job_id()`: Triggered on Job insertion, uses simple counter logic

**Trigger Implementation:**
\`\`\`sql
-- SKU ID Generation Trigger
CREATE TRIGGER set_sku_id_trigger 
  BEFORE INSERT ON skus 
  FOR EACH ROW 
  EXECUTE FUNCTION generate_sku_id();

-- Order ID Generation Trigger  
CREATE TRIGGER set_order_id 
  BEFORE INSERT ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION generate_order_id();

-- Job ID Generation Trigger
CREATE TRIGGER set_job_id 
  BEFORE INSERT ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION generate_job_id();
\`\`\`

#### 2. Row-Level Security (RLS) Integration

All data models are protected by comprehensive RLS policies:

**Policy Structure:**
- **Anonymous Read Access**: SELECT operations allowed without authentication
- **Authenticated Full Access**: All CRUD operations for authenticated users
- **Service Role Operations**: Full access for server-side operations

**Security Benefits:**
- Data protection at the database level
- Automatic enforcement of access control
- Flexible permission management

#### 3. Application Layer Integration

**API Service Layer:**
- Abstracts database operations through `lib/api-service.ts`
- Provides consistent interface for both mock and production data
- Handles data transformation and validation

**Server Actions:**
- Direct database operations for form submissions
- Leverages service role for elevated permissions
- Maintains audit trail through job history

**Client Components:**
- Real-time data updates through Supabase subscriptions
- Optimistic updates for better user experience
- Error handling and retry logic

#### 4. Data Flow Architecture

\`\`\`mermaid
graph TD
    A[Client Components] --> B[API Service Layer]
    B --> C[Supabase Client]
    C --> D[RLS Policies]
    D --> E[Database Tables]
    E --> F[Triggers & Functions]
    F --> G[ID Generation]
    
    H[Server Actions] --> I[Service Role Client]
    I --> D
    
    J[Job History] --> K[Audit Trail]
    L[Real-time Subscriptions] --> A
\`\`\`

#### 5. Inventory Management Integration

**Stone and Diamond Lots:**
- Integrated with job workflow for material allocation
- Status tracking throughout production process
- Location and quality management for efficient operations

**Workflow Integration:**
- Stone selection phase uses `stone_lots` data
- Diamond selection phase uses `diamond_lots` data
- Allocation tracking through job data fields

#### 6. Performance Considerations

**Database Optimization:**
- UUID primary keys for distributed systems
- JSONB fields for flexible data storage
- Indexed foreign key relationships
- Efficient sequence-based ID generation

**Caching Strategy:**
- Client-side caching through React Query
- Supabase built-in caching for frequently accessed data
- Optimistic updates to reduce perceived latency

#### 7. Scalability Architecture

**Horizontal Scaling:**
- UUID-based primary keys support distributed architecture
- Stateless API design enables load balancing
- Supabase handles database scaling automatically

**Data Partitioning:**
- Job history can be partitioned by date for performance
- Large inventory tables can be partitioned by status
- Archive strategies for completed orders and jobs

This architecture ensures data consistency, security, and performance while maintaining flexibility for future enhancements.
