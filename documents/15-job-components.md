# 15. Job Processing Components

## Summary of Component Interactions

The job processing components in this ERP system work together to manage the lifecycle of a manufacturing job, from task assignment to completion.

1.  **`NextTaskModule`**: This component typically resides on a dashboard. It helps users (grouped by teams like "Stone Team", "Diamond Team", etc.) identify the most urgent job assigned to them. It filters a list of all active jobs based on the selected team's responsible job status and the job's due date. Clicking "Process Now" on a task in this module usually triggers the opening of the `JobDetailSheet` for that specific job.

2.  **`JobDetailSheet`**: This is the central hub for managing an individual job. It's a full-page overlay that guides the user through various manufacturing phases: Stone Selection, Diamond Selection, Manufacturer Assignment, Quality Check (QC), and Completion.
    *   It fetches necessary data for each phase (e.g., available stone/diamond lots via `lib/api-service.ts`).
    *   For material allocation, it uses specialized row components:
        *   **`StoneAllocationRow`**: Used within the Stone Selection phase for each line item of stone allocation. It allows users to select a stone lot and input quantity and weight.
        *   **`DiamondAllocationRow`**: Similarly used within the Diamond Selection phase for diamond allocation.
    *   Each phase completion involves submitting data through server actions (`app/actions/job-actions.ts`), which then update the Supabase database (e.g., `jobs` table status, phase-specific data, and `job_history`).
    *   After successfully completing a phase, the **`StickerPreview`** component is displayed.

3.  **`StickerPreview`**: This component shows a dialog with a summary of the just-completed phase (e.g., allocated stones, assigned manufacturer, QC results). It provides options to "Print" or "Download" a conceptual work sticker.

Essentially, `NextTaskModule` acts as an entry point to pick up tasks. `JobDetailSheet` is the workspace for executing these tasks phase by phase, utilizing `StoneAllocationRow` and `DiamondAllocationRow` for detailed inputs. All significant state changes and data persistence are handled via server actions communicating with Supabase, and `StickerPreview` provides immediate visual feedback upon phase completion.

---

## Component Details

### 1. `JobDetailSheet` (`components/job-detail-sheet.tsx`)

**Overview:**
The `JobDetailSheet` is a comprehensive client component designed as a full-page overlay for managing an individual job through its entire lifecycle. It uses a tab-based and stepper navigation system to guide users through distinct phases: Stone Selection, Diamond Selection, Manufacturer Assignment, Quality Check (QC), and Job Completion.

**User Flow:**

1.  **Opening**: The sheet opens when a user selects a job to process, typically from the `NextTaskModule` or an orders/jobs list. The `job` data is passed as a prop.
2.  **Initial Display**:
    *   Shows job header: SKU image, name, ID, and current status.
    *   A `Stepper` component visually indicates the current phase and allows navigation to previously completed or current phases.
3.  **Phase Management (via Tabs):**
    *   **Stone Selection Tab:**
        *   If the phase is active, it fetches available stone lots using `fetchStoneLots` from `lib/api-service.ts`.
        *   Displays a table of `StoneAllocationRow` components. Users can add/delete rows.
        *   Users select a stone lot, input quantity, and weight for each row.
        *   Client-side validation checks for required fields, positive quantities/weights, and availability against lot stock.
        *   On "Complete Stone Selection", data (allocations, total quantity/weight, timestamp) is sent to `updateJobPhase` server action.
        *   If successful, `StickerPreview` is shown, and the sheet updates to the next phase (Diamond Selection).
    *   **Diamond Selection Tab:**
        *   Similar to Stone Selection, but uses `fetchDiamondLots` and `DiamondAllocationRow`.
        *   Users select diamond lots, input quantity, and weight.
        *   On "Complete Diamond Selection", data is sent to `updateJobPhase`.
        *   If successful, `StickerPreview` is shown, and the sheet updates to the Manufacturer phase.
    *   **Manufacturer Tab:**
        *   Displays a list of available manufacturers (currently mocked, can be fetched).
        *   User selects a manufacturer and inputs an "Expected Completion Date".
        *   On "Assign Manufacturer", data is sent to `updateJobPhase`.
        *   If successful, `StickerPreview` is shown, and the sheet updates to the QC phase.
    *   **Quality Check (QC) Tab:**
        *   Displays expected weight (derived from job data).
        *   User inputs "Measured Weight" and "Quality Check Notes".
        *   User clicks "Pass QC" or "Fail QC".
        *   Data (measured weight, notes, passed status) is sent to `updateJobPhase`.
        *   If successful, `StickerPreview` is shown. If passed, sheet updates to Complete phase. If failed, it might revert to Manufacturer or a specific "QC Failed" state.
    *   **Complete Tab:**
        *   Displays a summary of data from all previous phases (stone, diamond, manufacturer, QC details).
        *   User clicks "Mark Job as Complete".
        *   Data (completion date) is sent to `updateJobPhase`.
        *   If successful, `StickerPreview` is shown, and the job status is marked as "Completed".
4.  **Image Preview**: Clicking the SKU image opens a dialog to view a larger version.
5.  **Closing**: User can close the sheet using a "Back" button.

**Key Functionalities:**
*   Manages local state for form inputs, selected lots, loading states, and errors for each phase.
*   Uses `useEffect` to fetch data (stone/diamond lots) when the sheet opens or the relevant phase becomes active.
*   Performs client-side validation before submitting data for each phase.
*   Dynamically updates job status and current phase based on server action responses.

**Affected/Affecting Files:**
*   **Consumes Props**: `job: Job | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`.
*   **Types**: `types/index.ts` (Job, StoneLotData, StoneAllocation, DiamondLotData, DiamondAllocation, JobPhase).
*   **Constants**: `constants/job-workflow.ts` (JOB_STATUS, JOB_PHASE).
*   **API/Actions**:
    *   `lib/api-service.ts` (functions: `fetchStoneLots`, `fetchDiamondLots`).
    *   `app/actions/job-actions.ts` (function: `updateJobPhase`).
*   **Child Components**:
    *   `components/stone-allocation-row.tsx`
    *   `components/diamond-allocation-row.tsx`
    *   `components/sticker-preview.tsx`
    *   `components/ui/stepper.tsx`
    *   Various `components/ui/*` (Button, Card, Badge, Dialog, Separator, Tabs, Input, Label, Textarea, Table, Alert, Loader2).
*   **Utilities**:
    *   `lib/logger.ts`
    *   `lib/client-id-generator.ts` (for unique keys in allocation rows).
*   **Icons**: `lucide-react`.

**Supabase Interactions:**
*   **Indirectly (Reading)** via `lib/api-service.ts`:
    *   `fetchStoneLots`: Reads from `stone_lots` table (filtered by `status = 'Available'`).
    *   `fetchDiamondLots`: Reads from `diamond_lots` table (filtered by `status = 'Available'`).
*   **Indirectly (Writing/Updating)** via `app/actions/job-actions.ts` (`updateJobPhase`):
    *   Fetches the job's UUID from `jobs` table using the human-readable `jobId`.
    *   Updates the `jobs` table:
        *   Sets `status` (e.g., `JOB_STATUS.STONE_SELECTED`).
        *   Sets `current_phase` (e.g., `JOB_PHASE.DIAMOND`).
        *   Stores phase-specific data in JSONB columns (`stone_data`, `diamond_data`, `manufacturer_data`, `qc_data`).
        *   Updates `updated_at` timestamp.
    *   Inserts a new record into the `job_history` table detailing the action, new status, and associated data.
    *   Updates the `status` of the parent `orders` table based on the status of all its associated jobs (e.g., if all jobs are "Completed", order becomes "Completed").
    *   Triggers `revalidatePath` for relevant pages to refresh data.

---

### 2. `NextTaskModule` (`components/next-task-module.tsx`)

**Overview:**
This component is designed to display the next most urgent task for a specific team. It helps streamline workflow by highlighting priority jobs.

**User Flow:**
1.  The component receives a `selectedTeam` (e.g., "stone", "diamond") and a list of all relevant `jobs` as props.
2.  It filters the `jobs` list to find tasks matching the `selectedTeam`'s responsibility (based on current job status, e.g., "stone" team handles "Bag Created" status jobs).
3.  Among the filtered jobs, it identifies the one with the earliest `dueDate`.
4.  If a task is found, it displays:
    *   Job image.
    *   Job ID and name.
    *   SKU ID.
    *   Current job status (with a colored badge).
    *   Due date and production date.
    *   A "Process Now" button.
5.  Clicking "Process Now" invokes the `onProcessJob` callback (passed as a prop), which typically opens the `JobDetailSheet` for the selected job.
6.  If no tasks are pending for the selected team, a message like "No pending tasks for your team at this time" is shown.

**Logic:**
*   Uses `useMemo` to efficiently calculate the `nextTask` whenever `jobs` or `selectedTeam` props change.
*   A `teamStatusMap` maps team names to the job statuses they are responsible for.
*   Badge colors for job statuses are determined using `PHASE_INFO` from `constants/job-workflow.ts`.

**Affected/Affecting Files:**
*   **Consumes Props**: `selectedTeam: string`, `jobs: any[]` (ideally `Job[]`), `onProcessJob: (job: any) => void`.
*   **Types**: `types/index.ts` (implicitly, for `Job` structure).
*   **Constants**: `constants/job-workflow.ts` (JOB_STATUS, PHASE_INFO).
*   **UI Components**: `components/ui/badge.tsx`, `components/ui/button.tsx`, `components/ui/separator.tsx`.
*   **Utilities**: `lib/utils.ts` (cn function).
*   **Icons**: `lucide-react` (Clock, Package).
*   **Parent Component**: Typically a dashboard page (e.g., `app/page.tsx`) that provides the props and handles the `onProcessJob` action.

**Supabase Interactions:**
*   None directly. The `jobs` data it processes is assumed to be fetched by a parent component, likely using `fetchJobs` from `lib/api-service.ts`, which reads from the `jobs` and `skus` tables in Supabase.

---

### 3. `StoneAllocationRow` (`components/stone-allocation-row.tsx`)

**Overview:**
This component represents a single, editable row within the stone allocation table in the `JobDetailSheet`'s Stone Selection phase. It allows users to select a stone lot and specify the quantity and weight of stones to allocate from that lot.

**User Flow:**
1.  **Lot Selection**:
    *   User clicks a `Select` dropdown populated with available `stoneLots` (prop).
    *   Upon selecting a lot, the `onChange` callback updates the parent's state for this row with the chosen `lot_number`.
    *   The component then automatically populates read-only fields for "Stone Type" and "Size" based on the selected lot's data.
    *   The `available_quantity` and `available_weight` for the selected lot are also passed up to the parent to aid validation.
2.  **Quantity Input**: User types the number of stones to allocate into an `Input` field.
3.  **Weight Input**: User types the total weight (in carats) of the allocated stones into an `Input` field.
4.  **Deletion**: User can click an "X" button to delete the row. This calls the `onDelete` callback. The button is disabled if it's the only row or if the form is submitting.
5.  **Validation**: Input fields will display a red border and an error message below if `validationErrors` (prop) indicate an issue for that field (e.g., quantity exceeds available stock, lot already selected).

**Props and State:**
*   Manages no internal state directly; all data and changes are propagated to/from the parent `JobDetailSheet` via props (`allocation`, `onChange`).
*   Key props: `index`, `allocation` (current row data), `stoneLots` (list of available lots), `onChange` (callback for updates), `onDelete` (callback for deletion), `isSubmitting`, `validationErrors`, `stoneAllocations` (list of all allocations, for delete button logic).

**Affected/Affecting Files:**
*   **Consumes Props**: As listed above.
*   **Types**: `types/index.ts` (StoneLotData, StoneAllocation).
*   **UI Components**: `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/button.tsx`.
*   **Utilities**: `lib/logger.ts`.
*   **Icons**: `lucide-react` (XCircle).
*   **Parent Component**: `components/job-detail-sheet.tsx`.

**Supabase Interactions:**
*   None directly. All data is managed by the parent `JobDetailSheet` and persisted to Supabase via server actions when the entire Stone Selection phase is completed.

---

### 4. `DiamondAllocationRow` (`components/diamond-allocation-row.tsx`)

**Overview:**
Functionally very similar to `StoneAllocationRow`, but tailored for diamond allocations within the `JobDetailSheet`'s Diamond Selection phase. It allows users to select a diamond lot and specify quantity and weight.

**User Flow:**
1.  **Lot Selection**:
    *   User selects a diamond lot from a `Select` dropdown populated by `diamondLots` (prop).
    *   Selecting a lot auto-populates read-only fields for "Size", "Shape", and "Quality".
    *   The `available_quantity` for the selected lot is passed to the parent.
2.  **Quantity Input**: User inputs the number of diamonds.
3.  **Weight Input**: User inputs the total weight (in carats).
4.  **Deletion**: User can delete the row via an "X" button.
5.  **Validation**: Displays validation errors similar to `StoneAllocationRow`.

**Props and State:**
*   Similar to `StoneAllocationRow`, it's a controlled component.
*   Key props: `index`, `allocation` (current diamond row data), `diamondLots` (list of available diamond lots), `onChange`, `onDelete`, `isSubmitting`, `validationErrors`, `diamondAllocations`.

**Affected/Affecting Files:**
*   **Consumes Props**: As listed above.
*   **Types**: `types/index.ts` (DiamondLotData, DiamondAllocation).
*   **UI Components**: `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/button.tsx`.
*   **Utilities**: `lib/logger.ts`.
*   **Icons**: `lucide-react` (XCircle).
*   **Parent Component**: `components/job-detail-sheet.tsx`.

**Supabase Interactions:**
*   None directly. Data is managed by `JobDetailSheet` and persisted via server actions.

---

### 5. `StickerPreview` (`components/sticker-preview.tsx`)

**Overview:**
A reusable dialog component that displays a preview of a "work sticker" relevant to a completed job phase.

**User Flow:**
1.  The dialog opens when the `open` prop is true (typically after a phase is successfully submitted in `JobDetailSheet` or other phase-specific pages).
2.  It displays:
    *   A title like "Work Sticker - [Phase Name]".
    *   Fixed header "Exquisite Fine Jewellery - Work Sticker".
    *   Job ID and Phase name.
    *   A list of key-value pairs from the `data` prop (e.g., "Lot Number: LOT-D001", "Total Weight: 5.25g").
    *   The current date.
3.  **Print Button**: Clicking this button triggers the browser's print dialog (`window.print()`) to print the content of the sticker.
4.  **Download Button**: Clicking this button currently shows an alert ("Sticker downloaded"). In a full implementation, it would generate and download a PDF or image of the sticker.
5.  **Closing Dialog**: The dialog can be closed by clicking outside or an 'X' button. The `onOpenChange` callback is invoked, allowing the parent component to handle post-closing actions (like navigation).

**Props:**
*   `open: boolean`: Controls dialog visibility.
*   `onOpenChange: (open: boolean) => void`: Callback when dialog open state changes.
*   `jobId: string`: The ID of the job.
*   `phase: string`: The name of the current phase (e.g., "stone", "diamond").
*   `data: Record<string, any>`: An object containing the specific data points to display on the sticker for that phase.

**Affected/Affecting Files:**
*   **UI Components**: `components/ui/button.tsx`, `components/ui/dialog.tsx`.
*   **Icons**: `lucide-react` (Download, Printer).
*   **Parent Components**: Any component that needs to show a sticker preview after an action, e.g., `components/job-detail-sheet.tsx`, `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx` (and other individual phase pages).

**Supabase Interactions:**
*   None directly. It only displays data passed to it via props.

---

### 6. Other Relevant Components (Brief Mention)

*   **`components/ui/stepper.tsx`**: Used by `JobDetailSheet` to visually represent the job phases and allow navigation between them. It's a presentational component driven by props from `JobDetailSheet`.
*   **Individual Phase Pages (e.g., `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx`)**:
    These pages represent an alternative or potentially older structure for handling job phases individually rather than within the integrated `JobDetailSheet`. They use `JobLayout` (`app/orders/[orderId]/jobs/[jobId]/layout.tsx`) to fetch and provide job data via `JobContext`. While they also use `StickerPreview` and `updateJobPhase`, their primary interaction model is page-based navigation. The `JobDetailSheet` provides a more modal, single-component experience for the entire job lifecycle. The documentation above focuses on the `JobDetailSheet` workflow as per the components listed from the `components` folder.

This documentation should provide a clear understanding of how these key job processing components function and interact within the Jewellery ERP system.
