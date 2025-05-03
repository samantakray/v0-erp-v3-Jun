# Console Logging System

This document describes the console logging system implemented in the Jewelry ERP application to monitor and debug Supabase API requests and other critical operations.

## Table of Contents

1. [Overview](#overview)
2. [Logging Architecture](#logging-architecture)
3. [Log Levels](#log-levels)
4. [Logging Components](#logging-components)
5. [Validation System](#validation-system)
6. [How to Use](#how-to-use)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Extending the System](#extending-the-system)

## Overview

The logging system provides detailed insights into all Supabase API requests, database operations, and system validations. It helps developers identify issues, monitor performance, and ensure data integrity throughout the application.

Key features include:
- Detailed request and response logging
- Performance metrics for all operations
- Schema and permission validation
- Environment variable verification
- Contextual information for easier debugging
- Error handling with actionable information

## Logging Architecture

The logging system is built around a central `logger.ts` utility that provides standardized logging functions. This utility is used throughout the application to log operations in a consistent format.

### Core Components

1. **Logger Utility**: Provides standardized logging functions with different severity levels
2. **Supabase Client Wrapper**: Enhances the Supabase client with logging capabilities
3. **API Service Logging**: Adds detailed logging to all API operations
4. **Validation System**: Proactively checks for common issues at application startup

### Data Flow

\`\`\`
Application Code → Logger Utility → Console Output
\`\`\`

For API operations:
\`\`\`
API Request → Supabase Client Wrapper → Logger → Console Output → API Response
\`\`\`

## Log Levels

The logging system uses the following severity levels:

| Level | Description | Usage |
|-------|-------------|-------|
| DEBUG | Detailed information for debugging | Low-level operations, variable values |
| INFO | General information | Operation start/end, successful outcomes |
| WARN | Warning conditions | Non-critical issues that don't stop execution |
| ERROR | Error conditions | Failed operations, critical issues |

## Logging Components

### Logger Utility (`lib/logger.ts`)

The core logging utility provides functions for different log levels and handles formatting:

\`\`\`typescript
// Example usage
import { logger } from '@/lib/logger';

logger.info('Operation started', { contextData: 'value' });
logger.error('Operation failed', { error: err.message });
\`\`\`

### Supabase Client Logging (`lib/supabaseClient.ts`)

The Supabase client is enhanced with logging for all database operations:

- Logs initialization of the client
- Captures all queries with timing information
- Records errors with detailed context
- Provides performance metrics for optimization

### API Service Logging (`lib/api-service.ts`)

The API service adds business-level context to all operations:

- Logs the business operation being performed (e.g., "fetchOrder")
- Records input parameters and output results
- Provides timing information for the entire operation
- Captures and logs any errors with context

### Server Actions Logging (`app/actions/*.ts`)

Server actions include logging for user-initiated operations:

- Logs the action being performed
- Records input data (with sensitive information redacted)
- Provides timing information
- Captures and logs any errors with context

## Validation System

The validation system proactively checks for common issues at application startup:

### Environment Variable Validation

- Verifies that all required environment variables are defined
- Checks that the Supabase URL has the expected format
- Validates that API keys have a reasonable length

### Schema Validation

- Checks that all expected tables exist in Supabase
- Verifies that each table has all the required columns
- Logs detailed information about any missing tables or columns

### Permissions Validation

- Tests read permissions using the anonymous client
- Tests write permissions using the service role client
- Uses a special SQL function to test permissions without modifying data
- Provides detailed error messages for permission issues

## How to Use

### Viewing Logs

Logs are output to the browser console in development mode:

1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to the "Console" tab
3. You'll see logs with different levels and timestamps

### Filtering Logs

You can filter logs in the browser console:

- By log level: Type "ERROR" or "INFO" in the filter box
- By operation: Type the operation name (e.g., "fetchOrder")
- By component: Type the component name (e.g., "supabaseClient")

### Example Log Output

\`\`\`
[INFO] 2023-05-03T16:43:24.123Z - fetchOrder called {timestamp: "2023-05-03T16:43:24.123Z", level: "info", message: "fetchOrder called", data: {…}}
[DEBUG] 2023-05-03T16:43:24.125Z - Fetching order from Supabase {timestamp: "2023-05-03T16:43:24.125Z", level: "debug", message: "Fetching order from Supabase", data: {…}}
[INFO] 2023-05-03T16:43:24.325Z - SELECT operation completed on orders {timestamp: "2023-05-03T16:43:24.325Z", level: "info", message: "SELECT operation completed on orders", data: {…}, duration: "200.00ms"}
[INFO] 2023-05-03T16:43:24.526Z - fetchOrder completed successfully {timestamp: "2023-05-03T16:43:24.526Z", level: "info", message: "fetchOrder completed successfully", data: {…}, duration: "401.00ms"}
\`\`\`

## Best Practices

### When to Log

- **DO** log the start and end of important operations
- **DO** log errors with enough context to understand the issue
- **DO** log performance metrics for optimization
- **DO** log user actions that modify data
- **DON'T** log sensitive information (passwords, API keys, etc.)
- **DON'T** log high-volume data that could impact performance

### Log Level Guidelines

- **DEBUG**: Use for detailed information that is only useful during development
- **INFO**: Use for general information about the application's operation
- **WARN**: Use for non-critical issues that don't stop execution
- **ERROR**: Use for critical issues that prevent successful completion

### Adding Context

Always include relevant context in your logs:

\`\`\`typescript
// Good
logger.info('Order created', { orderId: '123', items: 5 });

// Bad
logger.info('Order created');
\`\`\`

## Troubleshooting

### Common Issues

#### No Logs Appearing

- Check that you're in development mode
- Verify that the console is not filtering out logs
- Ensure that the logger is properly imported

#### Too Many Logs

- Adjust the log level to reduce verbosity
- Filter logs in the console to focus on specific operations
- Consider implementing log sampling for high-volume operations

#### Missing Context

- Ensure that all logging calls include relevant context
- Add more context to error logs to make debugging easier

## Extending the System

### Adding Logging to New Components

To add logging to a new component:

1. Import the logger:
   \`\`\`typescript
   import { logger } from '@/lib/logger';
   \`\`\`

2. Add logging calls at appropriate points:
   \`\`\`typescript
   function myFunction(param) {
     logger.info('myFunction called', { param });
     try {
       // Function logic
       logger.info('myFunction completed', { result });
       return result;
     } catch (error) {
       logger.error('myFunction failed', { error: error.message });
       throw error;
     }
   }
   \`\`\`

### Adding New Validation Checks

To add new validation checks:

1. Add a new function to the validation utility
2. Call the function during application startup
3. Log the results with appropriate context

### Customizing Log Format

The log format can be customized in the logger utility:

1. Modify the formatting functions in `logger.ts`
2. Ensure that all required information is still included
3. Update the documentation to reflect the new format
