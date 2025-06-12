# 15. Job Processing Components

This document details the functionality and interaction of key React components involved in the job processing workflow within the Jewellery ERP system. These components enable users to manage jobs through various production phases, from material allocation to quality control and completion.

## Summary of Component Interactions

The job processing workflow is primarily managed through the **`JobDetailSheet`**, which acts as a central hub for a single job. Users might identify which job to work on next using the **`NextTaskModule`**, which highlights urgent tasks for specific teams.

Once a job is selected (often leading to the `JobDetailSheet` being displayed):

1.  The **`JobDetailSheet`** presents the job's current status and allows navigation through its production phases (Stone Selection, Diamond Selection, Manufacturer Assignment, Quality Check, Completion) using a stepper and tabs.
2.  For material allocation phases:
    *   The **`StoneAllocationRow`** component is used within the "Stone Selection" tab of `JobDetailSheet` to allow users to pick specific stone lots and define quantities and weights.
    *   Similarly, the **`DiamondAllocationRow`** component is used within the "Diamond Selection" tab for allocating diamond lots.
    *   Both allocation row components receive available lot data fetched via `lib/api-service.ts` (e.g., `fetchStoneLots`, `fetchDiamondLots`) and propagate user inputs back to the `JobDetailSheet`.
3.  As the user completes each phase in `JobDetailSheet`, data is submitted. This typically involves:
    *   Calling the `updateJobPhase` server action located in `app/actions/job-actions.ts`.
    *   This server action updates the relevant job record in the `jobs` table in Supabase and logs the change in the `job_history` table.
    *   It also updates related data fields like `stone_data`, `diamond_data`, `manufacturer_data`, or `qc_data` within the `jobs` table.
4.  After successfully completing a phase and submitting data, the **`StickerPreview`** component is often displayed. This modal shows a summary of the data entered for the just-completed phase, formatted as a "work sticker" that could theoretically be printed.
5.  The `JobDetailSheet` then reflects the job's new status and advances to the next logical phase, guided by definitions in `constants/job-workflow.ts`.

Throughout this process, these components rely on shared types from `types/index.ts`, constants from `constants/job-workflow.ts`, and UI elements from `components/ui/`. Logging is handled via `lib/logger.ts`.

---

## Component Deep Dive

### 1. JobDetailSheet (`components/job-detail-sheet.tsx`)

*   **Purpose**:
    The `JobDetailSheet` is a comprehensive, full-screen overlay component designed to manage the entire lifecycle of a single job. It allows users to view job details, progress through various production phases, input phase-specific data, and mark the job as complete.

*   **User Interface and Flow**:
    1.  **Opening**: The sheet opens when a job is selected for detailed management, displaying information for the passed `job` prop.
    2.  **Header**: Shows the Job ID, current status (e.g., "Stone Selected"), and a "Complete Job" button (active during the "Complete" phase). An arrow button allows closing the sheet.
    3.  **Job Summary**: Displays the SKU image, name, and SKU ID. Cards show current Job Status, Production Date, and assigned Manufacturer.
    4.  **Phase Navigation**:
        *   A `Stepper` component visually represents all job phases (Stone, Diamond, Manufacturer, QC, Complete) and highlights the current phase. Users can click on completed or current steps to switch views.
        *   `Tabs` correspond to each phase, allowing users to access the specific forms and information for that phase. Tabs for future phases are disabled.
    5.  **Phase-Specific Forms**:
        *   **Stone Selection**: Uses `StoneAllocationRow` components to list and manage allocated stone lots. Fetches available lots using `fetchStoneLots`.
        *   **Diamond Selection**: Uses `DiamondAllocationRow` components for diamond allocation. Fetches available lots using `fetchDiamondLots`.
        *   **Manufacturer**: Allows selecting a manufacturer from a predefined list (or fetched list) and setting an expected completion date.
        *   **Quality Check (QC)**: Allows inputting measured weight, QC notes, and marking the QC as "Passed" or "Failed".
        *   **Complete**: Shows a summary of all previous phases and allows marking the job as officially complete.
    6.  **Data Submission**: Each phase has a submission button (e.g., "Complete Stone Selection", "Assign Manufacturer"). Clicking this validates the input and calls the `updateJobPhase` server action.
    7.  **Sticker Preview**: After successful phase submission, `StickerPreview` modal often appears with a summary of the submitted data.
    8.  **State Update**: Upon successful action, the sheet's internal state (current phase, job status) updates, and the UI reflects these changes, often enabling the next phase.

*   **Key Features & Logic**:
    *   Manages complex local state for form inputs, loading states, and errors for each phase (`stoneAllocations`, `diamondAllocations`, `manufacturerData`, `qcData`, etc.).
    *   `useEffect` hooks are used to initialize state when the `job` prop changes and to fetch data like stone/diamond lots when the sheet opens or the relevant phase becomes active.
    *   `useMemo` is used for derived data like total quantities/weights for allocations.
    *   Validation logic for each phase's form data before submission.
    *   Dynamic rendering of allocation rows (`StoneAllocationRow`, `DiamondAllocationRow`).
    *   Image preview dialog for the SKU image.

*   **Props & State**:
    *   **Props**:
        *   `job: Job | null`: The job object containing all its details.
        *   `open: boolean`: Controls the visibility of the sheet.
        *   `onOpenChange: (open: boolean) => void`: Callback to close the sheet.
    *   **Key Internal State**:
        *   `currentPhase: JobPhase`: The currently active phase tab.
        *   `jobStatus: JobStatus`: The current status of the job.
        *   `stoneLots`, `diamondLots`: Arrays of available lots.
        *   `stoneAllocations`, `diamondAllocations`: Arrays of user-defined allocations.
        *   `manufacturerData`, `qcData`: Objects holding form data for their respective phases.
        *   Loading and error states for data fetching and submissions (e.g., `stoneLotsLoading`, `isSubmittingStone`, `stonePhaseError`).
        *   `stickerOpen`, `stickerData`: Controls the sticker preview modal.

*   **Interactions & Dependencies**:
    *   **Child Components**:
        *   `components/ui/stepper.tsx`
        *   `components/ui/tabs.tsx`
        *   `components/stone-allocation-row.tsx`
        *   `components/diamond-allocation-row.tsx`
        *   `components/sticker-preview.tsx`
        *   Various UI elements from `components/ui/` (Button, Card, Badge, Input, Dialog, etc.).
        *   Icons from `lucide-react`.
    *   **Server Actions**:
        *   `app/actions/job-actions.ts`: Primarily `updateJobPhase()` to submit phase completions and update job status.
    *   **API Services**:
        *   `lib/api-service.ts`: `fetchStoneLots()` and `fetchDiamondLots()` to get available lots for allocation.
    *   **Constants**:
        *   `constants/job-workflow.ts`: `JOB_PHASE`, `JOB_STATUS`, `PHASE_INFO` for phase logic and display.
    *   **Types**:
        *   `types/index.ts`: `Job`, `StoneLotData`, `StoneAllocation`, `DiamondLotData`, `DiamondAllocation`, `JobPhase`.
    *   **Utilities**:
        *   `lib/client-id-generator.ts`: `generateClientId()` for unique keys in allocation rows.
        *   `lib/logger.ts`: For logging.

*   **Supabase Communication**:
    *   **Reads**:
        *   Initial job data is passed via the `job` prop (fetched by a parent component, likely using `fetchJob` from `lib/api-service.ts`).
        *   Stone lots from `stone_lots` table via `fetchStoneLots()`.
        *   Diamond lots from `diamond_lots` table via `fetchDiamondLots()`.
    *   **Writes/Updates**:
        *   All modifications to job status, current phase, and phase-specific data (`stone_data`, `diamond_data`, `manufacturer_data`, `qc_data`) are performed by calling the `updateJobPhase` server action.
        *   `updateJobPhase` interacts with Supabase to:
            *   Update the corresponding record in the `jobs` table.
            *   Insert a new record into the `job_history` table.
            *   Potentially update the parent order's status in the `orders` table.

---

### 2. NextTaskModule (`components/next-task-module.tsx`)

*   **Purpose**:
    The `NextTaskModule` is designed to provide users (typically belonging to a specific team like "bag", "stone", "diamond", etc.) with a quick view of the most urgent job they need to process.

*   **User Interface and Flow**:
    1.  The module receives the `selectedTeam` and a list of `jobs`.
    2.  It filters the `jobs` based on a `teamStatusMap` which defines which `JOB_STATUS` each team is responsible for.
    3.  Among the filtered jobs, it identifies the one with the earliest `dueDate`. This is considered the "next task".
    4.  If a next task is found, it displays:
        *   Job Image, ID, and Name.
        *   SKU ID.
        *   A `Badge` showing the current job status, colored according to `PHASE_INFO`.
        *   Due Date and Production Date.
        *   A "Process Now" `Button`.
    5.  Clicking "Process Now" triggers the `onProcessJob` callback, passing the `nextTask` object. This callback is typically implemented by the parent component to navigate the user to the job's detail view or open the `JobDetailSheet`.
    6.  If no tasks are pending for the selected team, a message like "No pending tasks for your team at this time" is shown.

*   **Key Features & Logic**:
    *   `useMemo` hook is used to memoize the `nextTask` calculation, optimizing performance by re-calculating only when `jobs` or `selectedTeam` props change.
    *   `teamStatusMap`: An internal mapping that links team names (e.g., "stone") to the job statuses they handle (e.g., `JOB_STATUS.BAG_CREATED`).
    *   `getBadgeColor`: A function to determine the Tailwind CSS background color class for the status badge based on `PHASE_INFO`.

*   **Props & State**:
    *   **Props**:
        *   `selectedTeam: string`: The identifier for the currently selected team.
        *   `jobs: any[]` (ideally `Job[]`): The list of all relevant jobs to consider.
        *   `onProcessJob: (job: any) => void`: Callback function executed when the "Process Now" button is clicked.
    *   **Internal State**:
        *   `nextTask`: Derived state (via `useMemo`) holding the identified next job object or `null`.

*   **Interactions & Dependencies**:
    *   **UI Components**: `Badge`, `Button`, `Separator` (from `components/ui/`).
    *   **Icons**: `Clock`, `Package` (from `lucide-react`).
    *   **Constants**: `JOB_STATUS`, `PHASE_INFO` (from `constants/job-workflow.ts`).
    *   **Utilities**: `cn` (from `lib/utils.ts`).
    *   This component is typically used on a dashboard or team-specific page.

*   **Supabase Communication**:
    *   **Reads**:
        *   Indirectly. It receives job data through the `jobs` prop. The parent component is responsible for fetching this data from Supabase (likely from the `jobs` table, possibly joined with `skus`).
    *   **Writes/Updates**:
        *   None directly. The `onProcessJob` callback might lead to interactions that update Supabase, but this component itself doesn't initiate writes.

---

### 3. StoneAllocationRow (`components/stone-allocation-row.tsx`)

*   **Purpose**:
    This component renders a single, interactive row within a table or list for allocating a specific stone lot to a job. It's primarily used in the "Stone Selection" phase of the `JobDetailSheet` or the standalone `stone-selection/page.tsx`.

*   **User Interface and Flow**:
    1.  The row displays fields for selecting a "Lot Number", and inputs for "Quantity" and "Weight (ct)". It also shows read-only "Stone Type" and "Size" derived from the selected lot.
    2.  **Lot Selection**: The user clicks on the "Lot Number" `Select` dropdown.
        *   This dropdown is populated with `lot_number` values from the `stoneLots` prop.
        *   When a lot is selected, the `onChange` callback updates the parent's state. The `stone_type` and `size` for that lot are automatically displayed. The `available_quantity` and `available_weight` from the selected lot are also captured internally or by the parent for validation.
    3.  **Quantity/Weight Input**: The user types the desired quantity of stones and their total weight from the selected lot.
    4.  **Validation**: If the entered quantity exceeds the available quantity for the lot, or if the lot is already selected in another row, a validation error message appears below the relevant field.
    5.  **Deletion**: A delete button (XCircle icon) allows the user to remove the row, triggering the `onDelete` callback. This button is disabled if it's the only row or if the form is submitting.

*   **Key Features & Logic**:
    *   Uses `Select` component for lot selection.
    *   Auto-populates stone type and size based on selected lot.
    *   Handles input for numeric fields (quantity, weight).
    *   Displays validation errors passed via `validationErrors` prop.
    *   `handleLotChange` function updates multiple fields in the parent's state when a lot is selected.
    *   Enhanced logging for debugging purposes.

*   **Props & State**:
    *   **Props**:
        *   `index: number`: The index of the row.
        *   `allocation: StoneAllocation`: The data object for this specific row.
        *   `stoneLots: StoneLotData[]`: Array of available stone lots to choose from.
        *   `onChange: (index: number, field: string, value: any) => void`: Callback to update the allocation data in the parent component.
        *   `onDelete: (index: number) => void`: Callback to delete the row.
        *   `isSubmitting: boolean`: Indicates if the parent form is currently submitting.
        *   `validationErrors: { [field: string]: string }`: An object containing validation messages for fields in this row.
        *   `stoneAllocations: StoneAllocation[]`: The full list of current stone allocations (used for duplicate lot checks).
    *   **Internal State**:
        *   Uses `useId` for generating unique IDs for form elements for accessibility.

*   **Interactions & Dependencies**:
    *   **Parent Component**: Typically `JobDetailSheet` or `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx`.
    *   **UI Components**: `Input`, `Select`, `Button` (from `components/ui/`).
    *   **Icons**: `XCircle` (from `lucide-react`).
    *   **Types**: `StoneLotData`, `StoneAllocation` (from `types/index.ts`).
    *   **Logging**: `lib/logger.ts`.

*   **Supabase Communication**:
    *   **Reads**:
        *   Indirectly. It receives available stone lots via the `stoneLots` prop, which are fetched by the parent component from the `stone_lots` table in Supabase (likely filtered by `status='Available'`).
    *   **Writes/Updates**:
        *   None directly. All data changes are communicated to the parent component through the `onChange` callback. The parent component is responsible for persisting these changes to Supabase, typically via the `updateJobPhase` server action.

---

### 4. DiamondAllocationRow (`components/diamond-allocation-row.tsx`)

*   **Purpose**:
    Analogous to `StoneAllocationRow`, this component renders an interactive row for allocating a specific diamond lot to a job. It's used in the "Diamond Selection" phase of `JobDetailSheet` or the standalone `diamond-selection/page.tsx`.

*   **User Interface and Flow**:
    1.  Displays fields for "Lot Number", read-only "Size", "Shape", "Quality" (derived from selected lot), and inputs for "Quantity" and "Weight (carat)".
    2.  **Lot Selection**: User selects a diamond lot from the "Lot Number" `Select` dropdown.
        *   Dropdown populated from `diamondLots` prop.
        *   Selection updates parent state via `onChange`. `size`, `shape`, `quality`, and `available_quantity` are auto-updated.
    3.  **Quantity/Weight Input**: User enters quantity of diamonds and their total weight.
    4.  **Validation**: Displays errors for invalid inputs (e.g., exceeding available quantity, duplicate lot).
    5.  **Deletion**: An XCircle icon button triggers `onDelete` callback.

*   **Key Features & Logic**:
    *   `Select` component for diamond lot selection.
    *   Auto-population of diamond attributes (size, shape, quality).
    *   Input fields for quantity and weight.
    *   Displays validation errors.
    *   `handleLotChange` function for updating parent state upon lot selection.
    *   Enhanced logging.

*   **Props & State**:
    *   **Props**:
        *   `index: number`: Row index.
        *   `allocation: DiamondAllocation`: Data for this row.
        *   `diamondLots: DiamondLotData[]`: Array of available diamond lots.
        *   `onChange: (index: number, field: string, value: any) => void`: Parent callback for updates.
        *   `onDelete: (index: number) => void`: Parent callback for deletion.
        *   `isSubmitting: boolean`: Parent form submission status.
        *   `validationErrors: { [field: string]: string }`: Validation messages for this row.
        *   `diamondAllocations: DiamondAllocation[]`: Full list of current diamond allocations.
    *   **Internal State**:
        *   Uses `useId` for unique element IDs.

*   **Interactions & Dependencies**:
    *   **Parent Component**: `JobDetailSheet` or `app/orders/[orderId]/jobs/[jobId]/diamond-selection/page.tsx`.
    *   **UI Components**: `Input`, `Select`, `Button`.
    *   **Icons**: `XCircle`.
    *   **Types**: `DiamondLotData`, `DiamondAllocation` (from `types/index.ts`).
    *   **Logging**: `lib/logger.ts`.

*   **Supabase Communication**:
    *   **Reads**:
        *   Indirectly. Receives `diamondLots` via props, fetched by parent from `diamond_lots` table (filtered by `status='Available'`).
    *   **Writes/Updates**:
        *   None directly. Changes are propagated to the parent via `onChange`, which then handles persistence through server actions.

---

### 5. StickerPreview (`components/sticker-preview.tsx`)

*   **Purpose**:
    The `StickerPreview` component displays a modal dialog that shows a formatted preview of a "work sticker". This sticker contains key information relevant to a specific job phase that has just been completed.

*   **User Interface and Flow**:
    1.  The dialog becomes visible when its `open` prop is true. This typically happens after a job phase is successfully submitted in `JobDetailSheet` or a similar page.
    2.  The dialog header shows "Work Sticker - [Phase Name]" (e.g., "Work Sticker - stone").
    3.  The main content area is styled to resemble a physical sticker:
        *   A title like "Exquisite Fine Jewellery" and "Work Sticker".
        *   Displays `Job ID` and `Phase`.
        *   Dynamically lists key-value pairs from the `data` prop (e.g., "Lot Number: LOT-D001", "Total Weight: 3.2g").
        *   Shows the current `Date`.
    4.  **Actions**:
        *   **Print Button**: When clicked, it triggers the browser's print dialog (`window.print()`) to print the sticker content.
        *   **Download Button**: When clicked, it currently shows an alert ("Sticker downloaded"). In a full implementation, this would trigger the generation and download of a PDF or image file of the sticker.
    5.  **Closing**: The dialog can be closed by clicking outside it or an explicit close button (if provided by the `Dialog` component). Closing the dialog triggers the `onOpenChange(false)` callback. This callback is often used by the parent component to proceed, for example, by navigating to the next job phase or updating its UI.

*   **Key Features & Logic**:
    *   Uses the `Dialog` component from `components/ui/dialog.tsx` for modal presentation.
    *   Dynamically renders the content of the sticker based on the `jobId`, `phase`, and `data` props.
    *   Includes basic print functionality.

*   **Props & State**:
    *   **Props**:
        *   `open: boolean`: Controls the visibility of the dialog.
        *   `onOpenChange: (open: boolean) => void`: Callback function triggered when the dialog's open state is requested to change.
        *   `jobId: string`: The ID of the job for which the sticker is being generated.
        *   `phase: string`: The name of the job phase (e.g., "stone", "diamond", "manufacturer").
        *   `data: Record<string, any>`: An object containing the key-value pairs to be displayed on the sticker.
    *   **Internal State**:
        *   No significant internal state beyond what the `Dialog` component manages.

*   **Interactions & Dependencies**:
    *   **Parent Component**: Typically `JobDetailSheet` or individual phase pages like `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx`.
    *   **UI Components**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Button` (from `components/ui/`).
    *   **Icons**: `Download`, `Printer` (from `lucide-react`).

*   **Supabase Communication**:
    *   **Reads**: None directly. All data is passed via props.
    *   **Writes/Updates**: None. It is a purely presentational component for data already processed and submitted by its parent.

---
*End of `documents/15-job-components.md`*
