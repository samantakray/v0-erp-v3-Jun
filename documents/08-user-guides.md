# User Guides

## Overview

This document provides user guides for different roles in the Jewelry ERP system. Each guide explains the workflows and tasks specific to that role.

## Order Manager Guide

### Creating a New Order

1. Navigate to the Orders page
2. Click the "New Order" button
3. Select the order type (Customer or Stock)
4. If Customer order, select a customer from the dropdown
5. Add SKUs to the order:
   - Click "Add SKU"
   - Select an existing SKU or create a new one
   - Specify quantity
   - Add any SKU-specific remarks
   - Repeat for additional SKUs
6. Set the production date and delivery date
7. Add any order-level remarks
8. Click "Save Order"

### Managing Orders

1. Navigate to the Orders page
2. Use filters to find specific orders:
   - Filter by status
   - Filter by date range
   - Filter by customer
3. Click on an order to view details
4. From the order details page, you can:
   - Edit order details
   - View jobs associated with the order
   - Track order progress
   - Cancel the order (if not in production)

## Bag Creation Team Guide

### Creating a Bag for a Job

1. Navigate to the Jobs page
2. Filter for jobs with status "New Job"
3. Click on a job to view details
4. Click the "Create Bag" button
5. Enter bag details:
   - Bag number
   - Materials list
   - Weight
6. Click "Submit"
7. Print the bag label

## Stone Selection Team Guide

### Selecting Stones for a Job

1. Navigate to the Jobs page
2. Filter for jobs with status "Bag Created"
3. Click on a job to view details
4. Click the "Select Stones" button
5. Enter stone selection details:
   - Stone lot number
   - Stone type
   - Quantity
   - Weight
6. Click "Submit"
7. Print the stone selection sticker

## Diamond Selection Team Guide

### Selecting Diamonds for a Job

1. Navigate to the Jobs page
2. Filter for jobs with status "Stone Selected"
3. Click on a job to view details
4. Click the "Select Diamonds" button
5. Enter diamond selection details:
   - Diamond lot number
   - Karat
   - Clarity
   - Quantity
   - Weight
6. Click "Submit"
7. Print the diamond selection sticker

## Manufacturing Team Guide

### Assigning a Manufacturer

1. Navigate to the Jobs page
2. Filter for jobs with status "Diamond Selected"
3. Click on a job to view details
4. Click the "Assign Manufacturer" button
5. Select a manufacturer from the dropdown
6. Set the expected completion date
7. Add any special instructions
8. Click "Submit"
9. Print the manufacturer sticker

### Receiving Completed Jobs

1. Navigate to the Jobs page
2. Filter for jobs with status "In Production"
3. Click on a job to view details
4. Click the "Receive from Manufacturer" button
5. Enter receipt details:
   - Receipt date
   - Received by
   - Any notes
6. Click "Submit"

## Quality Control Team Guide

### Performing Quality Checks

1. Navigate to the Jobs page
2. Filter for jobs with status "Received from Manufacturer"
3. Click on a job to view details
4. Click the "Perform QC" button
5. Enter QC details:
   - Measured weight
   - Visual inspection results
   - Any defects or issues
6. Select "Pass" or "Fail"
7. Add any notes
8. Click "Submit"
9. If passed, print the QC passed sticker
10. If failed, the job will be returned to manufacturing

## Admin Guide

### User Management

1. Navigate to the Admin page
2. Click on "Users"
3. To add a user:
   - Click "Add User"
   - Enter user details (name, email, role)
   - Click "Save"
4. To edit a user:
   - Click on the user
   - Update details
   - Click "Save"
5. To deactivate a user:
   - Click on the user
   - Click "Deactivate"
   - Confirm the action

### System Configuration

1. Navigate to the Admin page
2. Click on "Settings"
3. Configure system parameters:
   - Default production lead time
   - Default QC criteria
   - Notification settings
4. Click "Save Changes"
