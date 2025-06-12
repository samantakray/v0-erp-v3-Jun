# System Architecture

## Overview

The Jewelry ERP application follows a modern web application architecture using Next.js with the App Router. It leverages server components for improved performance and client components for interactive elements.

## Architecture Diagram

\`\`\`mermaid
flowchart TD
    Client[Client Browser] <--> NextJS[Next.js App Router]
    NextJS <--> ServerComponents[Server Components]
    NextJS <--> ClientComponents[Client Components]
    ServerComponents <--> ServerActions[Server Actions]
    ServerActions <--> SupabaseClient[Supabase Client]
    ClientComponents <--> SupabaseClient
    SupabaseClient <--> Database[(Supabase PostgreSQL)]
    SupabaseClient <--> Auth[Supabase Auth]
\`\`\`

## Frontend Architecture

The frontend is built with Next.js and follows these architectural principles:

1. **Component-Based Design**: UI is composed of reusable components
2. **Server Components**: Leverages Next.js Server Components for improved performance
3. **Client Components**: Uses Client Components for interactive elements
4. **Responsive Design**: All interfaces are responsive and mobile-friendly

## Backend Architecture

The backend functionality is implemented using:

1. **Next.js API Routes**: For API endpoints
2. **Server Actions**: For form submissions and data mutations
3. **Supabase Client**: For database operations

## Database Architecture

The application uses Supabase (PostgreSQL) with the following enhanced structure:

\`\`\`mermaid
erDiagram
    CUSTOMERS {
        uuid id PK
        text name
        text contact_person
        text email
        text phone
        boolean active
        timestamp created_at
    }
    
    USERS {
        uuid id PK
        text email
        text name
    }
    
    MANUFACTURERS {
        uuid id PK
        text name
        integer current_load
        integer past_job_count
        numeric rating
        boolean active
        timestamp created_at
    }
    
    SKUS {
        uuid id PK
        text sku_id
        text name
        text category
        numeric size
        text gold_type
        text stone_type
        text diamond_type
        numeric weight
        text image_url
        varchar collection
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        uuid id PK
        text order_id
        text order_type
        uuid customer_id FK
        text customer_name
        date production_date
        date delivery_date
        text status
        text remarks
        text action
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid sku_id FK
        integer quantity
        text size
        text remarks
        date individual_production_date
        date individual_delivery_date
        timestamp created_at
        timestamp updated_at
    }
    
    JOBS {
        uuid id PK
        text job_id
        uuid order_id FK
        uuid order_item_id FK
        uuid sku_id FK
        text status
        uuid manufacturer_id FK
        date production_date
        date due_date
        text current_phase
        text size
        jsonb stone_data
        jsonb diamond_data
        jsonb manufacturer_data
        jsonb qc_data
        timestamp created_at
        timestamp updated_at
    }
    
    JOB_HISTORY {
        uuid id PK
        uuid job_id FK
        text status
        text action
        uuid user_id FK
        jsonb data
        timestamp created_at
    }
    
    STONE_LOTS {
        uuid id PK
        text lot_number
        text stone_type
        integer quantity
        numeric weight
        text status
        text shape
        text quality
        text type
        text location
        text stone_size
        timestamp created_at
    }
    
    DIAMOND_LOTS {
        uuid id PK
        text lot_number
        integer quantity
        numeric weight
        text status
        varchar shape
        varchar quality
        varchar size
        numeric price
        varchar stonegroup
        text a_type
        timestamp created_at
    }
    
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDER_ITEMS ||--o{ JOBS : generates
    SKUS ||--o{ ORDER_ITEMS : specified_in
    SKUS ||--o{ JOBS : used_in
    MANUFACTURERS ||--o{ JOBS : assigned_to
    JOBS ||--o{ JOB_HISTORY : tracked_in
    USERS ||--o{ JOB_HISTORY : performs
\`\`\`

## ID Generation System

The application uses sophisticated ID generation functions:

### SKU ID Generation
- Uses a global sequence `sku_sequential_number_seq`
- Format: `[Category Prefix]-[Sequential Number]`
- Supports 15+ product categories with specific prefixes
- Automatic generation with manual override capability

### Order ID Generation
- Format: `O-[4-digit number]`
- Finds maximum existing ID and increments
- Handles gaps in sequence gracefully

### Job ID Generation
- Format: `J-[4-digit number]`
- Simple counter-based generation
- Ensures unique job identifiers

## Supabase Implementation

### Overview

The application uses Supabase as its primary database and backend service. Supabase provides:

1. **PostgreSQL Database**: For storing all application data
2. **Authentication**: For user management and access control
3. **Row-Level Security (RLS)**: For data access control
4. **Storage**: For file and image management
5. **Real-time Subscriptions**: For live updates

### Implementation Approach

Our Supabase implementation follows these principles:

1. **Dual-Mode Operation**: The application can operate with either mock data or real Supabase data, controlled by the `NEXT_PUBLIC_USE_MOCKS` environment variable.

2. **Abstraction Layer**: All Supabase operations are abstracted through the API service (`lib/api-service.ts`), which provides a consistent interface regardless of whether mock data or Supabase is being used.

3. **Enhanced Logging**: All Supabase operations are logged for debugging and monitoring purposes.

4. **Validation System**: The application validates the Supabase setup at startup to ensure all required tables, columns, and permissions are correctly configured.

### Client Configuration

The Supabase client is configured in `lib/supabaseClient.ts`:

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

## Row-Level Security (RLS)

The database implements comprehensive RLS policies:

### Policy Structure
Each table has consistent policies:
- **Anonymous Read Access**: All tables allow SELECT operations without authentication
- **Authenticated Full Access**: Authenticated users get full CRUD operations
- **Service Role Operations**: Service role can perform all operations for server-side actions

### Security Benefits
1. **Data Protection**: Prevents unauthorized access to sensitive data
2. **Flexible Access Control**: Different permission levels for different user types
3. **Server-Side Safety**: Service role ensures server actions can operate without user authentication

## Authentication Flow

The application uses Supabase Authentication with the following flow:

1. User signs in with email/password or social provider
2. Supabase Auth validates credentials and returns JWT
3. JWT is stored in cookies for subsequent requests
4. Protected routes and API endpoints verify JWT before granting access
5. RLS policies automatically enforce access control at the database level

## Inventory Management

The system includes comprehensive inventory management:

### Stone Inventory
- **Stone Lots**: Tracks precious stones (Ruby, Emerald, Sapphire)
- **Attributes**: Shape, quality, size, location, weight
- **Status Tracking**: Available, Reserved, Used

### Diamond Inventory
- **Diamond Lots**: Tracks diamond inventory
- **Detailed Attributes**: Shape, quality, size, price, stone group
- **Classification**: A-type classification for advanced categorization

## Deployment Architecture

The application is deployed on Vercel with the following configuration:

1. **Production Environment**: Main branch deployment
2. **Preview Environments**: Pull request deployments
3. **Environment Variables**: Configured in Vercel dashboard
4. **Edge Functions**: Used for global distribution and low latency
5. **Database**: Hosted on Supabase with automatic backups
6. **Storage**: Supabase Storage for file and image management
