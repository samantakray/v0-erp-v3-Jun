# Constants and Configuration

## Overview

The Jewelry ERP application uses various constants and configuration values to define business rules, workflow states, and UI elements. This document describes these constants and their usage.

## Job Workflow Constants

The job workflow constants are defined in `/constants/job-workflow.ts` and define the possible states and transitions for jobs.

### Job Statuses

\`\`\`typescript
export const JOB_STATUS = {
  NEW: "New Job",
  BAG_CREATED: "Bag Created",
  STONE_SELECTED: "Stone Selected",
  DIAMOND_SELECTED: "Diamond Selected",
  SENT_TO_MANUFACTURER: "Sent to Manufacturer",
  IN_PRODUCTION: "In Production",
  RECEIVED_FROM_MANUFACTURER: "Received from Manufacturer",
  QC_PASSED: "Quality Check Passed",
  QC_FAILED: "Quality Check Failed",
  COMPLETED: "Completed",
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]
\`\`\`

### Job Phases

\`\`\`typescript
export const JOB_PHASE = {
  BAG_CREATION: "bag-creation",
  STONE: "stone",
  DIAMOND: "diamond",
  MANUFACTURER: "manufacturer",
  QC: "quality-check",
  COMPLETE: "complete",
} as const

export type JobPhase = (typeof JOB_PHASE)[keyof typeof JOB_PHASE]
\`\`\`

### Status to Phase Mapping

\`\`\`typescript
export const STATUS_TO_PHASE: Record<JobStatus, JobPhase> = {
  [JOB_STATUS.NEW]: JOB_PHASE.BAG_CREATION,
  [JOB_STATUS.BAG_CREATED]: JOB_PHASE.STONE,
  [JOB_STATUS.STONE_SELECTED]: JOB_PHASE.STONE,
  [JOB_STATUS.DIAMOND_SELECTED]: JOB_PHASE.DIAMOND,
  [JOB_STATUS.SENT_TO_MANUFACTURER]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.IN_PRODUCTION]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: JOB_PHASE.QC,
  [JOB_STATUS.QC_PASSED]: JOB_PHASE.COMPLETE,
  [JOB_STATUS.QC_FAILED]: JOB_PHASE.QC,
  [JOB_STATUS.COMPLETED]: JOB_PHASE.COMPLETE,
}
\`\`\`

### Phase Information

\`\`\`typescript
export const PHASE_INFO = {
  [JOB_PHASE.BAG_CREATION]: {
    label: "Bag Creation",
    description: "Create bag for job materials",
    color: "#6593F5",
  },
  [JOB_PHASE.STONE]: {
    label: "Stone Selection",
    description: "Select stones for the job",
    color: "#F59E0B",
  },
  [JOB_PHASE.DIAMOND]: {
    label: "Diamond Selection",
    description: "Select diamonds for the job",
    color: "#3B82F6",
  },
  [JOB_PHASE.MANUFACTURER]: {
    label: "Manufacturer",
    description: "Manage manufacturing process",
    color: "#10B981",
  },
  [JOB_PHASE.QC]: {
    label: "Quality Check",
    description: "Perform quality check",
    color: "#8B5CF6",
  },
  [JOB_PHASE.COMPLETE]: {
    label: "Complete",
    description: "Job completed",
    color: "#6B7280",
  },
}
\`\`\`

### Status Information

\`\`\`typescript
export const STATUS_INFO = {
  [JOB_STATUS.NEW]: {
    label: "New Job",
    color: "bg-blue-400",
  },
  [JOB_STATUS.BAG_CREATED]: {
    label: "Bag Created",
    color: "bg-[#6593F5]",
  },
  [JOB_STATUS.STONE_SELECTED]: {
    label: "Stone Selected",
    color: "bg-indigo-500",
  },
  // ... other statuses
}
\`\`\`

## Helper Functions

The job workflow module also provides helper functions for working with job statuses and phases:

### `getNextPhase(currentPhase: JobPhase): JobPhase | null`

Returns the next phase in the workflow based on the current phase.

**Example:**
\`\`\`typescript
import { getNextPhase, JOB_PHASE } from "@/constants/job-workflow"

const currentPhase = JOB_PHASE.STONE
const nextPhase = getNextPhase(currentPhase) // Returns JOB_PHASE.DIAMOND
\`\`\`

### `getNextStatus(currentPhase: JobPhase, currentStatus: JobStatus, success = true): JobStatus`

Returns the next status based on the current phase and status.

**Example:**
\`\`\`typescript
import { getNextStatus, JOB_PHASE, JOB_STATUS } from "@/constants/job-workflow"

const currentPhase = JOB_PHASE.QC
const currentStatus = JOB_STATUS.RECEIVED_FROM_MANUFACTURER
const nextStatus = getNextStatus(currentPhase, currentStatus, true) // Returns JOB_STATUS.QC_PASSED
\`\`\`

### `getNextManufacturerStatus(currentStatus: JobStatus): JobStatus | null`

Returns the next status within the manufacturer phase.

**Example:**
\`\`\`typescript
import { getNextManufacturerStatus, JOB_STATUS } from "@/constants/job-workflow"

const currentStatus = JOB_STATUS.SENT_TO_MANUFACTURER
const nextStatus = getNextManufacturerStatus(currentStatus) // Returns JOB_STATUS.IN_PRODUCTION
\`\`\`

### `handleQCFailure(currentStatus: JobStatus): JobStatus | null`

Returns the status to transition to when QC fails.

**Example:**
\`\`\`typescript
import { handleQCFailure, JOB_STATUS } from "@/constants/job-workflow"

const currentStatus = JOB_STATUS.QC_FAILED
const nextStatus = handleQCFailure(currentStatus) // Returns JOB_STATUS.IN_PRODUCTION
\`\`\`

## Supabase Configuration

### Environment Variables

The application uses the following environment variables for Supabase configuration:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_USE_MOCKS` | Whether to use mock data instead of Supabase | Yes | `"true"` or `"false"` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the Supabase project | Yes (when not using mocks) | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key for Supabase | Yes (when not using mocks) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Supabase admin operations | Yes (for admin operations) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `POSTGRES_URL` | PostgreSQL connection URL | No (alternative to Supabase) | `postgresql://user:password@host:port/database` |
| `POSTGRES_PRISMA_URL` | PostgreSQL connection URL for Prisma | No (alternative to Supabase) | `postgresql://user:password@host:port/database?schema=public` |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL connection URL without connection pooling | No (alternative to Supabase) | `postgresql://user:password@host:port/database` |
| `POSTGRES_USER` | PostgreSQL username | No (alternative to Supabase) | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | No (alternative to Supabase) | `password` |
| `POSTGRES_DATABASE` | PostgreSQL database name | No (alternative to Supabase) | `jewelry_erp` |
| `POSTGRES_HOST` | PostgreSQL host | No (alternative to Supabase) | `localhost` |

### Environment File

The application uses a `.env.local` file in the project root directory for local development:

\`\`\`
# Mock data configuration
NEXT_PUBLIC_USE_MOCKS=false

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PostgreSQL configuration (alternative to Supabase)
POSTGRES_URL=postgresql://postgres:password@localhost:5432/jewelry_erp
POSTGRES_PRISMA_URL=postgresql://postgres:password@localhost:5432/jewelry_erp?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:password@localhost:5432/jewelry_erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=jewelry_erp
POSTGRES_HOST=localhost
\`\`\`

### Supabase Schema

The application expects the following tables in Supabase:

| Table | Description | Primary Key | Foreign Keys |
|-------|-------------|------------|--------------|
| `skus` | Stock keeping units | `id` (UUID) | - |
| `orders` | Customer orders | `id` (UUID) | - |
| `order_items` | Items in an order | `id` (UUID) | `order_id`, `sku_id` |
| `jobs` | Manufacturing jobs | `id` (UUID) | `order_id`, `sku_id` |
| `job_history` | Job status history | `id` (UUID) | `job_id` |

### Row-Level Security (RLS)

The application uses Supabase Row-Level Security (RLS) policies to control access to data:

| Table | Policy | Description |
|-------|--------|-------------|
| `skus` | `select_all` | Allow anyone to read SKUs |
| `orders` | `select_all` | Allow anyone to read orders |
| `orders` | `insert_authenticated` | Allow authenticated users to create orders |
| `order_items` | `select_all` | Allow anyone to read order items |
| `jobs` | `select_all` | Allow anyone to read jobs |
| `jobs` | `update_authenticated` | Allow authenticated users to update jobs |
| `job_history` | `select_all` | Allow anyone to read job history |

## Configuration Files

### `next.config.js`

The Next.js configuration file includes settings for:

- Environment variables
- Image optimization
- API routes
- Middleware

### `tailwind.config.js`

The Tailwind CSS configuration file includes:

- Custom colors
- Extended theme
- Plugins
\`\`\`

Finally, let's update the installation guide with more details about setting up Supabase:
