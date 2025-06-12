# UI Component-Driven Workflows

This document provides a more detailed look into the workflows orchestrated by key UI components in the Jewelry ERP system. These components are central to how users interact with and progress orders and jobs.

## 1. `components/new-order-sheet.tsx`

The `NewOrderSheet` is a slide-over panel used for creating new customer or stock orders.

**Workflow:**

1.  **Initialization:**
    *   Launched when a user clicks a "New Order" button.
    *   Fetches and displays a `predictedNextOrderNumber` using `app/actions/order-actions.ts`.
    *   Initial state is set for form fields (customer type, dates, etc.).

2.  **Customer Information:**
    *   **Order Type:** User selects "Customer" or "Stock".
        *   If "Customer": A customer search/selection input is enabled. Users can select an existing customer or potentially trigger a new customer creation flow.
        *   If "Stock": A default customer might be pre-selected or assigned.
    *   Customer Name and ID are populated based on selection.

3.  **Date Management:**
    *   Global `productionDate` and `deliveryDate` for the order can be set using date pickers.
    *   These dates can be overridden at the individual SKU line item level.

4.  **SKU Management:**
    *   **Adding SKUs:**
        *   **Individual Selection:** Users can search for existing SKUs. Upon selection, the SKU is added as a line item.
        *   **Bulk Assign:** A text input allows users to paste a string like "SKU-001:5, SKU-002:3" to quickly add multiple SKUs with quantities. This is parsed and added as line items.
        *   **New SKU Creation:** A button allows users to open the `NewSKUSheet` to define a new SKU if it doesn't exist. Upon successful creation in `NewSKUSheet`, the new SKU can be added to the current order.
    *   **Line Item Details:** For each SKU added:
        *   Quantity is specified.
        *   Individual `productionDate` and `deliveryDate` can be set, overriding order-level dates.
        *   Remarks specific to that line item can be added.
        *   An image preview of the SKU is shown.
    *   **Removing SKUs:** Line items can be removed.

5.  **Order Remarks:** A general remarks field for the entire order.

6.  **Submission / Saving:**
    *   **Validation:** Form fields are validated (e.g., required fields, valid dates, SKU quantities).
    *   **Save as Draft:**
        *   The order data is compiled.
        *   The `createOrder` server action (from `app/actions/order-actions.ts`) is called with a `status: ORDER_STATUS.DRAFT`.
        *   No jobs are generated for draft orders.
        *   The sheet typically closes, and the orders list is updated.
    *   **Submit Order (e.g., Save as New/Pending):**
        *   The order data is compiled.
        *   The `createOrder` server action is called with an active status (e.g., `ORDER_STATUS.NEW` or `ORDER_STATUS.PENDING`).
        *   If successful, the server action:
            *   Creates the order record in the database.
            *   Generates individual job records for each unit of each SKU in the order (see `05-workflows.md` for job generation details).
            *   Returns a success response.
        *   The sheet typically closes, and relevant lists (orders, jobs) are updated/revalidated.

7.  **Error Handling:**
    *   Displays validation errors inline.
    *   Shows general error messages from server action failures (e.g., "Failed to create order").

## 2. `components/job-detail-sheet.tsx`

The `JobDetailSheet` is a full-screen overlay used to view and manage the progression of a single job through its various manufacturing phases.

**Core Architecture:**

*   **State Management:**
    *   Receives a `job` object as a prop.
    *   `useEffect` hooks are used to:
        *   Reset internal component state when the `job` prop changes.
        *   Fetch auxiliary data needed for specific phases (e.g., `fetchStoneLots`, `fetchDiamondLots`) when the sheet is open and the relevant phase is active or being reviewed.
    *   Local `useState` hooks manage form data for each phase (stone allocations, diamond allocations, manufacturer selection, QC inputs), loading states, error messages, and UI states like dialog visibility.
*   **Phase Navigation:**
    *   A `Stepper` component visually indicates the job's current phase and allows navigation to previously completed phases (for review) or the current active phase.
    *   `Tabs` components are used to switch between the content/forms for each `JOB_PHASE` (`STONE`, `DIAMOND`, `MANUFACTURER`, `QUALITY_CHECK`, `COMPLETE`). The active tab is controlled by the `currentPhase` state, which is initialized from `job.currentPhase`.
*   **Server Actions:** All phase completion actions (e.g., "Complete Stone Selection", "Assign Manufacturer") call the `updateJobPhase` server action from `app/actions/job-actions.ts`, passing the relevant data for that phase.
*   **Sticker Preview:** After successfully completing a phase, a `StickerPreview` dialog is shown with key data for that phase's sticker.

**Workflow by Phase Tab:**

1.  **Initialization & General Display:**
    *   Displays job header information (Job ID, SKU name, image, current status).
    *   Shows summary cards for Job Status, Production Date, and current Manufacturer.
    *   The `Stepper` component is rendered.

2.  **Stone Selection Tab (`JOB_PHASE.STONE`):**
    *   **Data Loading:** If stone lots haven't been loaded, `fetchStoneLots` is called. A loading indicator is shown.
    *   **Form Display:**
        *   If `job.stoneData` exists (job has previous stone allocations), these are pre-populated into `StoneAllocationRow` components.
        *   Users can add new `StoneAllocationRow`s or modify existing ones.
        *   Each row allows selecting a lot number, and stone type/size may auto-fill. Quantity and weight are input.
        *   Available quantities/weights from lots are used for validation.
    *   **Validation:** Input fields (lot selected, quantity > 0, weight > 0, quantity <= available) are validated. Errors are displayed per row.
    *   **Submission:** "Complete Stone Selection" button.
        *   Calls `validateStoneAllocations`.
        *   If valid, calls `updateJobPhase` with stone data.
        *   On success: updates local `jobStatus` and `currentPhase`, shows sticker preview.
        *   On failure: displays an error message.

3.  **Diamond Selection Tab (`JOB_PHASE.DIAMOND`):**
    *   **Data Loading:** `fetchDiamondLots` is called if needed.
    *   **Form Display:** Similar to stone selection, using `DiamondAllocationRow`s. Lot selection auto-fills size, shape, quality. Quantity and weight are input.
    *   **Validation:** Similar to stone validation.
    *   **Submission:** "Complete Diamond Selection" button.
        *   Calls `validateDiamondAllocations`.
        *   If valid, calls `updateJobPhase` with diamond data.
        *   On success: updates local state, shows sticker preview.
        *   On failure: displays error.

4.  **Manufacturer Tab (`JOB_PHASE.MANUFACTURER`):**
    *   **Form Display:**
        *   Lists available manufacturers (currently mock data, could be fetched). Users select one.
        *   Input for "Expected Completion Date".
    *   **Validation:** Manufacturer selected, date provided.
    *   **Submission:** "Assign Manufacturer" button.
        *   Calls `updateJobPhase` with manufacturer ID and date.
        *   On success: updates local state (including `manufacturer` display name), shows sticker preview.
        *   On failure: displays error.

5.  **Quality Check Tab (`JOB_PHASE.QUALITY_CHECK`):**
    *   **Form Display:**
        *   Input for "Measured Weight".
        *   Textarea for "Quality Check Notes".
        *   Expected weight might be displayed based on SKU details.
    *   **Validation:** Measured weight provided.
    *   **Submission:** "Pass QC" and "Fail QC" buttons.
        *   Calls `updateJobPhase` with QC data (weight, notes, passed status).
        *   On success: updates local state, shows sticker preview. If QC failed, `currentPhase` is set back to `MANUFACTURER`.
        *   On failure: displays error.

6.  **Complete Tab (`JOB_PHASE.COMPLETE`):**
    *   **Display:** Shows a summary of data collected in previous phases (stone allocations, diamond allocations, manufacturer info, QC results).
    *   **Submission:** "Mark Job as Complete" button.
        *   Calls `updateJobPhase` indicating job completion.
        *   On success: updates local state, shows sticker preview.
        *   On failure: displays error.

7.  **Image Viewing:** Clicking the SKU image in the header opens a dialog to view a larger version.

## 3. `components/next-task-module.tsx`

This component is designed to guide users by suggesting the next most relevant job for their team to work on.

**Workflow & Logic:**

1.  **Props:** Receives `selectedTeam` (e.g., "stone", "diamond") and a list of `jobs`.
2.  **Task Calculation (`useMemo`):**
    *   A `teamStatusMap` defines which `JOB_STATUS` each team is responsible for processing (e.g., `stone` team processes `JOB_STATUS.BAG_CREATED` jobs).
    *   Filters the input `jobs` list to include only those matching the `selectedTeam`'s target status.
    *   From the filtered list, it reduces the jobs to find the one with the earliest `dueDate`. This is considered the "next task".
3.  **Display:**
    *   If a `nextTask` is found:
        *   Displays job details: image, ID, name, SKU ID.
        *   Shows the job's current status with a color-coded badge (from `PHASE_INFO`).
        *   Displays due date and production date.
        *   Provides a "Process Now" button, which typically calls a handler (`onProcessJob`) to open this job in the `JobDetailSheet`.
    *   If no task is found for the team:
        *   Displays a message like "No pending tasks for your team".

This component helps in prioritizing work and directing users to actionable items within the broader ERP system.
