import type { OrderStatus, JobStatus, JobPhase } from "@/constants/job-workflow"
import type { SkuCategory, CollectionName, GoldType, StoneType } from "@/constants/categories"

// Update the SKU type to make id optional since it will be generated by the server
export type SKU = {
  id?: string // Optional since it will be generated by the server
  sku_id?: string // The server-generated SKU ID
  name: string
  category: SkuCategory // Updated to use the SkuCategory type
  collection?: CollectionName // Added collection field
  size?: number // Changed from string to number
  goldType: GoldType // Updated to use the GoldType type
  stoneType: StoneType // Updated to use the StoneType type
  diamondType?: string
  weight?: string
  image?: string
  createdAt?: string
}

// Define the type for a single stone lot from the database
export interface StoneLotData {
  id: string;
  lot_number: string;
  stone_type: string;
  stone_size: string;
  quantity: number;
  weight: number;
  available: boolean;
  // New fields from your Supabase table
  shape?: string;
  quality?: string;
  type?: string;
  location?: string;
  status?: string; // If you want to expose the raw status
  created_at?: string; // For displaying when the lot was created
}

// Define the type for an allocated stone row in the form
export interface StoneAllocation {
  clientId: string // For React key prop
  lot_number: string
  stone_type: string
  size: string
  quantity: number
  weight: number
  available_quantity?: number // Store available quantity for validation
  available_weight?: number // Store available weight for validation
}

// Define the type for a single diamond lot from the database
export interface DiamondLotData {
  id: string
  lot_number: string
  size: string
  shape?: string
  quality?: string
  a_type?: string // As per schema
  stonegroup?: string // As per schema
  quantity: number // Available quantity in the lot
  weight: number // Total weight of the lot in carats
  price: number // As per schema
  status: string
}

// Define the type for an allocated diamond row in the form
export interface DiamondAllocation {
  clientId: string // For React key prop
  lot_number: string
  size: string
  shape: string
  quality: string
  quantity: number // User-allocated quantity
  weight: number // User-allocated weight in carats (direct input)
  available_quantity?: number // Stored from DiamondLotData for validation
}

export interface Job {
  id: string
  job_id: string // Display ID like J-0001-1
  order_id: string // UUID reference to orders.id
  order_item_id: string // UUID reference to order items
  sku_id: string // UUID reference to SKUs
  orderId: string // Legacy field
  skuId: string // Legacy field
  name: string
  category: string
  goldType: string
  stoneType: string
  diamondType: string // This might become obsolete or change with new diamond allocation
  size: string // Note: This is still a string in the Job interface
  status: JobStatus // Updated to use the JobStatus type
  manufacturer: string
  production_date: string // Database field name
  productionDate: string // Legacy field
  dueDate: string
  createdAt: string
  image: string
  currentPhase: JobPhase // Updated to use the JobPhase type
  // Nested relations from database query
  orders?: {
    id: string
    order_id: string
    customer_name: string
    status: string
    order_type: string
  }
  skus?: {
    id: string
    sku_id: string
    name: string
    image_url: string
  }
  stoneData?: {
    allocations: StoneAllocation[]
    total_quantity: number
    total_weight: number
    timestamp: string
  }
  diamondData?: {
    // Updated structure for diamondData
    allocations: DiamondAllocation[]
    total_quantity: number
    total_weight: number
    timestamp: string
  }
  manufacturerData?: any
  qcData?: QCData
}

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
    size: string // Note: This is still a string in the Order interface
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

export interface OrderFormData {
  orderId?: string // Make orderId optional
  customerName: string
  // other fields...
}

export interface OrderFormState {
  orderId?: string // Make orderId optional
  customerName: string
  // other fields...
}

// QC Data interfaces for extended quality check functionality
export interface QCData {
  notes?: string
  passed?: boolean | null
  weight?: number // Keep existing field for backward compatibility
  goldUsageDetails?: GoldUsageDetail[]
  diamondUsageDetails?: DiamondUsageDetail[]
  coloredStoneUsageDetails?: ColoredStoneUsageDetail[]
}

export interface GoldUsageDetail {
  description: string // Gold type from GOLD_TYPE constants
  grossWeight: number
  scrapWeight: number
}

export interface DiamondUsageDetail {
  type: string // Diamond lot number
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}

export interface ColoredStoneUsageDetail {
  type: string // Stone lot number
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}
