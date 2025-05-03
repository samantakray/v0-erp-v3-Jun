# Data Models

## Overview

The Jewelry ERP application uses several core data models to represent the business entities. This document describes the structure and relationships of these models.

## Core Data Models

### SKU Model

The SKU (Stock Keeping Unit) model represents a jewelry design that can be manufactured.

\`\`\`typescript
export interface SKU {
  id: string           // Unique identifier
  name: string         // Display name
  category: string     // Product category (Ring, Necklace, etc.)
  size: string         // Size specification
  goldType: string     // Type of gold (Yellow, White, Rose)
  stoneType: string    // Type of stone
  diamondType: string  // Type of diamond
  image: string        // URL to product image
}
\`\`\`

### Job Model

The Job model represents a single jewelry item being manufactured.

\`\`\`typescript
export interface Job {
  id: string           // Unique identifier
  orderId: string      // Reference to parent order
  skuId: string        // Reference to SKU
  name: string         // Display name
  category: string     // Product category
  goldType: string     // Type of gold
  stoneType: string    // Type of stone
  diamondType: string  // Type of diamond
  size: string         // Size specification
  status: string       // Current status
  manufacturer: string // Assigned manufacturer
  productionDate: string // Date production started
  dueDate: string      // Due date for completion
  createdAt: string    // Creation timestamp
  image: string        // URL to product image
  currentPhase: string // Current workflow phase
  stoneData?: any      // Stone selection data
  diamondData?: any    // Diamond selection data
  manufacturerData?: any // Manufacturer data
  qcData?: any         // Quality control data
}
\`\`\`

### Order Model

The Order model represents a customer or stock order containing multiple jobs.

\`\`\`typescript
export interface Order {
  id: string           // Unique identifier
  orderType: string    // Customer or Stock
  customerName: string // Customer name
  skus: {              // SKUs included in the order
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
  }[]
  dueDate?: string     // Due date for the order
  deliveryDate?: string // Delivery date
  productionDate?: string // Production start date
  productionDueDate?: string // Production due date
  status: string       // Order status
  action: string       // Current action
  daysToDue?: number   // Days until due
  remarks: string      // Additional notes
  history?: {          // Order history
    date: string
    action: string
    user: string
  }[]
  createdAt?: string   // Creation timestamp
}
\`\`\`

## Data Validation Rules

1. **SKU ID Format**: Must follow the pattern `[Category Prefix][Number][Gold Type][Stone Type]`
   - Category Prefix: NK (Necklace), RG (Ring), ER (Earring), BG (Bangle), PN (Pendant)
   - Gold Type: YG (Yellow Gold), WG (White Gold), RG (Rose Gold)
   - Stone Type: NO (None), EM (Emerald), RB (Ruby), SP (Sapphire)

2. **Order ID Format**: Must follow the pattern `O[5-digit number]`

3. **Job ID Format**: Must follow the pattern `J[Order Number]-[Sequence]`

4. **Dates**:
   - Production date must be before delivery date
   - Delivery date must be at least 7 days after production date
