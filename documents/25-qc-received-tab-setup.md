# QC Received Tab Setup - Extended Inputs Implementation Plan

## Overview
This document outlines the plan to add extended Quality Check inputs to the QC tab in the Job Detail Sheet. The implementation follows the same UI pattern as the Stone and Diamond tabs, using table-based layouts with add/delete functionality for each material type.

## Requirements ✅ COMPLETED
Add the following input categories to the QC tab:

### Gold Usage Details ✅ IMPLEMENTED
- **Gold Type** (dropdown from `GOLD_TYPE` constants) - *Updated from "Gold Description"*
- Gold Gross Weight (gm)
- Gold Scrap Weight (gm)

### Diamond Usage Details ✅ IMPLEMENTED  
- **Diamond Lot** (dropdown from database `diamond_lots` table) - *Updated from "Diamond Type"*
- Diamond Return Quantity (Pcs)
- Diamond Return Weight (Cts)
- Diamond Loss Quantity (Pcs)
- Diamond Loss Weight (Cts)
- Diamond Break Quantity (Pcs)
- Diamond Break Weight (Cts)

### Colored Stone Usage Details ✅ IMPLEMENTED
- **Stone Lot** (dropdown from database `stone_lots` table) - *Updated from "Colored Stone Type"*
- Colored Stones Return Quantity (Pcs)
- Colored Stones Return Weight (Cts)
- Colored Stones Loss Quantity (Pcs)
- Colored Stones Loss Weight (Cts)
- Colored Stones Break Quantity (Pcs)
- Colored Stones Break Weight (Cts)

### Additional Improvements Made ✅ IMPLEMENTED
- **Tab renamed** from "QC" to "QC + Received"
- **Database-driven dropdowns** instead of hardcoded options
- **Real-time calculations** for all material usage totals
- **Consistent UI patterns** matching Stone and Diamond tabs

---

## **Part 1: Frontend Implementation ✅ COMPLETED**

### **1.1 State Management Updates ✅ IMPLEMENTED**
**Location**: `components/job-detail-sheet.tsx` around line 85

**✅ IMPLEMENTED**: Core QC data state with extended usage details arrays:
- Gold usage details state with clientId tracking
- Diamond usage details state with clientId tracking  
- Colored stone usage details state with clientId tracking
- Error state management for all three material types
- Proper initialization with default empty rows

### **1.2 UI Layout Structure ✅ IMPLEMENTED**
**Location**: QC Tab content around line 1200+

**✅ IMPLEMENTED**: Complete table-based layout structure:
- Three bordered sections for Gold, Diamond, and Colored Stone usage
- Grid-based column layouts matching Stone/Diamond tab patterns
- Real-time totals display for each material type
- Add buttons for each material category
- Quality Check notes section
- Pass/Fail QC action buttons

### **1.3 Component Creation ✅ IMPLEMENTED**

#### **1.3.1 GoldUsageRow Component ✅ IMPLEMENTED**
**Location**: `components/gold-usage-row.tsx`

**✅ IMPLEMENTED**: 
- Grid layout: `grid-cols-[0.5fr_3fr_2fr_2fr_0.5fr]`
- Columns: No. | **Gold Type (Dropdown)** | Gross Weight | Scrap Weight | Action
- **Database-driven dropdown** using `GOLD_TYPE` constants from categories
- Proper validation error display framework

#### **1.3.2 DiamondUsageRow Component ✅ IMPLEMENTED**
**Location**: `components/diamond-usage-row.tsx`

**✅ IMPLEMENTED**:
- Grid layout: `grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.5fr]`
- Columns: No. | **Diamond Lot (Dropdown)** | Return Qty | Return Wt | Loss Qty | Loss Wt | Break Qty | Break Wt | Action
- **Database-driven dropdown** using actual diamond lots from `diamond_lots` table
- Dynamic loading when QC phase is accessed

#### **1.3.3 ColoredStoneUsageRow Component ✅ IMPLEMENTED**
**Location**: `components/colored-stone-usage-row.tsx`

**✅ IMPLEMENTED**:
- Same grid layout as DiamondUsageRow
- Columns: No. | **Stone Lot (Dropdown)** | Return Qty | Return Wt | Loss Qty | Loss Wt | Break Qty | Break Wt | Action
- **Database-driven dropdown** using actual stone lots from `stone_lots` table
- Dynamic loading when QC phase is accessed

### **1.4 Handler Functions ✅ IMPLEMENTED**
**Location**: `components/job-detail-sheet.tsx`

**✅ IMPLEMENTED**: Complete handler functions for all three material types:
- Add row handlers with clientId generation
- Delete row handlers with error cleanup
- Change handlers with real-time validation error clearing
- Proper state management following existing patterns

### **1.5 Total Calculations ✅ IMPLEMENTED**
**✅ IMPLEMENTED**: Real-time computed totals using useMemo:

- **Gold totals**: Total Gross Weight, Total Scrap Weight
- **Diamond totals**: Return/Loss/Break quantities and weights
- **Colored Stone totals**: Return/Loss/Break quantities and weights
- All totals update automatically as users input data

### **1.6 Input Field Specifications ✅ IMPLEMENTED**

| Field | Type | Unit | Validation | Step | Placeholder | Status |
|-------|------|------|------------|------|-------------|---------|
| **Gold Type** | **Dropdown** | - | **From GOLD_TYPE constants** | - | "Select gold type" | **✅ IMPLEMENTED** |
| Gold Gross Weight | Number | gm | ≥0 | 0.01 | "0.00" | ✅ IMPLEMENTED |
| Gold Scrap Weight | Number | gm | ≥0 | 0.01 | "0.00" | ✅ IMPLEMENTED |
| **Diamond Lot** | **Dropdown** | - | **From diamond_lots table** | - | "Select lot" | **✅ IMPLEMENTED** |
| **Stone Lot** | **Dropdown** | - | **From stone_lots table** | - | "Select lot" | **✅ IMPLEMENTED** |
| Return Quantity | Number | Pcs | ≥0 | 1 | "0" | ✅ IMPLEMENTED |
| Return Weight | Number | Cts | ≥0 | 0.01 | "0.00" | ✅ IMPLEMENTED |
| Loss Quantity | Number | Pcs | ≥0 | 1 | "0" | ✅ IMPLEMENTED |
| Loss Weight | Number | Cts | ≥0 | 0.01 | "0.00" | ✅ IMPLEMENTED |
| Break Quantity | Number | Pcs | ≥0 | 1 | "0" | ✅ IMPLEMENTED |
| Break Weight | Number | Cts | ≥0 | 0.01 | "0.00" | ✅ IMPLEMENTED |

### **1.7 useEffect Updates ✅ IMPLEMENTED**
**✅ IMPLEMENTED**: Job data population logic for pre-populating QC usage details when job data exists (ready for backend integration).

### **1.8 Frontend Validation ✅ IMPLEMENTED**
**✅ IMPLEMENTED**: Validation error framework in place for all components, ready for backend validation integration.

### **1.9 Database Integration Setup ✅ IMPLEMENTED**
**✅ IMPLEMENTED**: 
- Diamond lots loading updated to include QC phase
- Stone lots loading updated to include QC phase  
- Dropdown components receive and use actual database data
- Proper lot data filtering and validation

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
      "type": "B+2",
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
      "type": "SLOT-001",
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

1. **✅ Phase 1** (Frontend): ~~Complete UI implementation with table layouts and mock data~~ **COMPLETED**
2. **🔄 Phase 2** (Backend): Database schema updates and API integration **CURRENT PRIORITY**
3. **⏳ Phase 3** (Enhancement): Advanced validation, analytics, and reporting **FUTURE**

## **Files Created/Modified**

### **✅ New Files Created**
- `components/gold-usage-row.tsx` ✅ COMPLETED
- `components/diamond-usage-row.tsx` ✅ COMPLETED
- `components/colored-stone-usage-row.tsx` ✅ COMPLETED

### **✅ Modified Files**
- `components/job-detail-sheet.tsx` (main implementation) ✅ COMPLETED
- `types/index.ts` (type definitions) - **PENDING FOR PART 2**
- `app/actions/job-actions.ts` (backend integration) - **PENDING FOR PART 2**
- `database/schema.sql` (documentation update) - **PENDING FOR PART 2**

## **Summary**
Part 1 (Frontend Implementation) is **100% COMPLETE** and fully functional with database-driven dropdowns, real-time calculations, and consistent UI patterns. The QC tab now provides comprehensive material tracking capabilities matching the existing Stone and Diamond tabs.

**Next Phase**: Part 2 (Backend Integration) to persist the usage details data to the database and enable full end-to-end functionality. 