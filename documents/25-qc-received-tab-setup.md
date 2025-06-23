# QC Received Tab Setup - Extended Inputs Implementation Plan

## Overview
This document outlines the plan to add extended Quality Check inputs to the QC tab in the Job Detail Sheet. The implementation follows the same UI pattern as the Stone and Diamond tabs, using table-based layouts with add/delete functionality for each material type.

## Requirements
Add the following input categories to the QC tab:

### Gold Usage Details
- Gold Description
- Gold Gross Weight (gm)
- Gold Scrap Weight (gm)

### Diamond Usage Details
- Diamond Return Quantity (Pcs)
- Diamond Return Weight (Cts)
- Diamond Loss Quantity (Pcs)
- Diamond Loss Weight (Cts)
- Diamond Break Quantity (Pcs)
- Diamond Break Weight (Cts)

### Colored Stone Usage Details
- Colored Stones Return Quantity (Pcs)
- Colored Stones Return Weight (Cts)
- Colored Stones Loss Quantity (Pcs)
- Colored Stones Loss Weight (Cts)
- Colored Stones Break Quantity (Pcs)
- Colored Stones Break Weight (Cts)

---

## **Part 1: Frontend Implementation (Complete First)**

### **1.1 State Management Updates**
**Location**: `components/job-detail-sheet.tsx` around line 85

**Remove existing extended qcData fields, keep only core QC data**:
```typescript
const [qcData, setQcData] = useState({
  notes: job?.qcData?.notes || "",
  passed: job?.qcData?.passed === undefined ? null : job.qcData.passed,
})
```

**Add new state arrays for each material type**:
```typescript
// Gold Usage State
const [goldUsageDetails, setGoldUsageDetails] = useState([
  { 
    clientId: generateAllocationClientID(), 
    description: "", 
    grossWeight: 0, 
    scrapWeight: 0 
  }
])
const [goldUsageErrors, setGoldUsageErrors] = useState({})

// Diamond Usage State  
const [diamondUsageDetails, setDiamondUsageDetails] = useState([
  { 
    clientId: generateAllocationClientID(), 
    type: "", 
    returnQuantity: 0, 
    returnWeight: 0, 
    lossQuantity: 0, 
    lossWeight: 0, 
    breakQuantity: 0, 
    breakWeight: 0 
  }
])
const [diamondUsageErrors, setDiamondUsageErrors] = useState({})

// Colored Stone Usage State
const [coloredStoneUsageDetails, setColoredStoneUsageDetails] = useState([
  { 
    clientId: generateAllocationClientID(), 
    type: "", 
    returnQuantity: 0, 
    returnWeight: 0, 
    lossQuantity: 0, 
    lossWeight: 0, 
    breakQuantity: 0, 
    breakWeight: 0 
  }
])
const [coloredStoneUsageErrors, setColoredStoneUsageErrors] = useState({})
```

### **1.2 UI Layout Structure**
**Location**: QC Tab content around line 1038

**New Layout Structure (Matching Stone Tab Pattern)**:

```jsx
<TabsContent value={JOB_PHASE.QUALITY_CHECK} className="space-y-4">
  {qcError && (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{qcError}</AlertDescription>
    </Alert>
  )}

  {/* Gold Usage Details Section */}
  <div className="border rounded-lg p-4">
    <h3 className="text-md font-semibold mb-4">Gold Usage Details</h3>
    <div className="grid grid-cols-[0.5fr_3fr_2fr_2fr_0.5fr] gap-4 mb-2 font-medium text-sm">
      <div>No.</div>
      <div>Description</div>
      <div>Gross Weight (gm)</div>
      <div>Scrap Weight (gm)</div>
      <div></div>
    </div>
    {goldUsageDetails.map((usage, index) => (
      <GoldUsageRow
        key={usage.clientId}
        index={index}
        usage={usage}
        onChange={handleGoldUsageChange}
        onDelete={deleteGoldUsageRow}
        isSubmitting={isSubmittingQC}
        validationErrors={goldUsageErrors[index] || {}}
      />
    ))}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={addGoldUsageRow}
      className="mt-4"
      disabled={isSubmittingQC}
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Add Gold Usage Details
    </Button>
    <Separator className="my-4" />
    <div className="flex justify-end gap-8 text-sm font-semibold">
      <div>Total Gross Weight: {totalGoldGrossWeight.toFixed(2)} gm</div>
      <div>Total Scrap Weight: {totalGoldScrapWeight.toFixed(2)} gm</div>
    </div>
  </div>

  {/* Diamond Usage Details Section */}
  <div className="border rounded-lg p-4">
    <h3 className="text-md font-semibold mb-4">Diamond Usage Details</h3>
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm">
      <div>No.</div>
      <div>Type</div>
      <div>Return Qty (Pcs)</div>
      <div>Return Wt (Cts)</div>
      <div>Loss Qty (Pcs)</div>
      <div>Loss Wt (Cts)</div>
      <div>Break Qty (Pcs)</div>
      <div>Break Wt (Cts)</div>
      <div></div>
    </div>
    {diamondUsageDetails.map((usage, index) => (
      <DiamondUsageRow
        key={usage.clientId}
        index={index}
        usage={usage}
        onChange={handleDiamondUsageChange}
        onDelete={deleteDiamondUsageRow}
        isSubmitting={isSubmittingQC}
        validationErrors={diamondUsageErrors[index] || {}}
      />
    ))}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={addDiamondUsageRow}
      className="mt-4"
      disabled={isSubmittingQC}
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Add Diamond Usage Details
    </Button>
    <Separator className="my-4" />
    <div className="flex justify-end gap-8 text-sm font-semibold">
      <div>Return: {totalDiamondReturn.quantity} Pcs, {totalDiamondReturn.weight.toFixed(2)} Cts</div>
      <div>Loss: {totalDiamondLoss.quantity} Pcs, {totalDiamondLoss.weight.toFixed(2)} Cts</div>
      <div>Break: {totalDiamondBreak.quantity} Pcs, {totalDiamondBreak.weight.toFixed(2)} Cts</div>
    </div>
  </div>

  {/* Colored Stone Usage Details Section */}
  <div className="border rounded-lg p-4">
    <h3 className="text-md font-semibold mb-4">Colored Stone Usage Details</h3>
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr] gap-4 mb-2 font-medium text-sm">
      <div>No.</div>
      <div>Type</div>
      <div>Return Qty (Pcs)</div>
      <div>Return Wt (Cts)</div>
      <div>Loss Qty (Pcs)</div>
      <div>Loss Wt (Cts)</div>
      <div>Break Qty (Pcs)</div>
      <div>Break Wt (Cts)</div>
      <div></div>
    </div>
    {coloredStoneUsageDetails.map((usage, index) => (
      <ColoredStoneUsageRow
        key={usage.clientId}
        index={index}
        usage={usage}
        onChange={handleColoredStoneUsageChange}
        onDelete={deleteColoredStoneUsageRow}
        isSubmitting={isSubmittingQC}
        validationErrors={coloredStoneUsageErrors[index] || {}}
      />
    ))}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={addColoredStoneUsageRow}
      className="mt-4"
      disabled={isSubmittingQC}
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Add Colored Stone Usage Details
    </Button>
    <Separator className="my-4" />
    <div className="flex justify-end gap-8 text-sm font-semibold">
      <div>Return: {totalColoredStoneReturn.quantity} Pcs, {totalColoredStoneReturn.weight.toFixed(2)} Cts</div>
      <div>Loss: {totalColoredStoneLoss.quantity} Pcs, {totalColoredStoneLoss.weight.toFixed(2)} Cts</div>
      <div>Break: {totalColoredStoneBreak.quantity} Pcs, {totalColoredStoneBreak.weight.toFixed(2)} Cts</div>
    </div>
  </div>

  {/* Quality Check Notes Section */}
  <div className="space-y-2">
    <Label htmlFor="qcNotes">Quality Check Notes</Label>
    <Textarea
      id="qcNotes"
      value={qcData.notes}
      onChange={(e) => setQcData({ ...qcData, notes: e.target.value })}
      disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
      placeholder="Enter any notes about the quality check..."
    />
  </div>

  {/* Actions */}
  <Separator />
  <div className="flex justify-between">
    <Button
      variant="destructive"
      onClick={() => handleCompleteQC(false)}
      disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
    >
      {isSubmittingQC && qcData.passed === false ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <AlertTriangle className="mr-2 h-4 w-4" />
      )}
      Fail QC
    </Button>
    <Button
      variant="default"
      onClick={() => handleCompleteQC(true)}
      disabled={currentPhase !== JOB_PHASE.QUALITY_CHECK || isSubmittingQC}
    >
      {isSubmittingQC && qcData.passed === true ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      )}
      Pass QC
    </Button>
  </div>
</TabsContent>
```

### **1.3 Component Creation**
**Create new row components similar to existing allocation rows**:

#### **1.3.1 GoldUsageRow Component**
**Location**: `components/gold-usage-row.tsx`

```typescript
interface GoldUsageRowProps {
  index: number
  usage: {
    clientId: string
    description: string
    grossWeight: number
    scrapWeight: number
  }
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [field: string]: string }
}

// Grid layout: grid-cols-[0.5fr_3fr_2fr_2fr_0.5fr]
// Columns: No. | Description | Gross Weight | Scrap Weight | Action
```

#### **1.3.2 DiamondUsageRow Component**
**Location**: `components/diamond-usage-row.tsx`

```typescript
interface DiamondUsageRowProps {
  index: number
  usage: {
    clientId: string
    type: string
    returnQuantity: number
    returnWeight: number
    lossQuantity: number
    lossWeight: number
    breakQuantity: number
    breakWeight: number
  }
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [field: string]: string }
}

// Grid layout: grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr]
// Columns: No. | Type | Return Qty | Return Wt | Loss Qty | Loss Wt | Break Qty | Break Wt | Action
```

#### **1.3.3 ColoredStoneUsageRow Component**
**Location**: `components/colored-stone-usage-row.tsx`

```typescript
interface ColoredStoneUsageRowProps {
  index: number
  usage: {
    clientId: string
    type: string
    returnQuantity: number
    returnWeight: number
    lossQuantity: number
    lossWeight: number
    breakQuantity: number
    breakWeight: number
  }
  onChange: (index: number, field: string, value: any) => void
  onDelete: (index: number) => void
  isSubmitting: boolean
  validationErrors: { [field: string]: string }
}

// Same layout as DiamondUsageRow
```

### **1.4 Handler Functions**
**Location**: `components/job-detail-sheet.tsx`

**Add handler functions similar to stone/diamond allocation handlers**:

```typescript
// Gold Usage Handlers
const addGoldUsageRow = () => {
  setGoldUsageDetails([
    ...goldUsageDetails,
    { 
      clientId: generateAllocationClientID(), 
      description: "", 
      grossWeight: 0, 
      scrapWeight: 0 
    }
  ])
}

const deleteGoldUsageRow = (index: number) => {
  if (goldUsageDetails.length > 1) {
    setGoldUsageDetails(goldUsageDetails.filter((_, i) => i !== index))
    setGoldUsageErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors[index]
      return newErrors
    })
  }
}

const handleGoldUsageChange = (index: number, field: string, value: any) => {
  setGoldUsageDetails((prev) => 
    prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
  )
  // Clear validation errors on change
  setGoldUsageErrors((prev) => ({ 
    ...prev, 
    [index]: { ...prev[index], [field]: "" } 
  }))
}

// Diamond Usage Handlers (similar pattern)
const addDiamondUsageRow = () => { /* Similar implementation */ }
const deleteDiamondUsageRow = (index: number) => { /* Similar implementation */ }
const handleDiamondUsageChange = (index: number, field: string, value: any) => { /* Similar implementation */ }

// Colored Stone Usage Handlers (similar pattern)
const addColoredStoneUsageRow = () => { /* Similar implementation */ }
const deleteColoredStoneUsageRow = (index: number) => { /* Similar implementation */ }
const handleColoredStoneUsageChange = (index: number, field: string, value: any) => { /* Similar implementation */ }
```

### **1.5 Total Calculations**
**Add computed totals using useMemo**:

```typescript
// Gold totals
const totalGoldGrossWeight = useMemo(
  () => goldUsageDetails.reduce((sum, item) => sum + (Number(item.grossWeight) || 0), 0),
  [goldUsageDetails]
)

const totalGoldScrapWeight = useMemo(
  () => goldUsageDetails.reduce((sum, item) => sum + (Number(item.scrapWeight) || 0), 0),
  [goldUsageDetails]
)

// Diamond totals
const totalDiamondReturn = useMemo(() => ({
  quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.returnQuantity) || 0), 0),
  weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.returnWeight) || 0), 0)
}), [diamondUsageDetails])

const totalDiamondLoss = useMemo(() => ({
  quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.lossQuantity) || 0), 0),
  weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.lossWeight) || 0), 0)
}), [diamondUsageDetails])

const totalDiamondBreak = useMemo(() => ({
  quantity: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.breakQuantity) || 0), 0),
  weight: diamondUsageDetails.reduce((sum, item) => sum + (Number(item.breakWeight) || 0), 0)
}), [diamondUsageDetails])

// Colored Stone totals (similar pattern to diamonds)
const totalColoredStoneReturn = useMemo(() => ({ /* Similar implementation */ }), [coloredStoneUsageDetails])
const totalColoredStoneLoss = useMemo(() => ({ /* Similar implementation */ }), [coloredStoneUsageDetails])
const totalColoredStoneBreak = useMemo(() => ({ /* Similar implementation */ }), [coloredStoneUsageDetails])
```

### **1.6 Input Field Specifications**

| Field | Type | Unit | Validation | Step | Placeholder |
|-------|------|------|------------|------|-------------|
| Gold Description | Text | - | Optional | - | "e.g., 18K Yellow Gold" |
| Gold Gross Weight | Number | gm | ≥0 | 0.01 | "0.00" |
| Gold Scrap Weight | Number | gm | ≥0 | 0.01 | "0.00" |
| Diamond/Stone Type | Dropdown | - | Required | - | "Select type" |
| Return Quantity | Number | Pcs | ≥0 | 1 | "0" |
| Return Weight | Number | Cts | ≥0 | 0.01 | "0.00" |
| Loss Quantity | Number | Pcs | ≥0 | 1 | "0" |
| Loss Weight | Number | Cts | ≥0 | 0.01 | "0.00" |
| Break Quantity | Number | Pcs | ≥0 | 1 | "0" |
| Break Weight | Number | Cts | ≥0 | 0.01 | "0.00" |

### **1.7 useEffect Updates**
**Update job data population logic around line 123**:

```typescript
useEffect(() => {
  if (job) {
    // ... existing logic ...
    
    // Pre-populate QC usage details if they exist
    if (job.qcData?.goldUsageDetails && job.qcData.goldUsageDetails.length > 0) {
      setGoldUsageDetails(job.qcData.goldUsageDetails.map((usage) => ({ 
        ...usage, 
        clientId: generateAllocationClientID() 
      })))
    }
    
    if (job.qcData?.diamondUsageDetails && job.qcData.diamondUsageDetails.length > 0) {
      setDiamondUsageDetails(job.qcData.diamondUsageDetails.map((usage) => ({ 
        ...usage, 
        clientId: generateAllocationClientID() 
      })))
    }
    
    if (job.qcData?.coloredStoneUsageDetails && job.qcData.coloredStoneUsageDetails.length > 0) {
      setColoredStoneUsageDetails(job.qcData.coloredStoneUsageDetails.map((usage) => ({ 
        ...usage, 
        clientId: generateAllocationClientID() 
      })))
    }
    
    setQcData({
      notes: job.qcData?.notes || "",
      passed: job.qcData?.passed === undefined ? null : job.qcData.passed,
    })
  }
}, [job])
```

### **1.8 Frontend Validation**
**Add validation functions similar to stone/diamond validation**:

```typescript
const validateQCUsageDetails = () => {
  const errors = {}
  let isValid = true
  
  // Validate gold usage details
  goldUsageDetails.forEach((usage, index) => {
    const rowErrors = {}
    if (Number(usage.grossWeight) < 0) {
      rowErrors.grossWeight = "Gross weight must be ≥ 0"
      isValid = false
    }
    if (Number(usage.scrapWeight) < 0) {
      rowErrors.scrapWeight = "Scrap weight must be ≥ 0"
      isValid = false
    }
    if (Object.keys(rowErrors).length > 0) errors[`gold_${index}`] = rowErrors
  })
  
  // Similar validation for diamond and colored stone usage details
  
  return { isValid, errors }
}
```

---

## **Part 2: Backend Integration (After Frontend)**

### **2.1 Database Schema Updates**
**Location**: `database/schema.sql` - jobs table qc_data JSONB field

**Extended qc_data structure**:
```json
{
  "notes": "Quality check completed successfully",
  "passed": true,
  "goldUsageDetails": [
    {
      "description": "18K Yellow Gold",
      "grossWeight": 15.5,
      "scrapWeight": 0.3
    }
  ],
  "diamondUsageDetails": [
    {
      "type": "Round Brilliant",
      "returnQuantity": 2,
      "returnWeight": 0.15,
      "lossQuantity": 0,
      "lossWeight": 0,
      "breakQuantity": 1,
      "breakWeight": 0.05
    }
  ],
  "coloredStoneUsageDetails": [
    {
      "type": "Emerald",
      "returnQuantity": 5,
      "returnWeight": 2.3,
      "lossQuantity": 0,
      "lossWeight": 0,
      "breakQuantity": 0,
      "breakWeight": 0
    }
  ]
}
```

### **2.2 Type Definitions Update**
**Location**: `types/index.ts`

**Extended QC interfaces**:
```typescript
export interface GoldUsageDetail {
  description: string
  grossWeight: number
  scrapWeight: number
}

export interface DiamondUsageDetail {
  type: string
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}

export interface ColoredStoneUsageDetail {
  type: string
  returnQuantity: number
  returnWeight: number
  lossQuantity: number
  lossWeight: number
  breakQuantity: number
  breakWeight: number
}

export interface QCData {
  notes: string
  passed: boolean | null
  goldUsageDetails?: GoldUsageDetail[]
  diamondUsageDetails?: DiamondUsageDetail[]
  coloredStoneUsageDetails?: ColoredStoneUsageDetail[]
}
```

### **2.3 Server Action Updates**
**Location**: `app/actions/job-actions.ts` - `updateJobPhase` function

**Update handleCompleteQC function**:
```typescript
const handleCompleteQC = async (passed: boolean) => {
  // ... existing validation ...
  
  const qcDataPayload = {
    notes: qcData.notes || "",
    passed: passed,
    goldUsageDetails: goldUsageDetails.map(({ clientId, ...rest }) => rest),
    diamondUsageDetails: diamondUsageDetails.map(({ clientId, ...rest }) => rest),
    coloredStoneUsageDetails: coloredStoneUsageDetails.map(({ clientId, ...rest }) => rest),
  }
  
  const result = await updateJobPhase(job!.id, JOB_PHASE.QUALITY_CHECK, qcDataPayload)
  // ... rest of function ...
}
```

---

## **Part 3: Additional Enhancements (Optional/Future)**

### **3.1 Complete Tab Display Updates**
Update the Complete tab to show the new QC usage details in the summary.

### **3.2 Validation Enhancements**
- Add business logic validation (e.g., return + loss + break ≤ original allocation)
- Cross-field validation between different material types
- Warning messages for unusual values or high loss rates

### **3.3 Data Analytics**
- Calculate material utilization efficiency
- Loss/break rate calculations and reporting
- Cost impact analysis based on material usage

### **3.4 Export/Reporting**
- Include new fields in job reports
- Material usage reports with breakdowns
- QC statistics dashboard with trends

---

## **Implementation Priority**

1. **Phase 1** (Frontend): Complete UI implementation with table layouts and mock data
2. **Phase 2** (Backend): Database schema updates and API integration
3. **Phase 3** (Enhancement): Advanced validation, analytics, and reporting

## **Files to Create/Modify**

### **New Files**
- `components/gold-usage-row.tsx`
- `components/diamond-usage-row.tsx` 
- `components/colored-stone-usage-row.tsx`

### **Modified Files**
- `components/job-detail-sheet.tsx` (main implementation)
- `types/index.ts` (type definitions)
- `app/actions/job-actions.ts` (backend integration)
- `database/schema.sql` (documentation update)

This phased approach ensures a consistent user experience matching the existing Stone and Diamond tabs while providing comprehensive material tracking capabilities for quality control processes. 