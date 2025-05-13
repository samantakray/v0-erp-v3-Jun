# SKU ID Generation System Documentation

This document provides a comprehensive overview of the SKU ID generation system implemented in the Jewelry ERP application, including recent changes, bug fixes, and implementation details.

## Overview

The SKU ID generation system creates unique identifiers for jewelry items based on their category, sequential number, and other attributes. The system was refactored to consolidate category mappings and improve code maintainability. Recently, it was further enhanced to address sequence number consumption issues.

## Files Modified

1. `constants/categories.ts` - Added helper function for category code lookup
2. `components/new-sku-sheet.tsx` - Updated to use centralized category codes and improved sequence number handling
3. `lib/api-service.ts` - Fixed SKU data mapping to include size field
4. `app/skus/page.tsx` - Enhanced size field display in the DataTable
5. `app/actions/sku-sequence-actions.ts` - Added prediction functionality and enhanced logging

## Implementation Details

### 1. Category Code Mapping Consolidation

#### Previous Implementation

Previously, category codes were defined in two separate places:

1. In `constants/categories.ts` as `CATEGORY_CODES`:
   \`\`\`typescript
   export const CATEGORY_CODES: Record<SkuCategory, string> = {
     [SKU_CATEGORY.NECKLACE]: "NK",
     [SKU_CATEGORY.BANGLE]: "BN",
     [SKU_CATEGORY.RING]: "RG",
     // ...other mappings
   }
   \`\`\`

2. In `components/new-sku-sheet.tsx` as `CATEGORY_PREFIX`:
   \`\`\`typescript
   const CATEGORY_PREFIX = {
     Ring: "RG",
     Bangle: "BN",
     Bracelet: "BR",
     // ...other mappings
   }
   \`\`\`

This duplication created a maintenance issue and potential for inconsistencies.

#### Current Implementation

We consolidated the mappings by:

1. Keeping only the `CATEGORY_CODES` in `constants/categories.ts`
2. Adding a helper function to convert string category names to codes:
   \`\`\`typescript
   export function getCategoryCode(categoryName: string): string {
     // Direct lookup for exact matches
     for (const [key, value] of Object.entries(SKU_CATEGORY)) {
       if (value === categoryName) {
         return CATEGORY_CODES[value]
       }
     }
     
     // Default fallback
     return "OO"
   }
   \`\`\`
3. Removing `CATEGORY_PREFIX` from `new-sku-sheet.tsx` and using the helper function instead:
   \`\`\`typescript
   // Generate SKU ID preview based on category and sequential number
   const generateSkuIdPreview = (category) => {
     if (!formattedNumber) return "Generating..."
     // Use the helper function from constants/categories.ts
     const prefix = getCategoryCode(category) || "OO" // Default to "OO" if category not found
     return `${prefix}-${formattedNumber}`
   }
   \`\`\`

### 2. SKU Size Field Display Fix

#### Issue

The size field was not displaying correctly in the SKUs DataTable, showing only "-" even when size values existed.

#### Root Cause

1. The `fetchSkus` function in `api-service.ts` was not including the `size` field when mapping database results to the frontend SKU model.
2. The size field was not being properly converted to a number.
3. The DataTable column rendering didn't handle the size units correctly.

#### Solution

1. Updated `fetchSkus` in `api-service.ts` to include all necessary fields:
   \`\`\`typescript
   const skus = data.map((sku) => ({
     id: sku.sku_id,
     name: sku.name,
     category: sku.category,
     collection: sku.collection,
     size: sku.size !== null && sku.size !== undefined ? Number(sku.size) : null,
     goldType: sku.gold_type,
     stoneType: sku.stone_type,
     diamondType: sku.diamond_type,
     weight: sku.weight,
     image: sku.image_url,
     createdAt: sku.created_at,
   }))
   \`\`\`

2. Enhanced the size column rendering in `app/skus/page.tsx` to display units:
   \`\`\`typescript
   {
     header: "Size",
     accessor: "size",
     render: (sku) => {
       // Get the unit for this category
       const unit = SIZE_UNITS[sku.category] || ""

       // Display size with unit if available
       if (sku.size !== undefined && sku.size !== null) {
         return (
           <span>
             {sku.size}
             {unit && ` ${unit}`}
           </span>
         )
       }

       return <span className="text-muted-foreground">-</span>
     },
   }
   \`\`\`

### 3. Sequence Number Consumption Issue

#### Previous Implementation

In the previous implementation, the SKU ID generation process worked as follows:

1. When the new-sku-sheet opened, `getNextSkuNumber()` was called immediately
2. This called the Supabase RPC function `get_next_sku_sequence_value` which incremented the sequence
3. The sequence number was consumed even if the user closed the form without creating SKUs
4. This created gaps in the sequence (e.g., 111, 112, 113) when forms were abandoned

The technical limitation was that PostgreSQL sequences don't have a mechanism to "return" or "recycle" a value once it's been retrieved with `nextval()`.

#### Root Cause Analysis

The issue stemmed from how database sequences work in combination with our application flow:

1. **Immediate Sequence Consumption**: When `getNextSkuNumber()` was called, it executed the Supabase RPC function `get_next_sku_sequence_value`, which used PostgreSQL's `nextval()` function. Once `nextval()` is called, the sequence value is consumed permanently - this is by design in PostgreSQL.

2. **Early Sequence Retrieval**: Our application called `getNextSkuNumber()` immediately when the form opened in the `useEffect` hook, rather than when the user actually submitted the form.

3. **No Sequence Recycling**: PostgreSQL sequences don't have a built-in mechanism to "return" or "recycle" a value once it's been retrieved with `nextval()`.

#### Current Implementation

To address this issue, we implemented a prediction-based approach:

1. When the new-sku-sheet opens, `getPredictedNextSkuNumber()` is called instead
2. This function fetches the most recent SKU from the database and predicts the next number
3. The prediction is used for display purposes only
4. `getNextSkuNumber()` is only called when the user clicks "Create SKU"
5. This ensures sequence numbers are only consumed when SKUs are actually created

#### Prediction Algorithm

1. Fetch the most recent SKU from the database
2. Extract the numerical part from its SKU ID
3. Increment by 1 to predict the next number
4. Format with leading zeros
5. Handle edge cases (no SKUs, invalid format)

\`\`\`typescript
export async function getPredictedNextSkuNumber() {
  // Create Supabase client with service role key for server actions
  const supabase = createServiceClient()

  try {
    // Fetch the most recent SKU from Supabase
    const { data, error } = await supabase
      .from("skus")
      .select("sku_id")
      .order("created_at", { ascending: false })
      .limit(1)

    // If no SKUs exist, return a default starting number
    if (!data || data.length === 0) {
      return { 
        success: true, 
        predictedNumber: 1,
        formattedNumber: "0001" 
      }
    }

    // Extract the numerical part (assuming format XX-####)
    const latestSkuId = data[0].sku_id
    const match = latestSkuId.match(/-(\d+)$/)

    if (!match) {
      return { 
        success: true, 
        predictedNumber: 1,
        formattedNumber: "0001" 
      }
    }

    // Increment by 1
    const currentNum = parseInt(match[1], 10)
    const nextNum = currentNum + 1

    return {
      success: true,
      predictedNumber: nextNum,
      formattedNumber: String(nextNum).padStart(4, "0"),
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred", predictedNumber: null }
  }
}
\`\`\`

#### Benefits of the New Approach

1. **Sequence Integrity**: Eliminates gaps in the sequence caused by abandoned forms
2. **Resource Efficiency**: Reduces unnecessary database calls when forms are opened but not submitted
3. **Minimal UI Changes**: Maintains the existing user experience with minimal visual changes
4. **Predictability**: Users still see meaningful SKU ID previews in the form

#### Edge Cases Handled

1. **First-Time Use**: If there are no SKUs in the database, defaults to "0001"
2. **Invalid SKU Format**: If the latest SKU ID doesn't match the expected format, defaults to "0001"
3. **Race Conditions**: If multiple users create SKUs simultaneously, each gets the correct next sequence number

## Database Schema

The SKU ID generation relies on the following database schema elements:

1. The `skus` table with fields:
   - `id` (UUID, primary key)
   - `sku_id` (TEXT, unique) - The generated SKU identifier
   - `name` (TEXT)
   - `category` (TEXT)
   - `collection` (TEXT, nullable)
   - `size` (NUMERIC, nullable)
   - `gold_type` (TEXT)
   - `stone_type` (TEXT)
   - `diamond_type` (TEXT, nullable)
   - `weight` (NUMERIC, nullable)
   - `image_url` (TEXT, nullable)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. A sequence function for generating sequential numbers:
   \`\`\`sql
   CREATE OR REPLACE FUNCTION get_next_sku_sequence_value()
   RETURNS INTEGER AS $$
   DECLARE
     next_val INTEGER;
   BEGIN
     SELECT nextval('sku_sequence') INTO next_val;
     RETURN next_val;
   END;
   $$ LANGUAGE plpgsql;
   \`\`\`

## SKU ID Format

The SKU ID follows this format: `XX-NNNN`

Where:
- `XX` is the category code (e.g., "NK" for Necklace, "RG" for Ring)
- `NNNN` is a sequential number padded to 4 digits

Examples:
- `NK-0001` - First Necklace
- `RG-0042` - 42nd Ring

## User Experience

### Previous User Experience
1. User clicks the 'NEW SKU' button on the app/skus page
2. The form opens the new-sku-sheet component
3. At that moment, the system calls `getNextSkuNumber()` which triggers the backend sequence function and consumes a sequence number
4. The user can add multiple SKU variants to the form
5. If the user closes the form without creating SKUs, the sequence number is wasted
6. If the user creates SKUs, they're created with the pre-consumed sequence number

### Current User Experience
1. User clicks the 'NEW SKU' button on the app/skus page
2. The form opens the new-sku-sheet component
3. The system predicts the next sequence number based on existing SKUs
4. The predicted number is displayed in the form with an indicator
5. The user can add multiple SKU variants to the form
6. When the user clicks "Create SKU":
   - The system gets the actual next sequence number
   - SKUs are created with the actual number
   - The form closes and the new SKUs appear on the app/skus page

## Bugs and Solutions

### Bug 1: Category Code Duplication

**Issue**: Category codes were defined in two places, creating maintenance issues and potential inconsistencies.

**Solution**: Consolidated category codes into `constants/categories.ts` and created a helper function to convert between string categories and their codes.

### Bug 2: Size Field Not Displaying

**Issue**: The size field was not showing up in the DataTable on the SKUs page.

**Root Cause**: The `fetchSkus` function in `api-service.ts` was not including the size field in the returned SKU objects.

**Solution**: Updated the `fetchSkus` function to include the size field and properly convert it to a number. Enhanced the DataTable column rendering to display the size with appropriate units.

### Bug 3: Sequence Number Consumption

**Issue**: Opening and closing the new-sku-sheet without creating SKUs consumed sequence numbers, creating gaps in the sequence.

**Root Cause**: The application called `getNextSkuNumber()` immediately when the form opened, consuming a sequence number even if no SKUs were created.

**Solution**: Implemented a prediction-based approach that only consumes sequence numbers when SKUs are actually created.

## Best Practices

1. **Single Source of Truth**: Keep all category-related constants and mappings in one place (`constants/categories.ts`).

2. **Type Safety**: Use TypeScript types to ensure consistency and catch errors at compile time.

3. **Helper Functions**: Create helper functions for common operations like converting between string values and their coded representations.

4. **Data Transformation**: Ensure proper data transformation when fetching from the database, especially for numeric fields.

5. **UI Enhancement**: Display units alongside numeric values for better user experience.

6. **Resource Efficiency**: Only consume database resources (like sequence numbers) when necessary.

7. **Predictive UI**: Use predictions to provide a good user experience without consuming resources unnecessarily.

## Future Improvements

1. Consider implementing a more robust SKU generation system that can handle additional attributes.

2. Add validation to ensure SKU IDs are unique across the system.

3. Implement a history tracking system for SKU changes.

4. Add the ability to customize the SKU ID format based on business requirements.

5. Consider implementing a reservation system for high-concurrency environments where prediction might not be sufficient.
