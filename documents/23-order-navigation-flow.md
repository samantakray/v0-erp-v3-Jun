## Order Navigation Flow Documentation

Here's the comprehensive documentation about how navigation works in the Jewelry ERP application's order management system:

---

# Order Navigation Flow Documentation

This document provides a comprehensive explanation of how navigation works in the Jewelry ERP application's order management system, from the initial order listing through to individual job phase pages.

## Table of Contents

1. [Navigation Overview](#navigation-overview)
2. [Order Listing to Order Details](#order-listing-to-order-details)
3. [Order Details to Jobs Listing](#order-details-to-jobs-listing)
4. [Jobs Listing to Individual Job](#jobs-listing-to-individual-job)
5. [Job Phase Navigation System](#job-phase-navigation-system)
6. [Phase-Specific Page Rendering](#phase-specific-page-rendering)
7. [Navigation Components](#navigation-components)
8. [URL Structure](#url-structure)
9. [Client-Side Routing Logic](#client-side-routing-logic)

## Navigation Overview

The navigation flow in the order management system follows a hierarchical structure:

```
Orders List (/orders)
├── Order Details (/orders/[orderId])
│   └── Jobs List (/orders/[orderId]/jobs)
│       └── Individual Job (/orders/[orderId]/jobs/[jobId])
│           ├── Stone Selection (/orders/[orderId]/jobs/[jobId]/stone-selection)
│           ├── Diamond Selection (/orders/[orderId]/jobs/[jobId]/diamond-selection)
│           ├── Manufacturer (/orders/[orderId]/jobs/[jobId]/manufacturer)
│           ├── Quality Check (/orders/[orderId]/jobs/[jobId]/quality-check)
│           └── Complete (/orders/[orderId]/jobs/[jobId]/complete)
```

## Order Listing to Order Details

### Entry Point: `/orders` Page

The main orders page (`app/orders/page.tsx`) displays a list of all orders in a DataTable format. Users can interact with orders in several ways:

1. **Click on Order Row**: Clicking anywhere on an order row triggers `handleOrderClick(orderId)`
2. **View Details Button**: Explicit "View" button in the actions column
3. **Edit Button**: Opens the order for editing

### Order Details Redirect Pattern

When a user clicks on an order, the system uses a redirect pattern:

**File**: `app/orders/[orderId]/page.tsx`

```typescript
export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const orderId = params.orderId

  // Redirect to orders page with the order ID as a query parameter
  useEffect(() => {
    router.push(`/orders?orderId=${orderId}`)
  }, [orderId, router])

  // This component doesn't render anything as it redirects
  return null
}
```

**Key Points:**
- The `/orders/[orderId]` route doesn't actually render order details
- It immediately redirects to `/orders?orderId=[orderId]`
- This triggers the `OrderDetailSheet` component to open on the main orders page
- The order details are displayed in a modal overlay, not a separate page

### Order Details Modal Display

Back on the main orders page, the URL parameter is detected:

```typescript
// In app/orders/page.tsx
const searchParams = useSearchParams()
const orderIdFromParams = searchParams.get("orderId")

useEffect(() => {
  if (orderIdFromParams) {
    setSelectedOrderId(orderIdFromParams)
    setIsOrderDetailOpen(true)
  }
}, [orderIdFromParams])
```

This opens the `OrderDetailSheet` component, which displays:
- Order header information
- List of SKUs with quantities
- Order status and history
- Actions for editing or managing jobs

## Order Details to Jobs Listing

### Jobs Button in Order Details

From the `OrderDetailSheet`, users can navigate to view all jobs for an order. This typically involves a "View Jobs" or "Manage Jobs" button that navigates to:

```
/orders/[orderId]/jobs
```

### Jobs Listing Page

**File**: `app/orders/[orderId]/jobs/page.tsx`

This page displays all jobs associated with a specific order:

```typescript
export default function JobsPage({ params }: { params: { orderId: string } }) {
  const [jobs, setJobs] = useState<Job[]>([])
  
  useEffect(() => {
    async function loadJobs() {
      const data = await fetchJobs(params.orderId)
      setJobs(data)
    }
    loadJobs()
  }, [params.orderId])
  
  // ... rendering logic
}
```

**Features:**
- Displays jobs in a table format
- Shows Job ID, SKU, Name, Status, Production Date
- Provides "View Details" link for each job
- Has "Back to Order" navigation
- Includes "Add New Job" functionality

## Jobs Listing to Individual Job

### Dynamic Job Route Determination

The jobs listing page includes intelligent routing logic that determines which phase page to navigate to based on the job's current status:

```typescript
// Function to determine which route to navigate to based on job status
const getJobRoute = (job: Job) => {
  switch (job.status) {
    case JOB_STATUS.NEW:
    case JOB_STATUS.BAG_CREATED:
      return JOB_PHASE.STONE
    case JOB_STATUS.STONE_SELECTED:
      return JOB_PHASE.DIAMOND
    case JOB_STATUS.DIAMOND_SELECTED:
      return JOB_PHASE.MANUFACTURER
    case JOB_STATUS.SENT_TO_MANUFACTURER:
    case JOB_STATUS.IN_PRODUCTION:
      return JOB_PHASE.QC
    case JOB_STATUS.QC_PASSED:
    case JOB_STATUS.QC_FAILED:
    case JOB_STATUS.COMPLETED:
      return JOB_PHASE.COMPLETE
    default:
      return JOB_PHASE.STONE
  }
}
```

### Job Details Link Generation

Each job row includes a "View Details" link that uses this routing logic:

```typescript
<Link
  href={`/orders/${params.orderId}/jobs/${job.id}/${getJobRoute(job)}`}
  className="text-blue-600 hover:underline"
>
  View Details
</Link>
```

**Example URLs:**
- New job: `/orders/ORD-001/jobs/J001-1/stone-selection`
- Job with stones selected: `/orders/ORD-001/jobs/J001-1/diamond-selection`
- Job in production: `/orders/ORD-001/jobs/J001-1/quality-check`

## Job Phase Navigation System

### Job Router Page

**File**: `app/orders/[orderId]/jobs/[jobId]/page.tsx`

This is a server component that acts as a router, determining which phase page to redirect to:

```typescript
export default async function JobIndexPage({ params }: { params: { jobId: string; orderId: string } }) {
  // Get the job to determine which phase to redirect to
  const { data: job, error } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", params.jobId)
    .single()

  if (error || !job) {
    throw new Error("Job not found")
  }

  // Determine which page to redirect to based on job status
  let redirectPath = JOB_PHASE.STONE

  switch (job.status) {
    case JOB_STATUS.STONE_SELECTED:
      redirectPath = JOB_PHASE.DIAMOND
      break
    case JOB_STATUS.DIAMOND_SELECTED:
      redirectPath = JOB_PHASE.MANUFACTURER
      break
    // ... other cases
  }

  // Redirect to the appropriate phase page
  redirect(`/orders/${params.orderId}/jobs/${params.jobId}/${redirectPath}`)
}
```

**Key Features:**
- Server-side component for immediate redirect
- Queries Supabase directly to get current job status
- Uses Next.js `redirect()` function for server-side navigation
- Ensures users always land on the correct phase page

### Job Layout and Context

**File**: `app/orders/[orderId]/jobs/[jobId]/layout.tsx`

Provides job data context to all phase pages:

```typescript
export const JobContext = createContext<any>(null)
export function useJob() {
  return useContext(JobContext)
}

export default async function JobLayout({
  params,
  children,
}: {
  params: { jobId: string; orderId: string }
  children: ReactNode
}) {
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.jobId)
    .single()

  if (error || !job) throw new Error("Job not found")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <JobContext.Provider value={job}>
          {children}
        </JobContext.Provider>
      </div>
    </div>
  )
}
```

**Purpose:**
- Fetches complete job data once at the layout level
- Provides job data to all child phase pages via React Context
- Eliminates need for each phase page to fetch job data separately

## Phase-Specific Page Rendering

### Phase Page Structure

Each phase page follows a consistent structure:

**Example**: `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx`

```typescript
export default function StoneSelectionPage({ params }: { params: { jobId: string; orderId: string } }) {
  const job = useJob() // Get job data from context
  const router = useRouter()
  
  // Phase-specific state management
  const [allocs, setAllocs] = useState([{ lot: "", qty: 0, wt: "" }])
  const [preview, setPreview] = useState(false)
  const [stickerData, setStickerData] = useState({})
  
  // Rendering logic with JobHeader and PhaseNavigation
  return (
    <div>
      <JobHeader orderId={params.orderId} />
      <PhaseNavigation orderId={params.orderId} jobId={params.jobId} />
      {/* Phase-specific content */}
      <StickerPreview 
        open={preview} 
        onOpenChange={setPreview}
        jobId={params.jobId}
        phase="stone"
        data={stickerData}
      />
    </div>
  )
}
```

### Common Phase Page Components

All phase pages include:

1. **JobHeader**: Displays job information, status, and back navigation
2. **PhaseNavigation**: Tab-like navigation between phases
3. **Phase-specific content**: Forms, tables, or completion screens
4. **StickerPreview**: Modal for displaying completion stickers

## Navigation Components

### JobHeader Component

**File**: `app/orders/[orderId]/jobs/[jobId]/components/job-header.tsx`

Provides:
- Back button to order details
- Job ID and status badge
- Job image and name
- Key job information cards (status, dates, manufacturer)

```typescript
export default function JobHeader({ orderId }: { orderId: string }) {
  const job = useJob()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/orders/${orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Job {job.id}</h1>
          <Badge variant="secondary">{job.status}</Badge>
        </div>
      </div>
      {/* Job details cards */}
    </div>
  )
}
```

### PhaseNavigation Component

**File**: `app/orders/[orderId]/jobs/[jobId]/components/phase-navigation.tsx`

Provides:
- Tab-style navigation between phases
- Access control based on job status
- Visual indication of current phase

```typescript
export default function PhaseNavigation({ orderId, jobId }: { orderId: string; jobId: string }) {
  const job = useJob()
  const pathname = usePathname()

  const phases = [
    { name: "Stone Selection", path: "stone-selection", status: "stone" },
    { name: "Diamond Selection", path: "diamond-selection", status: "diamond" },
    { name: "Manufacturer", path: "manufacturer", status: "manufacturer" },
    { name: "Quality Check", path: "quality-check", status: "quality-check" },
    { name: "Complete", path: "complete", status: "complete" },
  ]

  // Determine which phases are accessible based on job status
  const isPhaseAccessible = (phaseStatus: string) => {
    // Logic to determine accessibility based on job.status
  }

  return (
    <div className="flex border-b mb-6">
      {phases.map((phase) => (
        <Link
          key={phase.path}
          href={`/orders/${orderId}/jobs/${jobId}/${phase.path}`}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            pathname.includes(phase.path) ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
            !isPhaseAccessible(phase.status) && "opacity-50 pointer-events-none",
          )}
        >
          {phase.name}
        </Link>
      ))}
    </div>
  )
}
```

## URL Structure

The complete URL structure for the order navigation system:

```
/orders                                           # Orders listing page
/orders?orderId=ORD-001                          # Orders listing with order detail modal
/orders/ORD-001                                  # Redirects to above
/orders/ORD-001/jobs                             # Jobs listing for specific order
/orders/ORD-001/jobs/J001-1                     # Job router (redirects to appropriate phase)
/orders/ORD-001/jobs/J001-1/stone-selection     # Stone selection phase
/orders/ORD-001/jobs/J001-1/diamond-selection   # Diamond selection phase
/orders/ORD-001/jobs/J001-1/manufacturer        # Manufacturer assignment phase
/orders/ORD-001/jobs/J001-1/quality-check       # Quality check phase
/orders/ORD-001/jobs/J001-1/complete            # Job completion phase
```

## Client-Side Routing Logic

### Navigation State Management

The navigation system uses several patterns for state management:

1. **URL Parameters**: Order and job IDs are passed via URL parameters
2. **React Context**: Job data is shared via JobContext
3. **Query Parameters**: Order details modal state via `?orderId=`
4. **Local State**: Phase-specific form data and UI state

### Routing Decision Logic

Key routing decisions are made based on:

1. **Job Status**: Determines default phase page to display
2. **User Action**: Direct navigation via phase tabs
3. **Phase Completion**: Automatic progression after successful phase completion
4. **Access Control**: Prevents access to future phases based on current status

### Error Handling

The navigation system includes error handling for:

1. **Job Not Found**: Throws error if job doesn't exist
2. **Invalid Phase**: Redirects to appropriate phase based on status
3. **Access Denied**: Disables navigation to inaccessible phases
4. **Server Errors**: Displays error messages and retry options

## Navigation Flow Summary

Here's the complete user journey from clicking on an order to viewing a specific job phase:

### Step 1: Order Selection
- User clicks on an order in `/orders` page
- System redirects to `/orders/[orderId]` which immediately redirects to `/orders?orderId=[orderId]`
- `OrderDetailSheet` modal opens showing order details

### Step 2: Job Navigation
- User clicks "View Jobs" or similar in the order details modal
- System navigates to `/orders/[orderId]/jobs`
- Jobs listing page displays all jobs for the order

### Step 3: Job Selection
- User clicks "View Details" on a specific job
- System uses `getJobRoute(job)` to determine appropriate phase based on job status
- System navigates to `/orders/[orderId]/jobs/[jobId]/[phase]`

### Step 4: Job Router
- If user navigates directly to `/orders/[orderId]/jobs/[jobId]`
- Server component queries job status from database
- System redirects to appropriate phase page based on current status

### Step 5: Phase Page Rendering
- Job layout provides job data context
- Phase page renders with JobHeader, PhaseNavigation, and phase-specific content
- User can navigate between accessible phases using the phase navigation tabs

## Conclusion

The order navigation system in the Jewelry ERP application provides a sophisticated, multi-level navigation experience that guides users through the complete order and job management workflow. The system uses a combination of server-side routing, client-side state management, and intelligent route determination to ensure users always land on the appropriate page based on the current state of their orders and jobs.

Key benefits of this navigation system:

1. **Context-Aware**: Routes users to the correct phase based on job status
2. **Hierarchical**: Clear parent-child relationships between orders and jobs
3. **Accessible**: Visual indicators and access control for phase navigation
4. **Efficient**: Minimal data fetching through context sharing
5. **User-Friendly**: Intuitive navigation patterns with clear visual feedback

---

This documentation should be saved as `documents/23-order-navigation-flow.md` in your project. It provides a comprehensive understanding of how users navigate through the order system and how the application renders the appropriate job phase pages based on the current job status.