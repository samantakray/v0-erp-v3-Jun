# 26-sku-dropdown-keyboard-selection-plan.md

## Problem Statement

The `Select` dropdown components within the `NewSKUSheet` (specifically in the `SkuTableRow` component) do not allow for keyboard navigation (using arrow keys and Enter to select options).

## Iterative Debugging & Learnings

Our debugging process revealed the following:

1.  **Initial Hypothesis (Incorrect):** It was initially assumed that the issue stemmed from functions and objects (like `generateSkuIdPreview`, `getSizeConstraints`, `handleImageChange`, `handleImageError`, `groupedStoneTypes`) being recreated on every render of the parent `NewSKUSheet` component. This would cause `React.memo` on `SkuTableRow` to fail, leading to unnecessary re-renders of the child component and loss of focus.

2.  **First Attempted Fix:** We implemented `React.useCallback` for functions and `React.useMemo` for objects to stabilize their references.

3.  **Result & New Insight (from "Why Did You Update?" logs):** Despite the first fix, the `SkuTableRow` components were still re-rendering. The "Why Did You Update?" logs (specifically `[SkuTableRow index X] re-rendered because of changed props: {sku: {...}}`) clearly showed that the `sku` prop itself was causing the re-renders.

4.  **Root Cause Identified:**
    *   `React.memo` performs a **shallow comparison** of props.
    *   When any property *within* the `sku` object was updated (e.g., `sku.category` or `sku.goldType`), the `setMultipleSkus` state update created a **new `sku` object reference** for that specific row.
    *   Even though the *contents* of the `sku` object might have only changed slightly, the *reference* to the `sku` object itself was new.
    *   `React.memo` saw this new `sku` object reference as a changed prop, thus triggering a re-render of the `SkuTableRow`, causing the loss of focus and breaking keyboard navigation.

## Revised Plan: Stabilize Props by Passing Individual Properties

To definitively fix the re-rendering issue and enable proper keyboard navigation, we must ensure that `React.memo` receives props that are truly stable. This means passing individual primitive properties (strings, numbers, booleans) directly, rather than a single object whose reference changes frequently.

### Step 1: Modify `SkuTableRow` to Accept Individual `sku` Properties

*   **Objective:** Change the `SkuTableRow` component's prop signature to accept individual properties of the `sku` object (e.g., `category`, `goldType`, `size`, `collection`, `imageUrl`, `imageFile`, `clientId`) instead of the entire `sku` object. This allows `React.memo` to perform shallow comparisons on these stable primitive values.
*   **File to be Changed:** `components/new-sku-sheet.tsx`
*   **Assumptions:** All necessary properties of `sku` are explicitly passed.
*   **Risk Level:** Low. This is a refactoring of prop passing, directly addressing the re-render issue.
*   **Code Snippet:**

    **Current `SkuTableRow` signature (causing the re-renders):**
    ```typescript
    const SkuTableRow = React.memo(function SkuTableRow(props) {
      const {
        sku, // This is the problematic prop
        index,
        multipleSkusLength,
        handleSkuChange,
        removeSku,
        generateSkuIdPreview,
        getSizeConstraints,
        handleImageChange,
        handleImageError,
        uploadError,
        groupedStoneTypes
      } = props;
      // ... component uses sku.category, sku.goldType, etc.
    });
    ```

    **Proposed New `SkuTableRow` signature (the fix):**
    ```typescript
    const SkuTableRow = React.memo(function SkuTableRow(props) {
      const {
        // Destructure individual properties from props directly
        clientId, // Keep clientId for key
        category,
        goldType,
        size,
        collection,
        imageUrl,
        imageFile,
        // ... and any other properties SkuTableRow directly uses from 'sku'

        index,
        multipleSkusLength,
        handleSkuChange,
        removeSku,
        generateSkuIdPreview,
        getSizeConstraints,
        handleImageChange,
        handleImageError,
        uploadError,
        groupedStoneTypes
      } = props;

      // Now, inside the component, use 'category' instead of 'sku.category', etc.
      // Example:
      // const { min, max, step, unit } = getSizeConstraints(category);
      // const skuIdPreview = generateSkuIdPreview(category);
      // <Select value={category} ... />
    });
    ```

### Step 2: Modify `NewSKUSheet` to Pass Individual `sku` Properties

*   **Objective:** Update the `multipleSkus.map()` call in `NewSKUSheet` to pass each relevant property of the `sku` object as a separate prop to `SkuTableRow`.
*   **File to be Changed:** `components/new-sku-sheet.tsx`
*   **Assumptions:** All properties used by `SkuTableRow` are correctly identified and passed.
*   **Risk Level:** Low. This is the other side of the prop refactoring.
*   **Code Snippet:**

    **Current `NewSKUSheet` map call:**
    ```tsx
    <SkuTableRow
      key={sku.clientId}
      sku={sku} // This needs to be broken down
      index={index}
      multipleSkusLength={multipleSkus.length}
      handleSkuChange={handleSkuChange}
      removeSku={removeSku}
      generateSkuIdPreview={generateSkuIdPreview}
      getSizeConstraints={getSizeConstraints}
      handleImageChange={handleImageChange}
      handleImageError={handleImageError}
      uploadError={uploadErrors[index]}
      groupedStoneTypes={groupedStoneTypes}
    />
    ```

    **Proposed New `NewSKUSheet` map call:**
    ```tsx
    <SkuTableRow
      key={sku.clientId}
      // Pass individual properties instead of the whole sku object
      clientId={sku.clientId} // Pass clientId explicitly
      category={sku.category}
      goldType={sku.goldType}
      size={sku.size}
      collection={sku.collection}
      imageUrl={sku.imageUrl}
      imageFile={sku.imageFile}
      // ... and any other properties SkuTableRow directly uses from 'sku'

      index={index}
      multipleSkusLength={multipleSkus.length}
      handleSkuChange={handleSkuChange}
      removeSku={removeSku}
      generateSkuIdPreview={generateSkuIdPreview}
      getSizeConstraints={getSizeConstraints}
      handleImageChange={handleImageChange}
      handleImageError={handleImageError}
      uploadError={uploadErrors[index]}
      groupedStoneTypes={groupedStoneTypes}
    />
    ```

### Step 3 (Optional but Recommended): Remove Debugging Logs

*   **Objective:** Once the fix is confirmed, remove the `console.log` statements added for debugging purposes to clean up the code and prevent unnecessary console output in production.
*   **File to be Changed:** `components/new-sku-sheet.tsx`
*   **Risk Level:** Very Low.
*   **Code Snippet:** Remove all `console.log` and `console.warn` statements related to re-rendering and focus.
