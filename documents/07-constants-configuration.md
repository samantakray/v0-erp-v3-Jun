# Constants and Configuration

## Overview

The Jewelry ERP application uses various constants and configuration values to define business rules, workflow states, UI elements, and data validation. This document describes these constants and their usage across the application.

## Job Workflow Constants (`/constants/job-workflow.ts`)

The job workflow constants define the possible states and transitions for jobs and orders.

### Job Statuses

\`\`\`typescript
export const JOB_STATUS = {
  NEW: "New",
  BAG_CREATED: "Bag Created",
  STONE_SELECTED: "Stone Selected",
  DIAMOND_SELECTED: "Diamond Selected",
  SENT_TO_MANUFACTURER: "Sent to Manufacturer",
  IN_PRODUCTION: "In Production",
  RECEIVED_FROM_MANUFACTURER: "Received from Manufacturer",
  QC_PASSED: "QC Passed",
  QC_FAILED: "QC Failed",
  COMPLETED: "Completed",
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]
\`\`\`

### Order Statuses

\`\`\`typescript
export const ORDER_STATUS = {
  NEW: "New",
  PENDING: "Pending",
  COMPLETED: "Completed",
  DRAFT: "Draft",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
\`\`\`

### Job Phases

\`\`\`typescript
export const JOB_PHASE = {
  STONE: "stone",
  DIAMOND: "diamond",
  MANUFACTURER: "manufacturer",
  QUALITY_CHECK: "qc",
  COMPLETE: "complete",
} as const

export type JobPhase = (typeof JOB_PHASE)[keyof typeof JOB_PHASE]
\`\`\`

### Status to Phase Mapping

\`\`\`typescript
export const STATUS_TO_PHASE: Record<JobStatus, JobPhase> = {
  [JOB_STATUS.NEW]: JOB_PHASE.STONE,
  [JOB_STATUS.BAG_CREATED]: JOB_PHASE.STONE,
  [JOB_STATUS.STONE_SELECTED]: JOB_PHASE.DIAMOND,
  [JOB_STATUS.DIAMOND_SELECTED]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.SENT_TO_MANUFACTURER]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.IN_PRODUCTION]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: JOB_PHASE.QUALITY_CHECK,
  [JOB_STATUS.QC_PASSED]: JOB_PHASE.COMPLETE,
  [JOB_STATUS.QC_FAILED]: JOB_PHASE.MANUFACTURER,
  [JOB_STATUS.COMPLETED]: JOB_PHASE.COMPLETE,
}
\`\`\`

### Job Status to Order Status Mapping

\`\`\`typescript
export const JOB_STATUS_TO_ORDER_STATUS: Record<JobStatus, OrderStatus> = {
  [JOB_STATUS.NEW]: ORDER_STATUS.NEW,
  [JOB_STATUS.BAG_CREATED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.STONE_SELECTED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.DIAMOND_SELECTED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.SENT_TO_MANUFACTURER]: ORDER_STATUS.PENDING,
  [JOB_STATUS.IN_PRODUCTION]: ORDER_STATUS.PENDING,
  [JOB_STATUS.RECEIVED_FROM_MANUFACTURER]: ORDER_STATUS.PENDING,
  [JOB_STATUS.QC_PASSED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.QC_FAILED]: ORDER_STATUS.PENDING,
  [JOB_STATUS.COMPLETED]: ORDER_STATUS.COMPLETED,
}
\`\`\`

### Phase Display Information

\`\`\`typescript
export const PHASE_INFO = {
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
  [JOB_PHASE.QUALITY_CHECK]: {
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

## Product Categories and Types (`/constants/categories.ts`)

### SKU Categories

\`\`\`typescript
export const SKU_CATEGORY = {
  NECKLACE: "Necklace",
  BANGLE: "Bangle",
  RING: "Ring",
  EARRING: "Earring",
  PENDANT: "Pendant",
  BALL_LOCK: "Ball Lock",
  BROUCH: "Brouch",
  BRACELET: "Bracelet",
  CUFF_LINK: "Cuff Link",
  CHAIN: "Chain",
  EXTRAS: "Extras",
  TYRE: "Tyre",
  KADI: "Kadi",
  EARRING_PART: "Earring Part",
} as const

export type SkuCategory = (typeof SKU_CATEGORY)[keyof typeof SKU_CATEGORY]
\`\`\`

### Collection Names

The application supports 29 different jewelry collections:

\`\`\`typescript
export const COLLECTION_NAME = {
  NONE: "None",
  ART_CARVED: "Art Carved",
  AZULIK: "Azulik",
  CARNIVAL: "Carnival",
  CARNIVAL_BUNCH: "Carnival Bunch",
  CATERPILLAR: "Caterpillar",
  CHAKRA: "Chakra",
  CLOVER: "Clover",
  CRESCENT: "Crescent",
  DECO_CHIC: "Deco Chic",
  EMBRACE: "Embrace",
  ETERNITY: "Eternity",
  FLORAL: "Floral",
  FLORAL_SYMPHONY: "Floral Symphony",
  GEM_LACES: "Gem Laces",
  JAIPORE: "Jaipore",
  KALEIDOSCOPE: "Kaleidoscope",
  MIDNIGHT: "Midnight",
  MONACO: "Monaco",
  PADMA: "Padma",
  PEACOCK: "Peacock",
  PEBBLES: "Pebbles",
  PRISM_PERFECTION: "Prism Perfection",
  RATAN: "Ratan",
  ROCK_CANDY: "Rock Candy",
  ROYAL: "Royal",
  SUMMER: "Summer",
  TALISMAN: "Talisman",
  TUTTI_FRUTTI: "Tutti Frutti",
} as const
\`\`\`

### Gold Types

\`\`\`typescript
export const GOLD_TYPE = {
  YELLOW_GOLD: "Yellow Gold",
  WHITE_GOLD: "White Gold",
  ROSE_GOLD: "Rose Gold",
} as const

export const GOLD_TYPE_CODES = {
  [GOLD_TYPE.YELLOW_GOLD]: "18KYG",
  [GOLD_TYPE.WHITE_GOLD]: "18KWG",
  [GOLD_TYPE.ROSE_GOLD]: "18KRG",
} as const
\`\`\`

### Stone Types

The application supports 70+ different stone types including:

\`\`\`typescript
export const STONE_TYPE = {
  NONE: "None",
  AKOYA_PEARL: "Akoya Pearl",
  AMAZONITE: "Amazonite",
  AMETHYST: "Amethyst",
  APATITE: "Apatite",
  AQUAMARINE: "Aquamarine",
  // ... (70+ stone types total)
  RUBY: "Ruby",
  EMERALD: "Emerald",
  SAPPHIRE: "Sapphire",
} as const
\`\`\`

Each stone type has a corresponding code for SKU generation:

\`\`\`typescript
export const STONE_TYPE_CODES = {
  [STONE_TYPE.NONE]: "",
  [STONE_TYPE.AKOYA_PEARL]: "KW",
  [STONE_TYPE.AMAZONITE]: "AZ",
  // ... (codes for all stone types)
} as const
\`\`\`

### Category Codes for SKU Generation

\`\`\`typescript
export const CATEGORY_CODES: Record<SkuCategory, string> = {
  [SKU_CATEGORY.NECKLACE]: "NK",
  [SKU_CATEGORY.BANGLE]: "BN",
  [SKU_CATEGORY.RING]: "RG",
  [SKU_CATEGORY.EARRING]: "ER",
  [SKU_CATEGORY.PENDANT]: "PN",
  [SKU_CATEGORY.BALL_LOCK]: "BL",
  [SKU_CATEGORY.BROUCH]: "BO",
  [SKU_CATEGORY.BRACELET]: "BR",
  [SKU_CATEGORY.CUFF_LINK]: "CF",
  [SKU_CATEGORY.CHAIN]: "CH",
  [SKU_CATEGORY.EXTRAS]: "EX",
  [SKU_CATEGORY.TYRE]: "TY",
  [SKU_CATEGORY.KADI]: "EX",
  [SKU_CATEGORY.EARRING_PART]: "EX",
}
\`\`\`

### Size Configuration Constants

The application includes comprehensive size management for different categories:

#### Default Sizes
\`\`\`typescript
export const DEFAULT_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.NECKLACE]: 16, // 16 inches
  [SKU_CATEGORY.BANGLE]: 2.5, // 2.5 inches
  [SKU_CATEGORY.RING]: 14, // 14mm
  [SKU_CATEGORY.PENDANT]: 18, // 18 inches
  [SKU_CATEGORY.BRACELET]: 7.5, // 7.5 inches
  [SKU_CATEGORY.CHAIN]: 9, // 9 inches
}
\`\`\`

#### Size Ranges
\`\`\`typescript
export const MIN_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 8, // 8mm
  [SKU_CATEGORY.BRACELET]: 6, // 6 inches
  [SKU_CATEGORY.BANGLE]: 6, // 6 inches
  [SKU_CATEGORY.NECKLACE]: 9, // 9 inches
  [SKU_CATEGORY.PENDANT]: 9, // 9 inches
  [SKU_CATEGORY.CHAIN]: 9, // 9 inches
}

export const MAX_SIZES: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 20, // 20mm
  [SKU_CATEGORY.BRACELET]: 18, // 18 inches
  [SKU_CATEGORY.BANGLE]: 18, // 18 inches
  [SKU_CATEGORY.NECKLACE]: 35, // 35 inches
  [SKU_CATEGORY.PENDANT]: 35, // 35 inches
  [SKU_CATEGORY.CHAIN]: 35, // 35 inches
}
\`\`\`

#### Size Increments and Units
\`\`\`typescript
export const SIZE_DENOMINATIONS: Partial<Record<SkuCategory, number>> = {
  [SKU_CATEGORY.RING]: 0.5, // 0.5mm increments
  [SKU_CATEGORY.BRACELET]: 0.25, // 0.25 inch increments
  [SKU_CATEGORY.BANGLE]: 0.25, // 0.25 inch increments
  [SKU_CATEGORY.NECKLACE]: 0.5, // 0.5 inch increments
  [SKU_CATEGORY.PENDANT]: 0.5, // 0.5 inch increments
  [SKU_CATEGORY.CHAIN]: 0.5, // 0.5 inch increments
}

export const SIZE_UNITS: Partial<Record<SkuCategory, string>> = {
  [SKU_CATEGORY.RING]: "mm",
  [SKU_CATEGORY.BRACELET]: "inch",
  [SKU_CATEGORY.BANGLE]: "inch",
  [SKU_CATEGORY.NECKLACE]: "inch",
  [SKU_CATEGORY.PENDANT]: "inch",
  [SKU_CATEGORY.CHAIN]: "inch",
}
\`\`\`

### Helper Functions

#### `getCategoryCode(categoryName: string): string`
Returns the category code for SKU generation based on category name.

**Example:**
\`\`\`typescript
import { getCategoryCode } from "@/constants/categories"

const code = getCategoryCode("Ring") // Returns "RG"
const unknownCode = getCategoryCode("Unknown") // Returns "OO"
\`\`\`

## TypeScript Type Definitions (`/types/index.ts`)

### Core Entity Types

#### SKU Type
\`\`\`typescript
export type SKU = {
  id?: string // Optional since it will be generated by the server
  sku_id?: string // The server-generated SKU ID
  name: string
  category: SkuCategory
  collection?: CollectionName
  size?: number // Changed from string to number
  goldType: GoldType
  stoneType: StoneType
  diamondType?: string
  weight?: string
  image?: string
  createdAt?: string
}
\`\`\`

#### Job Type
\`\`\`typescript
export interface Job {
  id: string
  orderId: string
  skuId: string
  name: string
  category: string
  goldType: string
  stoneType: string
  diamondType: string
  size: string
  status: JobStatus
  manufacturer: string
  productionDate: string
  dueDate: string
  createdAt: string
  image: string
  currentPhase: JobPhase
  stoneData?: {
    allocations: StoneAllocation[]
    total_quantity: number
    total_weight: number
    timestamp: string
  }
  diamondData?: {
    allocations: DiamondAllocation[]
    total_quantity: number
    total_weight: number
    timestamp: string
  }
  manufacturerData?: any
  qcData?: any
}
\`\`\`

#### Order Type
\`\`\`typescript
export interface Order {
  id: string
  orderType: string
  customerName: string
  customerId: string
  skus: {
    id: string
    name: string
    quantity: number
    category?: string
    goldType?: string
    stoneType?: string
    diamondType?: string
    size: string
    remarks: string
    image: string
    individualProductionDate?: string
    individualDeliveryDate?: string
  }[]
  dueDate?: string
  deliveryDate?: string
  productionDate?: string
  productionDueDate?: string
  status: OrderStatus
  action: string
  daysToDue?: number
  remarks: string
  history?: {
    date: string
    action: string
    user: string
  }[]
  createdAt?: string
}
\`\`\`

### Material Allocation Types

#### Stone Allocation Types
\`\`\`typescript
export interface StoneLotData {
  id: string
  lot_number: string
  stone_type: string
  size: string
  quantity: number
  weight: number
  available: boolean
}

export interface StoneAllocation {
  clientId: string // For React key prop
  lot_number: string
  stone_type: string
  size: string
  quantity: number
  weight: number
  available_quantity?: number
  available_weight?: number
}
\`\`\`

#### Diamond Allocation Types
\`\`\`typescript
export interface DiamondLotData {
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

export interface DiamondAllocation {
  clientId: string // For React key prop
  lot_number: string
  size: string
  shape: string
  quality: string
  quantity: number
  weight: number
  available_quantity?: number
}
\`\`\`

## Environment Variables

The application uses the following environment variables:

### Core Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_USE_MOCKS` | Whether to use mock data instead of Supabase | Yes | `"true"` or `"false"` |

### Supabase Configuration
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the Supabase project | Yes (when not using mocks) | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key for Supabase | Yes (when not using mocks) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Supabase admin operations | Yes (for admin operations) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_JWT_SECRET` | JWT secret for Supabase | No | `your-jwt-secret` |
| `SUPABASE_ANON_KEY` | Alternative anonymous key | No | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### PostgreSQL Configuration (Alternative to Supabase)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `POSTGRES_URL` | PostgreSQL connection URL | No | `postgresql://user:password@host:port/database` |
| `POSTGRES_PRISMA_URL` | PostgreSQL connection URL for Prisma | No | `postgresql://user:password@host:port/database?schema=public` |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL connection URL without connection pooling | No | `postgresql://user:password@host:port/database` |
| `POSTGRES_USER` | PostgreSQL username | No | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | No | `password` |
| `POSTGRES_DATABASE` | PostgreSQL database name | No | `jewelry_erp` |
| `POSTGRES_HOST` | PostgreSQL host | No | `localhost` |

### Environment File Example

\`\`\`env
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

## Configuration Files

### Next.js Configuration (`next.config.mjs`)
- Environment variables
- Image optimization settings
- API routes configuration
- Middleware settings

### Tailwind CSS Configuration (`tailwind.config.ts`)
- Custom colors and themes
- Extended utility classes
- Component-specific styling
- shadcn/ui integration

### TypeScript Configuration (`tsconfig.json`)
- Path aliases (`@/` for root directory)
- Strict type checking
- Module resolution settings

## Usage Examples

### Working with Job Statuses
\`\`\`typescript
import { JOB_STATUS, JOB_PHASE, STATUS_TO_PHASE } from "@/constants/job-workflow"

// Check current phase for a job status
const currentPhase = STATUS_TO_PHASE[JOB_STATUS.STONE_SELECTED] // Returns JOB_PHASE.DIAMOND

// Use in components
const isInStonePhase = job.currentPhase === JOB_PHASE.STONE
\`\`\`

### Working with Categories
\`\`\`typescript
import { SKU_CATEGORY, getCategoryCode, DEFAULT_SIZES } from "@/constants/categories"

// Get category code for SKU generation
const categoryCode = getCategoryCode("Ring") // Returns "RG"

// Get default size for a category
const defaultSize = DEFAULT_SIZES[SKU_CATEGORY.RING] // Returns 14
\`\`\`

### Type-Safe Form Handling
\`\`\`typescript
import type { SKU, Job, Order } from "@/types"

// Create type-safe form data
const newSKU: Partial<SKU> = {
  name: "Gold Ring",
  category: SKU_CATEGORY.RING,
  goldType: GOLD_TYPE.YELLOW_GOLD,
  stoneType: STONE_TYPE.NONE,
  size: 14
}
\`\`\`

This configuration system ensures type safety, consistent data handling, and maintainable code across the entire application.
