# SKU ID Generation System Documentation

This document provides a comprehensive overview of the SKU ID generation system implemented in the Jewelry ERP application, including recent changes, bug fixes, and implementation details.

## Overview

The SKU ID generation system creates unique identifiers for jewelry items based on their category, sequential number, and other attributes. The system was refactored to consolidate category mappings and improve code maintainability.

## Files Modified

1. `constants/categories.ts` - Added helper function for category code lookup
2. `components/new-sku-sheet.tsx` - Updated to use centralized category codes
3. `lib/api-service.ts` - Fixed SKU data mapping to include size field
4. `app/skus/page.tsx` - Enhanced size field display in the DataTable

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

## Bugs and Solutions

### Bug 1: Category Code Duplication

**Issue**: Category codes were defined in two places, creating maintenance issues and potential inconsistencies.

**Solution**: Consolidated category codes into `constants/categories.ts` and created a helper function to convert between string categories and their codes.

### Bug 2: Size Field Not Displaying

**Issue**: The size field was not showing up in the DataTable on the SKUs page.

**Root Cause**: The `fetchSkus` function in `api-service.ts` was not including the size field in the returned SKU objects.

**Solution**: Updated the `fetchSkus` function to include the size field and properly convert it to a number. Enhanced the DataTable column rendering to display the size with appropriate units.

## Best Practices

1. **Single Source of Truth**: Keep all category-related constants and mappings in one place (`constants/categories.ts`).

2. **Type Safety**: Use TypeScript types to ensure consistency and catch errors at compile time.

3. **Helper Functions**: Create helper functions for common operations like converting between string values and their coded representations.

4. **Data Transformation**: Ensure proper data transformation when fetching from the database, especially for numeric fields.

5. **UI Enhancement**: Display units alongside numeric values for better user experience.

## Future Improvements

1. Consider implementing a more robust SKU generation system that can handle additional attributes.

2. Add validation to ensure SKU IDs are unique across the system.

3. Implement a history tracking system for SKU changes.

4. Add the ability to customize the SKU ID format based on business requirements.
