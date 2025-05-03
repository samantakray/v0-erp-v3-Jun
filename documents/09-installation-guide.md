# Installation Guide

## Prerequisites

Before installing the Jewelry ERP application, ensure you have the following:

1. Node.js 18.x or later
2. npm 9.x or later
3. Git
4. A Supabase account (if not using mock data)

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/jewelry-erp.git
cd jewelry-erp
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root directory with the following variables:

\`\`\`
# Mock data configuration
NEXT_PUBLIC_USE_MOCKS=true

# Supabase configuration (required if NEXT_PUBLIC_USE_MOCKS=false)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 4. Set Up Supabase (if not using mock data)

#### 4.1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Create a new project
3. Note the project URL and API keys

#### 4.2. Set Up Database Schema

You can set up the database schema in two ways:

##### Option 1: Using the SQL Editor

1. Go to the SQL Editor in the Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and execute the SQL in the editor

##### Option 2: Using the Migration Script

1. Update your `.env.local` file with your Supabase credentials
2. Run the migration script:

\`\`\`bash
npm run migrate
\`\`\`

#### 4.3. Set Up Row-Level Security (RLS)

1. Go to the Authentication > Policies section in the Supabase dashboard
2. For each table, create the following policies:

| Table | Policy Name | Policy Definition |
|-------|-------------|-------------------|
| `skus` | `select_all` | `true` |
| `orders` | `select_all` | `true` |
| `orders` | `insert_authenticated` | `auth.role() = 'authenticated'` |
| `order_items` | `select_all` | `true` |
| `jobs` | `select_all` | `true` |
| `jobs` | `update_authenticated` | `auth.role() = 'authenticated'` |
| `job_history` | `select_all` | `true` |

#### 4.4. Import Sample Data

You can import sample data in two ways:

##### Option 1: Using the Supabase Dashboard

1. Go to the Table Editor in the Supabase dashboard
2. For each table, click "Import Data" and upload the corresponding CSV file from the `data` directory

##### Option 2: Using the Migration Script

1. Update your `.env.local` file with your Supabase credentials
2. Run the migration script with the `--data` flag:

\`\`\`bash
npm run migrate -- --data
\`\`\`

### 5. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000).

## Switching Between Mock and Real Data

You can switch between using mock data and real Supabase data by changing the `NEXT_PUBLIC_USE_MOCKS` environment variable:

- Set to `"true"` to use mock data
- Set to `"false"` to use Supabase

After changing this variable, restart the development server for the changes to take effect.

## Troubleshooting

### Supabase Connection Issues

If you encounter issues connecting to Supabase:

1. Verify that your Supabase URL and API keys are correct
2. Check that your Supabase project is active
3. Ensure that your IP address is not blocked by Supabase
4. Check the browser console for detailed error messages

### Database Schema Issues

If you encounter issues with the database schema:

1. Verify that all required tables and columns exist
2. Check that the column types match the expected types
3. Ensure that all required indexes and constraints are in place
4. Run the validation system to identify specific issues:

\`\`\`bash
npm run validate-schema
\`\`\`

### Permission Issues

If you encounter permission issues:

1. Verify that all required RLS policies are in place
2. Check that the policies are correctly configured
3. Ensure that you're using the correct API keys
4. Run the validation system to identify specific issues:

\`\`\`bash
npm run validate-permissions
\`\`\`

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application

### Environment Variables in Production

Ensure that the following environment variables are set in your production environment:

\`\`\`
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## Updating the Application

To update the application:

1. Pull the latest changes from the repository
2. Install any new dependencies
3. Apply any database migrations
4. Restart the application
\`\`\`

Let's also create a new document specifically for Supabase implementation details:
