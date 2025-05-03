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

The application uses Supabase (PostgreSQL) with the following structure:

\`\`\`mermaid
erDiagram
    SKUs {
        uuid id PK
        string sku_id
        string name
        string category
        string gold_type
        string stone_type
    }
    
    Orders {
        uuid id PK
        string order_id
        string order_type
        uuid customer_id FK
        date production_date
        date delivery_date
    }
    
    Jobs {
        uuid id PK
        string job_id
        uuid order_id FK
        uuid sku_id FK
        string status
        string current_phase
    }
    
    Orders ||--o{ Jobs : contains
    SKUs ||--o{ Jobs : used_in
\`\`\`

## Supabase Implementation

### Overview

The application uses Supabase as its primary database and backend service. Supabase provides:

1. **PostgreSQL Database**: For storing all application data
2. **Authentication**: For user management and access control
3. **Row-Level Security (RLS)**: For data access control
4. **Real-time Subscriptions**: For live updates

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

## Authentication Flow

The application uses Supabase Authentication with the following flow:

1. User signs in with email/password or social provider
2. Supabase Auth validates credentials and returns JWT
3. JWT is stored in cookies for subsequent requests
4. Protected routes and API endpoints verify JWT before granting access

## Deployment Architecture

The application is deployed on Vercel with the following configuration:

1. **Production Environment**: Main branch deployment
2. **Preview Environments**: Pull request deployments
3. **Environment Variables**: Configured in Vercel dashboard
4. **Edge Functions**: Used for global distribution and low latency
\`\`\`

Now, let's update the API reference document with more details about the Supabase API implementation:
