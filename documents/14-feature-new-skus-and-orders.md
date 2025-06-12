# Feature Documentation: New SKUs and Orders Creation

This document provides detailed technical documentation for the SKU and Order creation features in the Jewelry ERP application.

## Table of Contents

1. [New SKU Creation Feature](#new-sku-creation-feature)
2. [New Order Creation Feature](#new-order-creation-feature)
3. [Integration Points](#integration-points)
4. [Database Interactions](#database-interactions)
5. [Error Handling](#error-handling)
6. [Performance Considerations](#performance-considerations)

---

## New SKU Creation Feature

### Overview

The New SKU Creation feature allows users to create single or multiple SKUs with automatic ID generation, image upload, and comprehensive product categorization. The feature is implemented in `components/new-sku-sheet.tsx`.

### User Flow

#### 1. **Sheet Opening and Initialization**
- User clicks "Create SKU" button (from various locations)
- `NewSKUSheet` component opens as a slide-out panel
- System automatically fetches predicted next SKU number
- Default SKU variant is initialized with:
  - Category: "Necklace"
  - Collection: "None"
  - Gold Type: "Yellow Gold"
  - Stone Type: "None"
  - Size: Default for category (16 for necklace)

#### 2. **SKU Configuration**
- **Category Selection**: User selects from 14 available categories (Ring, Necklace, etc.)
- **Size Auto-Update**: When category changes, size automatically updates to category default
- **Collection Selection**: User selects from 29+ available collections
- **Gold Type Selection**: Yellow Gold, White Gold, or Rose Gold
- **Stone Type Selection**: User selects from 70+ stone types (grouped alphabetically)
- **Image Upload**: Optional image upload with validation and preview

#### 3. **Multiple SKU Variants**
- User can add multiple SKU variants using "Add SKU Variant" button
- Each variant can have different configurations
- All variants share the same sequential number but get different category prefixes
- Example: RG-0001 (Ring), NK-0001 (Necklace) for the same batch

#### 4. **SKU ID Preview**
- Real-time preview of SKU ID based on category selection
- Format: `{CategoryCode}-{SequentialNumber}` (e.g., "RG-0001")
- Shows "Generating..." while fetching predicted number

#### 5. **Batch Creation**
- User clicks "Create SKU(s)" button
- System validates all data and images
- Batch creation process begins
- Success feedback and sheet closure

### Technical Implementation

#### Core Files and Dependencies

\`\`\`
components/new-sku-sheet.tsx (Main Component)
├── app/actions/sku-sequence-actions.ts (SKU ID Management)
├── app/actions/sku-actions.ts (Individual SKU Creation)
├── constants/categories.ts (Product Categories & Constants)
├── components/image-upload.tsx (Image Handling)
├── lib/supabase-storage.ts (Image Storage)
├── lib/supabaseClient.ts (Database Connection)
└── lib/logger.ts (Logging)
\`\`\`

#### State Management

\`\`\`typescript
// Main SKU variants state
const [multipleSkus, setMultipleSkus] = useState([{
  category: "Necklace",
  collection: COLLECTION_NAME.NONE,
  size: DEFAULT_SIZES["Necklace"] ?? 0,
  goldType: GOLD_TYPE.YELLOW_GOLD,
  stoneType: STONE_TYPE.NONE,
  diamondType: "",
  weight: "",
  imageUrl: "",
  imageFile: null
}])

// SKU number management
const [nextSequentialNumber, setNextSequentialNumber] = useState(null)
const [formattedNumber, setFormattedNumber] = useState(null)
const [isPredictedNumber, setIsPredictedNumber] = useState(true)

// Error and loading states
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
const [uploadErrors, setUploadErrors] = useState({})
\`\`\`

#### SKU ID Generation Process

1. **Prediction Phase** (Sheet Opening):
   \`\`\`typescript
   // Calls getPredictedNextSkuNumber()
   const result = await getPredictedNextSkuNumber()
   // Returns: { success: true, predictedNumber: 1, formattedNumber: "0001" }
   \`\`\`

2. **Actual Generation** (Submission):
   \`\`\`typescript
   // Calls getNextSkuNumber() for actual sequence
   const sequenceResult = await getNextSkuNumber()
   // Increments sku_sequences table and returns actual number
   \`\`\`

3. **SKU ID Assembly**:
   \`\`\`typescript
   const prefix = getCategoryCode(sku.category) || "OO"
   const skuId = `${prefix}-${sequenceResult.formattedNumber}`
   // Example: "RG-0001", "NK-0001"
   \`\`\`

### Database Interactions

#### Tables Involved

1. **`sku_sequences`**: Manages sequential numbering
   \`\`\`sql
   CREATE TABLE sku_sequences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     current_number INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   \`\`\`

2. **`skus`**: Stores SKU data
   \`\`\`sql
   CREATE TABLE skus (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     sku_id TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     collection TEXT,
     size DECIMAL,
     gold_type TEXT NOT NULL,
     stone_type TEXT NOT NULL,
     diamond_type TEXT,
     weight TEXT,
     image_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   \`\`\`

#### Database Functions Used

1. **`get_next_sku_number()`**: Atomically increments and returns next sequence number
2. **`generate_sku_id()`**: Trigger function for SKU ID generation (if needed)

#### Data Flow

\`\`\`
User Input → Component State → Validation → Server Action → Database
                                                    ↓
Image Upload → Supabase Storage → URL → Database Record
                                                    ↓
Success Response → UI Update → Sheet Closure → Parent Callback
\`\`\`

---

## New Order Creation Feature

### Overview

The New Order Creation feature provides a comprehensive interface for creating orders with multiple SKUs, customer selection, date management, and integrated SKU creation. Implemented in `components/new-order-sheet.tsx`.

### User Flow

#### 1. **Order Initialization**
- User opens order creation sheet
- System fetches predicted next order ID (e.g., "O-0001")
- System loads customers and SKUs from database
- Default values are set:
  - Order Type: "Stock"
  - Customer: "Exquisite Fine Jewellery" (for Stock orders)
  - Production Date: Today + 45 days

#### 2. **Order Configuration**
- **Order Type Selection**: "Stock" or "Customer"
- **Customer Selection**: 
  - Stock orders: Fixed to default customer
  - Customer orders: Dropdown of active customers
- **Date Management**:
  - Production Date: When manufacturing should start
  - Delivery Date: When order should be completed
  - Individual dates per SKU (optional)
- **Reference Notes**: Optional order-level remarks

#### 3. **SKU Selection Methods**

##### Method 1: Select Existing SKUs
- **Search and Filter**: Real-time search by SKU ID or name
- **Category Filters**: Filter by category, gold type, stone type
- **SKU Table**: Displays available SKUs with images and details
- **Add to Order**: Click "+" to add SKU to order
- **Quantity Management**: Set quantity for each selected SKU
- **Size Specification**: Enter size for each SKU (disabled for earrings)

##### Method 2: Create New SKU
- **Integrated Creation**: Opens `NewSKUSheet` within the order flow
- **Auto-Addition**: Created SKU automatically added to order
- **Seamless Flow**: Returns to order creation after SKU creation

##### Method 3: Bulk Assignment
- **Text Input**: Paste comma-separated SKU list
- **Format**: `SKU-001:2, SKU-002:1, SKU-003:3`
- **Validation**: Checks SKU existence and formats
- **Batch Addition**: Adds all valid SKUs to order

#### 4. **Order Review and Submission**
- **Selected SKUs Table**: Shows all selected SKUs with quantities, sizes, dates
- **Date Validation**: Ensures delivery dates are after production dates
- **Draft Option**: Save as draft for later completion
- **Final Submission**: Creates order and generates jobs

### Technical Implementation

#### Core Files and Dependencies

\`\`\`
components/new-order-sheet.tsx (Main Component)
├── app/actions/order-actions.ts (Order Management)
├── lib/api-service.ts (Data Fetching)
├── components/new-sku-sheet.tsx (Integrated SKU Creation)
├── constants/job-workflow.ts (Order/Job Status Constants)
├── constants/categories.ts (Product Categories)
├── lib/supabaseClient.ts (Database Connection)
└── lib/logger.ts (Logging)
\`\`\`

#### State Management

\`\`\`typescript
// Order configuration
const [orderType, setOrderType] = useState("Stock")
const [customerName, setCustomerName] = useState("Exquisite Fine Jewellery")
const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER_ID)
const [productionDueDate, setProductionDueDate] = useState(getDefaultProductionDate())
const [deliveryDate, setDeliveryDate] = useState("")
const [remarks, setRemarks] = useState("")

// SKU management
const [selectedSKUs, setSelectedSKUs] = useState([])
const [availableSKUs, setAvailableSKUs] = useState([])
const [searchQuery, setSearchQuery] = useState("")

// UI state
const [activeTab, setActiveTab] = useState("select-sku")
const [isSubmitting, setIsSubmitting] = useState(false)
const [formError, setFormError] = useState(null)

// Bulk assignment
const [bulkSkuInput, setBulkSkuInput] = useState("")
const [bulkAssignError, setBulkAssignError] = useState(null)
\`\`\`

#### Order Prediction System

\`\`\`typescript
// Fetches predicted order ID on sheet open
const fetchPredictedOrderNumber = async () => {
  const result = await getPredictedNextOrderNumber()
  if (result.success && result.predictedOrderId) {
    setPredictedOrderId(result.predictedOrderId)
  }
}
\`\`\`

#### SKU Management Functions

\`\`\`typescript
// Add SKU to order
const addSKU = (sku) => {
  const existingIndex = selectedSKUs.findIndex((item) => item.id === sku.id)
  
  if (existingIndex >= 0) {
    // Update quantity if already exists
    const updatedSKUs = [...selectedSKUs]
    updatedSKUs[existingIndex].quantity += 1
    setSelectedSKUs(updatedSKUs)
  } else {
    // Add new SKU with default values
    const newSku = {
      ...sku,
      quantity: 1,
      size: sku.size || "",
      remarks: "",
      individualProductionDate: productionDueDate || "",
      individualDeliveryDate: deliveryDate || "",
    }
    setSelectedSKUs([...selectedSKUs, newSku])
  }
}

// Bulk SKU parsing
const parseBulkSkuInput = (input) => {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item)
    .map((item) => {
      const [skuId, quantityStr] = item.split(":").map((part) => part.trim())
      const quantity = parseInt(quantityStr, 10)
      
      if (!skuId) throw new Error(`Invalid SKU ID format in "${item}"`)
      if (isNaN(quantity) || quantity <= 0) throw new Error(`Invalid quantity for SKU ${skuId}`)
      
      return { skuId, quantity }
    })
}
\`\`\`

### Database Interactions

#### Tables Involved

1. **`orders`**: Main order records
2. **`order_items`**: Individual SKU items within orders
3. **`jobs`**: Generated jobs for each SKU unit
4. **`job_history`**: Initial job history entries
5. **`customers`**: Customer information
6. **`skus`**: Available SKUs for selection

#### Order Creation Process

\`\`\`typescript
// 1. Create order record
const { data: newOrder, error: orderError } = await supabase
  .from("orders")
  .insert({
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

// 2. Create order items
const orderItems = orderData.skus.map((sku) => ({
  order_id: newOrder.id,
  sku_id: skuIdToUuid[sku.id],
  quantity: sku.quantity,
  size: sku.size,
  remarks: sku.remarks,
  individual_production_date: sku.individualProductionDate || null,
  individual_delivery_date: sku.individualDeliveryDate || null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

const { data: insertedItems, error: itemsError } = await supabase
  .from("order_items")
  .insert(orderItems)
  .select("id, sku_id, quantity, size, remarks, individual_production_date, individual_delivery_date")

// 3. Generate jobs for each SKU unit
const jobs = []
let seq = 1

for (const item of insertedItems) {
  for (let copy = 1; copy <= item.quantity; copy++) {
    jobs.push({
      job_id: `J${newOrder.order_id.substring(1)}-${seq++}`,
      order_id: newOrder.id,
      order_item_id: item.id,
      sku_id: item.sku_id,
      size: item.size,
      status: JOB_STATUS.NEW,
      current_phase: JOB_PHASE.STONE,
      production_date: prodDate,
      due_date: dueDate,
      created_at: nowIso,
      updated_at: nowIso,
    })
  }
}

// 4. Insert jobs
const { data: jobRows, error: jobsError } = await supabase
  .from("jobs")
  .insert(jobs)
  .select("id")

// 5. Create initial job history
const history = jobRows.map((j) => ({
  job_id: j.id,
  status: JOB_STATUS.NEW,
  action: "Job created",
  created_at: nowIso,
}))

const { error: historyError } = await supabase
  .from("job_history")
  .insert(history)
\`\`\`

#### Data Fetching

\`\`\`typescript
// Fetch customers for dropdown
export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })
  
  return data
}

// Fetch available SKUs
export async function fetchSkus() {
  const { data, error } = await supabase
    .from("skus")
    .select("*")
    .order("created_at", { ascending: false })
  
  return data.map((sku) => ({
    id: sku.sku_id,
    name: sku.name,
    category: sku.category,
    collection: sku.collection,
    size: sku.size !== null ? Number(sku.size) : null,
    goldType: sku.gold_type,
    stoneType: sku.stone_type,
    diamondType: sku.diamond_type,
    weight: sku.weight,
    image: sku.image_url,
    createdAt: sku.created_at,
  }))
}
\`\`\`

---

## Integration Points

### Cross-Component Communication

#### 1. **NewSKUSheet ↔ NewOrderSheet**
\`\`\`typescript
// NewOrderSheet opens NewSKUSheet
const [newSKUSheetOpen, setNewSKUSheetOpen] = useState(false)

// NewSKUSheet callback to NewOrderSheet
const handleNewSKUCreated = (newSKU) => {
  // Add new SKU to available SKUs
  setAvailableSKUs([...availableSKUs, newSKU])
  
  // Auto-add to selected SKUs
  setSelectedSKUs([...selectedSKUs, {
    ...newSKU,
    quantity: 1,
    size: newSKU.size || "",
    remarks: "",
    individualProductionDate: productionDueDate || "",
    individualDeliveryDate: deliveryDate || "",
  }])
  
  // Switch back to SKU selection tab
  setActiveTab("select-sku")
}
\`\`\`

#### 2. **Parent Component Callbacks**
\`\`\`typescript
// Both sheets use callback pattern for parent notification
<NewSKUSheet 
  open={newSKUSheetOpen} 
  onOpenChange={setNewSKUSheetOpen}
  onSKUCreated={handleNewSKUCreated} 
/>

<NewOrderSheet 
  open={newOrderSheetOpen} 
  onOpenChange={setNewOrderSheetOpen}
  onOrderCreated={handleOrderCreated}
  isSubmitting={isSubmitting}
/>
\`\`\`

### Shared Utilities

#### 1. **Constants Integration**
\`\`\`typescript
// Both components use shared constants
import {
  SKU_CATEGORY,
  COLLECTION_NAME,
  GOLD_TYPE,
  STONE_TYPE,
  DEFAULT_SIZES,
  getCategoryCode
} from "@/constants/categories"

import {
  ORDER_STATUS,
  JOB_STATUS,
  JOB_PHASE
} from "@/constants/job-workflow"
\`\`\`

#### 2. **Logging Integration**
\`\`\`typescript
// Consistent logging across both features
import { logger } from "@/lib/logger"

// SKU creation logging
logger.info(`createSku called`, {
  data: {
    name: skuData.name,
    category: skuData.category,
    hasImageFile: !!imageFile,
  },
})

// Order creation logging
logger.info(`createOrder called`, { data: orderData })
\`\`\`

---

## Database Interactions

### Transaction Management

#### SKU Creation
\`\`\`sql
-- Atomic sequence number generation
BEGIN;
  UPDATE sku_sequences SET current_number = current_number + 1 WHERE id = 1;
  SELECT current_number FROM sku_sequences WHERE id = 1;
COMMIT;
\`\`\`

#### Order Creation with Jobs
\`\`\`sql
-- Order creation is wrapped in application-level transaction
BEGIN;
  -- Insert order
  INSERT INTO orders (...) RETURNING id, order_id;
  
  -- Insert order items
  INSERT INTO order_items (...) RETURNING id, sku_id, quantity;
  
  -- Insert jobs (one per SKU unit)
  INSERT INTO jobs (...) RETURNING id;
  
  -- Insert job history
  INSERT INTO job_history (...);
COMMIT;
\`\`\`

### Database Functions Integration

#### 1. **SKU ID Generation**
\`\`\`sql
-- Function: get_next_sku_number()
CREATE OR REPLACE FUNCTION get_next_sku_number()
RETURNS TABLE(next_number INTEGER, formatted_number TEXT) AS $$
BEGIN
  UPDATE sku_sequences 
  SET current_number = current_number + 1, updated_at = NOW()
  WHERE id = (SELECT id FROM sku_sequences ORDER BY created_at LIMIT 1);
  
  RETURN QUERY
  SELECT 
    s.current_number,
    LPAD(s.current_number::TEXT, 4, '0')
  FROM sku_sequences s
  ORDER BY s.created_at LIMIT 1;
END;
$$ LANGUAGE plpgsql;
\`\`\`

#### 2. **Order ID Generation**
\`\`\`sql
-- Trigger: generate_order_id
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id IS NULL THEN
    NEW.order_id := 'O-' || LPAD((
      SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 3) AS INTEGER)), 0) + 1
      FROM orders 
      WHERE order_id ~ '^O-[0-9]+$'
    )::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

---

## Error Handling

### Client-Side Validation

#### SKU Creation
\`\`\`typescript
// Image validation
const validation = await validateImageFile(file)
if (!validation.isValid) {
  return { success: false, error: validation.error }
}

// Required field validation
if (!skuData.name || !skuData.category) {
  setError("Name and category are required")
  return
}
\`\`\`

#### Order Creation
\`\`\`typescript
// SKU selection validation
if (selectedSKUs.length === 0) {
  setFormError("Please select at least one SKU")
  return
}

// Date validation
if (!isDraft && (!productionDueDate || !deliveryDate)) {
  setFormError("Production and delivery dates are required")
  return
}

// Date logic validation
const hasDateWarning = selectedSKUs.some((sku) => {
  const prodDate = new Date(sku.individualProductionDate)
  const delDate = new Date(sku.individualDeliveryDate)
  return delDate < prodDate
})

if (hasDateWarning) {
  setFormError("Delivery Date cannot be set before the production date")
  return
}
\`\`\`

### Server-Side Error Handling

#### Database Error Recovery
\`\`\`typescript
// SKU creation with image cleanup
try {
  const { data, error } = await supabase.from("skus").insert(supabaseSkuData).select()
  
  if (error) {
    // Clean up uploaded image if database insertion fails
    if (uploadedImageUrl) {
      await deleteImageFromSupabase(uploadedImageUrl)
    }
    return { success: false, error: error.message }
  }
} catch (error) {
  // Clean up on unexpected errors
  if (uploadedImageUrl) {
    await deleteImageFromSupabase(uploadedImageUrl)
  }
  return { success: false, error: "An unexpected error occurred" }
}
\`\`\`

#### Bulk Operation Error Handling
\`\`\`typescript
// Bulk SKU creation with partial success handling
const results = []
for (const sku of skusToCreate) {
  try {
    const result = await createSku(sku.skuData, sku.skuId, sku.imageFile)
    results.push(result)
    
    if (!result.success) {
      // Log individual failures but continue processing
      logger.error(`Failed to create SKU in batch`, { 
        skuId: sku.skuId, 
        error: result.error 
      })
    }
  } catch (error) {
    logger.error(`Unexpected error creating SKU in batch`, { 
      skuId: sku.skuId, 
      error 
    })
  }
}
\`\`\`

---

## Performance Considerations

### Data Loading Optimization

#### Lazy Loading
\`\`\`typescript
// Load data only when sheet opens
useEffect(() => {
  if (open) {
    loadCustomers()
    loadSKUs()
    fetchPredictedOrderNumber()
  }
}, [open])
\`\`\`

#### Debounced Search
\`\`\`typescript
// Real-time search with performance optimization
const filteredSKUs = availableSKUs.filter((sku) => {
  if (searchQuery) {
    const skuId = sku.id ? sku.id.toLowerCase() : ""
    const skuName = sku.name ? sku.name.toLowerCase() : ""
    const query = searchQuery.toLowerCase()
    
    if (!skuId.includes(query) && !skuName.includes(query)) {
      return false
    }
  }
  // Additional filters...
  return true
})
\`\`\`

### Database Performance

#### Batch Operations
\`\`\`typescript
// Batch job creation instead of individual inserts
const jobs = []
for (const item of insertedItems) {
  for (let copy = 1; copy <= item.quantity; copy++) {
    jobs.push({
      job_id: `J${newOrder.order_id.substring(1)}-${seq++}`,
      order_id: newOrder.id,
      order_item_id: item.id,
      sku_id: item.sku_id,
      // ... other fields
    })
  }
}

// Single batch insert
const { data: jobRows, error: jobsError } = await supabase
  .from("jobs")
  .insert(jobs)
  .select("id")
\`\`\`

#### Selective Data Fetching
\`\`\`typescript
// Fetch only required fields
const { data, error } = await supabase
  .from("skus")
  .select("sku_id, name, category, collection, gold_type, stone_type, image_url")
  .order("created_at", { ascending: false })
\`\`\`

### Memory Management

#### Image Handling
\`\`\`typescript
// Proper cleanup of object URLs
const img = new Image()
const url = URL.createObjectURL(file)

img.onload = () => {
  URL.revokeObjectURL(url) // Clean up memory
  resolve({ width: img.width, height: img.height })
}

img.onerror = () => {
  URL.revokeObjectURL(url) // Clean up on error too
  reject(new Error("Failed to load image"))
}
\`\`\`

#### Component Cleanup
\`\`\`typescript
// Clean up state when sheet closes
useEffect(() => {
  if (!open) {
    setSelectedSKUs([])
    setSearchQuery("")
    setError(null)
    setUploadErrors({})
  }
}, [open])
\`\`\`

---

This documentation provides a comprehensive technical reference for the SKU and Order creation features, covering user flows, technical implementation, database interactions, and performance considerations. It serves as both a user guide and developer reference for understanding and maintaining these critical application features.
