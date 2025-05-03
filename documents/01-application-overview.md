# Jewelry ERP Application Overview

## Introduction

The Jewelry ERP (Enterprise Resource Planning) application is a comprehensive system designed to manage the entire jewelry manufacturing process, from order creation to final quality control. It provides a streamlined workflow for tracking jobs, managing inventory, and coordinating between different teams involved in the jewelry production process.

## Key Features

- **Order Management**: Create and track customer and stock orders
- **Job Tracking**: Monitor the progress of individual jewelry items through the production pipeline
- **Workflow Management**: Structured phases for bag creation, stone selection, diamond selection, manufacturing, and quality control
- **Inventory Management**: Track materials, stones, and diamonds used in production
- **Quality Control**: Comprehensive QC process with pass/fail tracking
- **Reporting**: Generate reports on production status, inventory levels, and team performance

## User Roles

The application supports different user roles, each with specific responsibilities:

1. **Admin**: Full access to all system features and settings
2. **Order Manager**: Creates and manages orders
3. **Bag Creation Team**: Prepares material bags for production
4. **Stone Selection Team**: Selects and allocates stones for jobs
5. **Diamond Selection Team**: Selects and allocates diamonds for jobs
6. **Manufacturing Team**: Manages the production process with manufacturers
7. **Quality Control Team**: Performs quality checks on completed items
8. **Delivery Team**: Handles completed jobs and customer delivery

## Technology Stack

- **Frontend**: Next.js with React Server Components and Client Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API and Server Actions
- **Deployment**: Vercel

## System Requirements

- Node.js 18.0 or higher
- npm 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
