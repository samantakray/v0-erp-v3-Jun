 ## Plan Overview

  The objective is to modify the "New Order" form so that adding multiple units of the same SKU results in multiple, distinct rows in the
  "Selected SKUs" table, each with its own configurable dates and remarks. This allows for more granular control over individual items within
  an order.


  The implementation is divided into two phases: a frontend phase to update the UI behavior and a backend phase to adapt the data processing
  logic. My analysis of all relevant files (new-order-sheet.tsx, order-actions.ts, orders/page.tsx, order-detail-sheet.tsx, and
  orders/[orderId]/jobs/page.tsx) confirms that the changes are entirely contained within the first two files. There are no required changes
  for any downstream components, as they are already resilient to the new data structure.


  Overall Risk Level: Minimal
  All initial assumptions have been validated, and all potential downstream impacts have been investigated and cleared. The plan is robust
  and ready for execution.

  ---

  ## Phase 1: Frontend UI and Logic Implementation

  This phase focuses exclusively on the client-side changes within the new-order-sheet.tsx component.


### Step 1.1: Modify `addSKU` to Always Create New Rows


   * Objective: Change the addSKU function to stop incrementing quantity. Every call will now append a new, unique SKU instance to the
     selectedSKUs array with a quantity of 1.
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/components/new-order-sheet.tsx
   * Risk Level: Minimal (Validated)
   * Code Snippet:


    1     const addSKU = (sku) => {
    2       const instanceId = `sku-instance-${Date.now()}-${Math.random()}`;
    3       const newSkuInstance = {
    4         ...sku,
    5         instanceId,
    6         quantity: 1,
    7         size: sku.size || "",
    8         remarks: "",
    9         individualProductionDate: productionDueDate || "",
   10         individualDeliveryDate: deliveryDate || "",
   11       };
   12       setSelectedSKUs((prevSkus) => [...prevSkus, newSkuInstance]);
   13     };



  ### Step 1.2: Refactor the "Bulk Assign" Feature


   * Objective: Modify the parseBulkSkuInput and processBulkSkus functions to create a new row for each individual SKU ID found in the input,
     rather than aggregating them by quantity.
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/components/new-order-sheet.tsx
   * Risk Level: Low (Validated)
   * Code Snippet:


    1     // 1. Change parseBulkSkuInput to return a simple list of IDs
    2     const parseBulkSkuInput = (input: string) => {
    3       if (!input.trim()) return [];
    4       return input.split(",").map((item) => item.trim()).filter(Boolean);
    5     };
    6 
    7     // 2. Change processBulkSkus to iterate and call addSKU for each ID
    8     const processBulkSkus = async () => {
    9       // ... (error handling setup) ...
   10       const parsedSkuIds = parseBulkSkuInput(bulkSkuInput);
   11       const notFoundSkus = [];
   12 
   13       for (const skuId of parsedSkuIds) {
   14         const sku = availableSKUs.find((s) => s.id === skuId);
   15         if (sku) {
   16           // Use the already-modified addSKU function for each instance
   17           addSKU(sku);
   18         } else {
   19           notFoundSkus.push(skuId);
   20         }
   21       }
   22       // ... (handle success/error messages) ...
   23     };


  ### Step 1.3: Update Row Management Functions to Use `instanceId`


   * Objective: Refactor removeSKU, updateSize, updateRemarks, and updateIndividualDate to find and modify rows using the unique instanceId.
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/components/new-order-sheet.tsx
   * Risk Level: Low (Validated - Requires careful implementation but logic is sound)
   * Code Snippet:


    1     const removeSKU = (instanceIdToRemove: string) => {
    2       setSelectedSKUs(selectedSKUs.filter((sku) => sku.instanceId !== instanceIdToRemove));
    3     };
    4 
    5     const updateSize = (instanceIdToUpdate: string, size: string) => {
    6       const updatedSKUs = selectedSKUs.map((sku) =>
    7         sku.instanceId === instanceIdToUpdate ? { ...sku, size: size } : sku
    8       );
    9       setSelectedSKUs(updatedSKUs);
   10     };
   11     // ... (repeat this pattern for updateRemarks and updateIndividualDate) ...



  ### Step 1.4: Adjust the JSX for the Selected SKUs Table


   * Objective: Update the table rendering to use instanceId for React keys, pass instanceId to all handlers, and make the quantity column a
     non-editable field displaying "1".
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/components/new-order-sheet.tsx
   * Risk Level: Low (Validated)
   * Code Snippet:


    1     {selectedSKUs.map((sku) => (
    2       <TableRow key={sku.instanceId}>
    3         {/* ... other cells ... */}
    4         <TableCell className="w-[80px]">
    5           <Input type="number" value={1} disabled />
    6         </TableCell>
    7         {/* ... other cells passing sku.instanceId to handlers ... */}
    8         <TableCell className="w-[80px] text-center">
    9           <Button onClick={() => removeSKU(sku.instanceId)}>
   10             <Trash2 className="h-4 w-4" />
   11           </Button>
   12         </TableCell>
   13       </TableRow>
   14     ))}


  ---

  ## Phase 2: Backend and Data Submission Logic

  ### Step 2.1: Simplify Job Generation in `createOrder` Action


   * Objective: Modify the createOrder action to remove the nested job creation loop. Each incoming order_item will now correspond to exactly
     one job.
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/app/actions/order-actions.ts
   * Risk Level: Low (Validated)
   * Code Snippet:


    1     // In app/actions/order-actions.ts, inside createOrder function
    2 
    3     const orderItems = orderData.skus.map((sku) => ({
    4       //...
    5       quantity: 1, // Hardcode quantity to 1 for each item
    6       //...
    7     }));
    8 
    9     // ... (database insert of orderItems) ...
   10 
   11     // --- SIMPLIFIED JOB GENERATION ---
   12     const jobs: any[] = [];
   13     let seq = 1;
   14 
   15     // The nested loop is GONE. We now create one job per insertedItem.
   16     for (const item of insertedItems) {
   17       const prodDate = item.individual_production_date ?? orderData.productionDate;
   18       const dueDate = item.individual_delivery_date ?? orderData.dueDate;
   19       jobs.push({
   20         job_id: `J${newOrder.order_id.substring(1)}-${seq++}`,
   21         order_id: newOrder.id,
   22         order_item_id: item.id,
   23         sku_id: item.sku_id,
   24         // ... etc.
   25       });
   26     }
   27     // --- END SIMPLIFIED JOB GENERATION ---


  ### Step 2.2: Align the `updateOrder` Action


   * Objective: Ensure the logic for re-inserting order items during an update also sets the quantity of each item to 1, maintaining
     consistency with the create action.
   * File to Change: /Users/Samantak/Documents/Projects/JewelleryERP/v0-erp-v3-Jun/app/actions/order-actions.ts
   * Risk Level: Low (Validated)
   * Guidance: Inside the updateOrder function, find the orderItems constant and ensure its quantity property is hardcoded to 1, identical to
     the change in Step 2.1.Excellent. I will now begin executing the plan, starting with Phase 1: Frontend UI and Logic Implementation.


## Sumary of progress

### step 1.1 complete - Modify addSKU in new-order-sheet.tsx to always create a new row (unique instanceId, quantity 1) for each SKU added, instead of incrementing quantity.
I've updated the addSKU function in  new-order-sheet.tsx to implement the new behavior where each SKU addition creates a new row with a unique instance ID. Here are the key changes:

Removed the quantity increment logic that was checking for existing SKUs
Added a unique instanceId for each SKU using a combination of timestamp and random string
Set quantity to always be 1 for each new row
Maintained all existing SKU properties (size, remarks, dates) while adding the new instanceId
Updated the state update to append the new SKU instance to the existing array
The changes align with the requirements in step 1.1 of the plan, ensuring that:

- Each SKU addition creates a new row
- Each row has a unique instanceId
- The quantity is always set to 1
- The existing SKU properties and date


  ### Step 1.2: Refactored the "Bulk Assign" feature to create a distinct row for every SKU ID parsed from the input.
  ### Step 1.3: Updated all row management functions (removeSKU, updateSize, etc.) to use a unique instanceId to correctly target individual
     rows.
  ### Step 1.4: Adjusted the "Selected SKUs" table UI to use the instanceId for keys and event handlers, and disabled the quantity input to show
     a static "1".
  ### Step 2.1: Simplified the createOrder backend action by removing the nested job-creation loop and hardcoding the quantity of each order item
     to 1.
  ### Step 2.2: Aligned the updateOrder backend action to also set the quantity of all order items to 1, ensuring consistency when editing
     orders.