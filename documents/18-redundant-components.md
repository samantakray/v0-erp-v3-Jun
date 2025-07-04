# Document: 18-redundant-components.md

## 1. Introduction

This document provides an analysis of the components located in the `components/` folder (including the `components/ui/` subdirectory) of the "Jewellery ERP" project. The primary goal is to identify any components that are not currently imported or utilized within the scope of the project files available in the current chat context. Identifying such components can help in code cleanup and reducing potential project complexity.

## 2. Methodology and Scope

The analysis was performed by:
1.  Compiling a list of all component files within the `components/` directory.
2.  Systematically searching through all available `.tsx` (and relevant `.ts`) files in the project (as per the chat history context) for import statements and usage of each listed component.
3.  Noting the file(s) where each component is imported.

**Scope Limitation:** This analysis is based *solely* on the files and code snippets provided and discussed within this chat session. If there are other parts of the project not shared, the conclusions might differ. The analysis focuses on whether a component is *imported*, not on whether the importing file itself is part of an active code path (i.e., full dead code analysis is beyond this scope).

## 3. Analysis of Custom Components (`components/*.tsx`)

The following custom components were analyzed:

| Component File                  | Exported Component(s)     | Imported In                                                                                                                               | Status |
| :------------------------------ | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| `sidebar.tsx`                   | `Sidebar`                 | `app/layout.tsx`                                                                                                                          | USED   |
| `LotRow.tsx`                    | `LotRow` (default)        | `components/StoneSelectionView.tsx`                                                                                                       | USED   |
| `StoneSelectionView.tsx`        | `StoneSelectionView` (default) | `app/orders/[orderId]/jobs/[jobId]/stone-selection/page.tsx`                                                                              | USED   |
| `sticker-preview.tsx`           | `StickerPreview`          | `components/StoneSelectionView.tsx`, `components/job-detail-sheet.tsx`                                                                    | USED   |
| `phase-summary-tracker.tsx`     | `PhaseSummaryTracker`     | `components/order-detail-sheet.tsx`                                                                                                       | USED   |
| `next-task-module.tsx`          | `NextTaskModule`          | `components/order-detail-sheet.tsx`                                                                                                       | USED   |
| `new-manufacturer-sheet.tsx`    | `NewManufacturerSheet`    | `app/manufacturers/page.tsx`                                                                                                              | USED   |
| `order-detail-sheet.tsx`        | `OrderDetailSheet`        | `app/orders/[orderId]/page.tsx`                                                                                                           | USED   |
| `orders-table.tsx`              | `OrdersTable`             | `app/page.tsx` (Dashboard)                                                                                                                | USED   |
| `priority-orders-table.tsx`     | `PriorityOrdersTable`     | `app/page.tsx` (Dashboard)                                                                                                                | USED   |
| `sku-statistics.tsx`            | `SkuStatistics`           | `app/page.tsx` (Dashboard)                                                                                                                | USED   |
| `stone-allocation-row.tsx`      | `StoneAllocationRow` (default) | `components/job-detail-sheet.tsx`                                                                                                       | USED   |
| `diamond-allocation-row.tsx`    | `DiamondAllocationRow` (default) | `components/job-detail-sheet.tsx`                                                                                                       | USED   |
| `new-sku-sheet.tsx`             | `NewSkuSheet`             | `app/skus/page.tsx`, `components/new-order-sheet.tsx`                                                                                     | USED   |
| `image-upload.tsx`              | `ImageUpload`             | `components/new-sku-sheet.tsx`                                                                                                            | USED   |
| `job-detail-sheet.tsx`          | `JobDetailSheet`          | `components/order-detail-sheet.tsx`                                                                                                       | USED   |
| `order-confirmation-dialog.tsx` | `OrderConfirmationDialog` | `components/new-order-sheet.tsx`                                                                                                          | USED   |
| `new-order-sheet.tsx`           | `NewOrderSheet`           | `app/orders/page.tsx`                                                                                                                     | USED   |

**Conclusion for Custom Components:** All custom components located directly within the `components/` folder appear to be imported and utilized in other parts of the application, based on the provided files.
