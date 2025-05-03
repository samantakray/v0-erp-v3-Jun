# Component Library

## Overview

The Jewelry ERP application uses a combination of custom components and UI components from the shadcn/ui library. This document provides an overview of the key components used throughout the application.

## UI Components

### shadcn/ui Components

The application uses the following shadcn/ui components:

| Component | File Path | Description |
|-----------|-----------|-------------|
| Accordion | `/components/ui/accordion.tsx` | Collapsible content panels |
| Alert | `/components/ui/alert.tsx` | Displays important messages to users |
| Checkbox | `/components/ui/checkbox.tsx` | Interactive checkbox input |
| Separator | `/components/ui/separator.tsx` | Visual divider between content |
| Table | `/components/ui/table.tsx` | Displays tabular data |
| Tabs | `/components/ui/tabs.tsx` | Organizes content into selectable tabs |
| Textarea | `/components/ui/textarea.tsx` | Multi-line text input |

### Custom UI Components

In addition to shadcn/ui components, the application includes custom components:

| Component | Description |
|-----------|-------------|
| Button | Custom button component with various styles |
| Card | Container for related content |
| Dialog | Modal dialog for user interactions |
| Dropdown | Menu for selecting from a list of options |
| Input | Text input field |
| Select | Dropdown selection component |

## Business Components

These components implement specific business functionality:

### Order Management Components

| Component | Description |
|-----------|-------------|
| OrderList | Displays a list of orders with filtering and sorting |
| OrderDetail | Shows detailed information about a specific order |
| OrderForm | Form for creating or editing orders |
| OrderStatusBadge | Visual indicator of order status |

### Job Management Components

| Component | Description |
|-----------|-------------|
| JobList | Displays a list of jobs with filtering and sorting |
| JobDetail | Shows detailed information about a specific job |
| JobHeader | Header component for job details page |
| JobDetailSheet | Main component for viewing job details |
| PhaseNavigation | Navigation between job phases |
| PhaseSummaryTracker | Shows progress through job phases |
| StoneSelectionView | Interface for selecting stones |
| DiamondSelectionView | Interface for selecting diamonds |
| ManufacturerView | Interface for managing manufacturing |
| QualityCheckView | Interface for quality control |

### Sticker Components

| Component | Description |
|-----------|-------------|
| StickerPreview | Previews stickers for printing |
| StickerGenerator | Generates stickers for different phases |

### Utility Components

| Component | Description |
|-----------|-------------|
| SearchBar | Component for searching orders and jobs |
| DatePicker | Calendar component for selecting dates |
| StatusFilter | Filter component for filtering by status |
| Pagination | Component for paginating through results |
| LotRow | Component for displaying lot information |

## Component Usage Examples

### Job Detail Page

The job detail page uses the following components:

\`\`\`jsx
<JobHeader job={job} />
<PhaseNavigation currentPhase={job.currentPhase} jobId={job.id} />
<Tabs>
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="details">
    <JobDetailSheet job={job} />
  </TabsContent>
  <TabsContent value="history">
    <JobHistory jobId={job.id} />
  </TabsContent>
</Tabs>
<StickerPreview job={job} />
\`\`\`

### Stone Selection View

The stone selection view uses the following components:

\`\`\`jsx
<StoneSelectionView 
  job={job}
  onSubmit={handleStoneSelection}
>
  <LotRow 
    lotNumber="ST-12345"
    weight="2.5ct"
    quantity={4}
  />
  <Button type="submit">Submit Selection</Button>
</StoneSelectionView>
