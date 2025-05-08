# Jewellery ERP Directory Structure

\`\`\`
jewellery-erp/
├── app/
│   ├── actions/
│   │   ├── job-actions.ts
│   │   ├── order-actions.ts
│   │   └── sku-actions.ts
│   ├── components/
│   │   └── DataTable.tsx
│   ├── diamonds/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── manufacturers/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── orders/
│   │   ├── [orderId]/
│   │   │   ├── jobs/
│   │   │   │   ├── [jobId]/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── job-header.tsx
│   │   │   │   │   │   └── phase-navigation.tsx
│   │   │   │   │   ├── complete/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── diamond-selection/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── manufacturer/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── quality-check/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── stone-selection/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── new/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── skus/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── stones/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── stepper.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── job-detail-sheet.tsx
│   ├── LotRow.tsx
│   ├── new-manufacturer-sheet.tsx
│   ├── new-order-sheet.tsx
│   ├── new-sku-sheet.tsx
│   ├── next-task-module.tsx
│   ├── order-detail-sheet.tsx
│   ├── orders-table.tsx
│   ├── phase-summary-tracker.tsx
│   ├── priority-orders-table.tsx
│   ├── sidebar.tsx
│   ├── sticker-preview.tsx
│   └── StoneSelectionView.tsx
├── constants/
│   └── job-workflow.ts
├── database/
│   ├── create-order-trigger.sql
│   ├── permission-test.sql
│   ├── rls-policies.sql
│   ├── schema.sql
│   └── update-sku-trigger.sql
├── documents/
│   ├── 01-application-overview.md
│   ├── 02-system-architecture.md
│   ├── 03-component-library.md
│   ├── 04-data-models.md
│   ├── 05-workflows.md
│   ├── 06-api-reference.md
│   ├── 07-constants-configuration.md
│   ├── 08-user-guides.md
│   ├── 09-installation-guide.md
│   ├── 10-quick-start.md
│   ├── 11-console-logging.md
│   ├── 12-supabase-implementation.md
│   └── directoryTree.md
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── api-service.ts
│   ├── logger.ts
│   ├── supabaseClient.ts
│   ├── supabase-validator.ts
│   ├── utils.ts
│   └── validation.ts
├── mocks/
│   ├── jobs.ts
│   ├── orders.ts
│   └── skus.ts
├── public/
│   ├── ornate-gold-necklace.png
│   ├── ornate-silver-earrings.png
│   └── ornate-silver-filigree-necklace.png
├── scripts/
│   └── migrate-mock-data.ts
├── styles/
│   └── stone-selection.css
├── types/
│   └── index.ts
├── .env.local
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

This directory tree represents the current structure of your Jewellery ERP project. It shows the organization of your application with the following main sections:

1. **app/** - Next.js App Router structure with pages and API routes
2. **components/** - Reusable UI components including shadcn/ui components
3. **constants/** - Application constants and configuration
4. **database/** - SQL files for database schema and triggers
5. **documents/** - Documentation files
6. **hooks/** - Custom React hooks
7. **lib/** - Utility functions and services
8. **mocks/** - Mock data for development
9. **public/** - Static assets
10. **scripts/** - Utility scripts
11. **styles/** - CSS files
12. **types/** - TypeScript type definitions

The tree follows the Next.js App Router convention with nested routes and provides a clear overview of how your application is structured.
