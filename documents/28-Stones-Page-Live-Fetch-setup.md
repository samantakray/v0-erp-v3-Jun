
Updated Plan: Implement Live Data Fetching for the Stone Lots Page
This revised plan incorporates insights from the codebase to ensure a safe and consistent implementation.

Step 1: Define a Comprehensive 
StoneLot
 Type
Objective: Create a new, more detailed TypeScript interface named 
StoneLot
 in 
types/index.ts
. This type will accurately represent the full structure of the stone_lots table from Supabase, including all fields you want to display (lot_number, stone_type, shape, quality, etc.).
Files to Change:
types/index.ts
Risk Level: Very Low
Validation: The existing 
StoneLotData
 is confirmed to be too simplistic for our needs. Creating a new type is additive and won't break anything.


Step 2: Create a Dedicated Data Fetching Function
Objective: In 
lib/api-service.ts
, create a new function called fetchAllStoneLots. This function will query the stone_lots table and return all relevant columns without adding the "None" option. This keeps the original 
fetchStoneLots
 intact for its intended use in dropdowns.
Files to Change:
lib/api-service.ts
Risk Level: Low
Validation: The documentation and function implementation confirm 
fetchStoneLots
 is not suitable for this page. Creating a new function is the standard practice in this codebase for fetching a list of all items for a table view (e.g., 
fetchAllJobs
).



# Step 3: Implementing Client-Side Data Fetching for Stones Page

This guide outlines the steps to implement client-side data fetching for the `StonesPage` component in the JewelleryERP project, converting it to a client component, managing state, and rendering dynamic data.

---

## Step 3: Implement Client-Side Data Fetching in the Stone page - this involves refactoring almost the entire page

### 3.1 Convert Page to Client Component
**Objective**: Enable React hooks by adding the `"use client"` directive.  
**Risk Level**: Very Low  
**Assumption**: The page is currently a server component and requires client-side interactivity.  
**Files**:
- `app/stones/page.tsx`

---

### 3.2 Import Required Dependencies
**Objective**: Import necessary hooks and types for client-side functionality.  
**Risk Level**: Very Low  
**Assumption**: Follows the same patterns as the orders page.  
**Code**:
```tsx
"use client"
import { useState, useEffect } from "react"
import { fetchAllStoneLots } from "@/lib/api-service"
import type { StoneLotData } from "@/types"
```

---

### 3.3 Set Up State Management
**Objective**: Initialize state for data, loading, and error handling.  
**Risk Level**: Low  
**Assumption**: Matches the state management pattern used in the orders page.  
**Code**:
```tsx
export default function StonesPage() {
  const [stoneLots, setStoneLots] = useState<StoneLotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ... rest of the component
}
```

---

### 3.4 Implement Data Fetching Logic
**Objective**: Fetch stone lots data on component mount using `useEffect`.  
**Risk Level**: Medium  
**Assumption**: The `fetchAllStoneLots` function works as expected.  
**Code**:
```tsx
useEffect(() => {
  const loadStoneLots = async () => {
    try {
      setLoading(true)
      const data = await fetchAllStoneLots()
      setStoneLots(data)
    } catch (err) {
      setError("Failed to load stone lots. Please try again later.")
      console.error("Error fetching stone lots:", err)
    } finally {
      setLoading(false)
    }
  }

  loadStoneLots()
}, [])
```

---

### 3.5 Add Loading State UI
**Objective**: Display a loading indicator while fetching data.  
**Risk Level**: Very Low  
**Assumption**: Uses the same loading spinner as other pages.  
**Code**:
```tsx
if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
```

---

### 3.6 Add Error State UI
**Objective**: Show a user-friendly error message if data fetching fails.  
**Risk Level**: Low  
**Assumption**: Error UI should align with the app's design.  
**Code**:
```tsx
if (error) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  )
}
```

---

### 3.7 Add Empty State Handling
**Objective**: Handle cases where no stone lots are found.  
**Risk Level**: Low  
**Assumption**: Empty state should guide the user on next steps.  
**Code**:
```tsx
if (stoneLots.length === 0 && !loading) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No stone lots found.</p>
    </div>
  )
}
```

---

### 3.8 Update Table Structure
**Objective**: Adapt the table to display dynamic data from `stoneLots`.  
**Risk Level**: Medium  
**Assumption**: The existing table structure can be modified for dynamic data.  
**Code**:
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Lot Number
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Stone Type
      </th>
      {/* Add other headers */}
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {stoneLots.map((lot) => (
      <tr key={lot.id}>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {lot.lot_number}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {lot.stone_type}
        </td>
        {/* Add other cells */}
      </tr>
    ))}
  </tbody>
</table>
```

---

### 3.9 Add Type Safety
**Objective**: Ensure type-safe data access.  
**Risk Level**: Low  
**Assumption**: The `StoneLotData` type is correctly defined.  
**Implementation**:
- Use optional chaining (`?.`) for potentially undefined fields.
- Add type guards where necessary to ensure type safety.

---

### 3.10 Add Basic Error Boundaries (Optional)
**Objective**: Prevent the page from crashing due to runtime errors.  
**Risk Level**: Medium  
**Assumption**: The app has an existing `ErrorBoundary` component.  
**Code**:
```tsx
// In a separate ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>
    }
    return this.props.children
  }
}
```

---

## Risk Assessment Summary
- **High Risk**: None
- **Medium Risk**:
  - Data fetching logic (3.4)
  - Table structure updates (3.8)
- **Low/No Risk**:
  - Component conversion (3.1)
  - State management (3.3)
  - UI states: loading (3.5), error (3.6), empty (3.7)
  - Type safety (3.9)


# Step 4: Update the UI to Display Live Data
Objective: Modify the JSX in 
app/stones/page.tsx
 to render the data from the component's state. The table columns will be updated to match the fields in our new 
StoneLot
 type. We will also add conditional rendering to show a loading spinner while fetching and an error message if the request fails.
Files to Change:
app/stones/page.tsx
Risk Level: Very Low
Validation: This is a standard UI update with minimal risk. The data structure will be well-defined by our new 
StoneLot
 type, preventing runtime errors.



## Step 4: Basic Data Display Implementation

### 4.1 Update Table Headers
**Objective**: Define the table headers for displaying stone lot data.  
**Risk Level**: Very Low  
**Assumption**: The table component follows the application's UI library conventions.  
**Code**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Lot #</TableHead>
      <TableHead>Stone Type</TableHead>
      <TableHead>Shape</TableHead>
      <TableHead>Size</TableHead>
      <TableHead>Quantity</TableHead>
      <TableHead>Weight (ct)</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  {/* TableBody will go here */}
</Table>
```

---

### 4.2 Update Table Rows with Live Data
**Objective**: Render dynamic stone lot data in the table rows.  
**Risk Level**: Low  
**Assumption**: The `stoneLots` data from Supabase matches the `StoneLotData` type.  
**Code**:
```tsx
<TableBody>
  {stoneLots.map((lot) => (
    <TableRow key={lot.id}>
      <TableCell className="font-medium">{lot.lot_number || 'N/A'}</TableCell>
      <TableCell>{lot.stone_type || 'N/A'}</TableCell>
      <TableCell>{lot.shape || 'N/A'}</TableCell>
      <TableCell>{lot.size || 'N/A'}</TableCell>
      <TableCell>{lot.quantity || '0'}</TableCell>
      <TableCell>{lot.weight ? `${lot.weight}` : '0'}</TableCell>
      <TableCell>{lot.status || 'N/A'}</TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

### 4.3 Add Basic Console Logging for Debugging
**Objective**: Log stone lot data to the console for debugging purposes.  
**Risk Level**: Very Low  
**Assumption**: Console logging will help verify data fetching and rendering.  
**Code**:
```tsx
// Inside your component
useEffect(() => {
  console.log('Stone lots data:', stoneLots)
}, [stoneLots])
```

---

### 4.4 Update the Component Structure
**Objective**: Integrate the table structure and data fetching into the `StonesPage` component.  
**Risk Level**: Medium  
**Assumption**: The component uses the same UI library and API service as other pages.  
**Code**:
```tsx
"use client"

import { useState, useEffect } from "react"
import { fetchAllStoneLots } from "@/lib/api-service"
import type { StoneLotData } from "@/types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StonesPage() {
  const [stoneLots, setStoneLots] = useState<StoneLotData[]>([])

  useEffect(() => {
    const loadStoneLots = async () => {
      try {
        const data = await fetchAllStoneLots()
        setStoneLots(data)
      } catch (error) {
        console.error("Error loading stone lots:", error)
      }
    }

    loadStoneLots()
  }, [])

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="text-lg font-semibold">Stone Management</h1>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="rounded-md border">
          <Table>
            {/* Table Header from 4.1 */}
            {/* Table Body from 4.2 */}
          </Table>
        </div>
      </main>
    </div>
  )
}
```
