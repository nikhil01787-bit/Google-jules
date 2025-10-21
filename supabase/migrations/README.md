# Supabase Migrations

This directory contains the SQL migration files for setting up the database schema for the OptiSigns-inspired digital signage system.

## Order of Execution

It is crucial to run these migration files in the correct order to ensure that all dependencies and constraints are met. The correct order is:

1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_storage_setup.sql`
4. `004_indexes.sql`

## How to Run Migrations

1.  **Navigate to the Supabase SQL Editor:**
    *   Open your Supabase project dashboard.
    *   In the left sidebar, click on the "SQL Editor" icon.

2.  **Run Each Migration File:**
    *   For each file in the order specified above, copy the entire content of the SQL file.
    *   Paste the content into the Supabase SQL Editor.
    *   Click the "Run" button to execute the script.
    *   Verify that the script runs successfully without any errors before proceeding to the next file.

## Verification

After running all the migration files, you can verify the setup:

*   **Tables:** Go to the "Table Editor" to see all the newly created tables.
*   **RLS Policies:** Go to "Authentication" -> "Policies" to verify that the Row Level Security policies have been created for each table.
*   **Storage Bucket:** Go to "Storage" to verify that the `assets` bucket has been created.
*   **Indexes:** You can use the SQL editor to verify the indexes have been created successfully. For example, to check the indexes on the `devices` table, you can run:
    ```sql
    select * from pg_indexes where tablename = 'devices';
    ```
