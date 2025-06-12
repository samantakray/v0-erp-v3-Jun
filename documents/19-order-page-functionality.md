# Order Page Functionality

This document provides a detailed explanation of how the order management system works in the Jewelry ERP application, including the pages, components, data flow, and functionality.

## Table of Contents

1. [Overview](#overview)
2. [Order Listing Page](#order-listing-page)
3. [Order Creation](#order-creation)
4. [Order Details](#order-details)
5. [Order Actions](#order-actions)
6. [Jobs Management](#jobs-management)
7. [Job Workflow](#job-workflow)
8. [Data Flow](#data-flow)
9. [Key Components](#key-components)

## Overview

The order management system is a core part of the Jewelry ERP application. It allows users to:

- View a list of all orders with filtering and sorting capabilities
- Create new orders
- View and edit order details
- Delete orders
- Manage jobs associated with orders
- Track the progress of orders through various manufacturing phases

The system is built using Next.js App Router with a combination of client and server components, server actions for data mutations, and Supabase for data storage.

## Order Listing Page

The main entry point is `app/orders/page.tsx`, which is a client component that displays a list of all orders in the system.

### Key Features

- **Tabbed Interface**: Orders are organized into "Pending" and "Completed" tabs
- **Search and Filter**: Users can search for orders and filter by various criteria
- **Sorting**: Orders can be sorted by different columns
- **Pagination**: Orders are paginated for better performance
- **Actions**: Each order has actions for viewing, editing, and deleting

### Implementation Details

The order listing page uses the following components and functions:

1. **Data Fetching**: Uses `fetchOrders()` from `lib/api-service.ts` to retrieve orders from Supabase
2. **State Management**: Uses React state to manage:
   - Orders data
   - Selected order
   - Loading states
   - Error states
   - Filter and pagination states
3. **UI Components**:
   - `DataTable` for displaying orders in a tabular format
   - `OrderDetailSheet` for viewing order details
   - `NewOrderSheet` for creating/editing orders
   - Various UI components like `Button`, `Input`, `Select`, etc.

### Code Flow

1. On component mount, `fetchOrders()` is called to retrieve all orders
2. Orders are processed to calculate days to due date and sorted
3. Orders are filtered based on the active tab (pending or completed)
4. The filtered orders are displayed in the `DataTable` component
5. User interactions (view, edit, delete) trigger appropriate state changes and actions

## Order Creation

New orders can be created via the "New Order" button on the orders page, which opens the `NewOrderSheet` component.

### Creation Process

1. User clicks "New Order" button
2. `NewOrderSheet` component is displayed
3. User fills in order details:
   - Customer information
   - Order type
   - Production and delivery dates
   - SKUs with quantities
4. User submits the form
5. `handleOrderCreated` function is called, which:
   - Calls the `createOrder` server action
   - Updates the local state with the new order
   - Shows a success message
   - Displays the order confirmation dialog

### Server-Side Processing

The `createOrder` server action in `app/actions/order-actions.ts` handles:

1. Validating the order data
2. Inserting the order into the Supabase database
3. Creating order items for each SKU
4. Generating jobs for each order item based on quantity
5. Creating initial job history entries
6. Returning the server-generated order ID

## Order Details

Order details can be viewed by clicking on an order in the list, which opens the `OrderDetailSheet` component.

### Details Display

The `OrderDetailSheet` component shows:

- Order header information (ID, customer, dates)
- List of SKUs with quantities
- Order status and history
- Actions for editing or managing jobs

### Implementation

The component fetches order details using the `fetchOrder` function from `api-service.ts` and displays them in a structured format.

## Order Actions

Orders can be managed through several actions:

### Edit Order

1. User clicks the edit button on an order
2. `NewOrderSheet` component is opened with pre-filled data
3. User makes changes and submits
4. `updateOrder` server action is called to update the database

### Delete Order

1. User clicks the delete button on an order
2. Confirmation dialog is shown
3. If confirmed, `deleteOrder` server action is called
4. Order is removed from the database and local state

### View Order Details

1. User clicks on an order or the view button
2. `OrderDetailSheet` component is opened
3. Order details are displayed

## Jobs Management

Each order consists of one or more jobs, which represent individual items to be manufactured.

### Jobs Listing

The `app/orders/[orderId]/jobs/page.tsx` page shows all jobs for a specific order:

- Job ID and SKU information
- Current status
- Production and due dates
- Actions for viewing job details

### Job Creation

Jobs are automatically created when an order is created, based on the SKUs and quantities specified. For each SKU in the order:

1. The quantity determines how many jobs are created
2. Each job is assigned a unique ID in the format `J{orderNumber}-{sequence}`
3. Jobs are initialized with status "New" and phase "Stone"

Additional jobs can be created manually if needed.

## Job Workflow

Jobs follow a defined workflow through several phases:

1. **Stone Selection**: Selection of stones for the jewelry piece
2. **Diamond Selection**: Selection of diamonds for the jewelry piece
3. **Manufacturer**: Assignment to a manufacturer and production tracking
4. **Quality Check**: Quality control inspection
5. **Complete**: Job completion and final processing

### Phase Navigation

The `app/orders/[orderId]/jobs/[jobId]/page.tsx` file serves as a router that redirects to the appropriate phase page based on the job's current status.

### Phase Pages

Each phase has its own page:

- `stone-selection/page.tsx`: For selecting stones
- `diamond-selection/page.tsx`: For selecting diamonds
- `manufacturer/page.tsx`: For manufacturer assignment
- `quality-check/page.tsx`: For QC processes
- `complete/page.tsx`: For completed jobs

### Phase Transitions

When a phase is completed:

1. The `updateJobPhase` server action is called
2. Job status and phase are updated
3. Job history is recorded
4. Parent order status may be updated based on all jobs' statuses

## Data Flow

The order system follows a clear data flow pattern:

### Read Operations

1. Client components call functions from `api-service.ts`
2. These functions fetch data from Supabase
3. Data is transformed into the appropriate format
4. Data is returned to the client component for rendering

### Write Operations

1. Client components call server actions from `order-actions.ts` or `job-actions.ts`
2. Server actions validate and process the data
3. Data is written to Supabase
4. Success/error response is returned to the client
5. Client updates local state based on the response

## Key Components

### OrderDetailSheet

This component (`components/order-detail-sheet.tsx`) displays detailed information about an order and provides actions for managing it.

\`\`\`typescript
// Key functionality:
// - Fetches order details using orderId
// - Displays order information, SKUs, and status
// - Provides actions for editing and managing jobs
\`\`\`

### NewOrderSheet

This component (`components/new-order-sheet.tsx`) provides a form for creating or editing orders.

\`\`\`typescript
// Key functionality:
// - Handles both creation and editing modes
// - Manages form state for order details
// - Allows adding/removing SKUs
// - Validates form data
// - Submits to server actions
\`\`\`

### OrderConfirmationDialog

This component (`components/order-confirmation-dialog.tsx`) displays a confirmation message after an order is created or updated.

\`\`\`typescript
// Key functionality:
// - Shows order summary
// - Provides options to view details or create another order
\`\`\`

### Server Actions

The server actions in `app/actions/order-actions.ts` handle data mutations:

\`\`\`typescript
// Key functions:
// - createOrder: Creates a new order and associated jobs
// - updateOrder: Updates an existing order
// - deleteOrder: Deletes an order and its associated items
// - getPredictedNextOrderNumber: Generates the next order number
// - getOpenOrderCount: Counts open orders
\`\`\`

### API Service

The functions in `lib/api-service.ts` handle data fetching:

\`\`\`typescript
// Key functions:
// - fetchOrders: Gets all orders
// - fetchOrder: Gets a specific order by ID
// - fetchJobs: Gets jobs for an order
// - fetchJob: Gets a specific job by ID
\`\`\`

## Conclusion

The order management system in the Jewelry ERP application provides a comprehensive solution for tracking and managing jewelry manufacturing orders. It follows a well-structured workflow from order creation through job completion, with clear separation of concerns between client components, server actions, and data services.

The system is designed to be scalable and maintainable, with reusable components and clear data flow patterns. It leverages Next.js App Router features like server actions for efficient data mutations while maintaining a responsive user interface.
