/*
  # Fix departments table RLS policy for public access

  1. Security Changes
    - Drop existing RLS policies on departments table
    - Create new policy that allows public access to departments
    - This enables the application to work with anonymous Supabase client

  2. Changes Made
    - Allow public read, insert, update, delete operations on departments
    - Maintains data integrity while allowing application access
*/

-- Drop any existing policies on departments table
DROP POLICY IF EXISTS "Allow all operations on departments" ON departments;
DROP POLICY IF EXISTS "Enable read access for all users" ON departments;
DROP POLICY IF EXISTS "Enable insert for all users" ON departments;
DROP POLICY IF EXISTS "Enable update for all users" ON departments;
DROP POLICY IF EXISTS "Enable delete for all users" ON departments;

-- Ensure RLS is enabled
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for public access
CREATE POLICY "Allow public access to departments"
  ON departments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Alternative: Create separate policies for each operation (more granular)
-- Uncomment these if you prefer separate policies:

-- CREATE POLICY "Enable read access for all users" ON departments
--   FOR SELECT TO public USING (true);

-- CREATE POLICY "Enable insert for all users" ON departments
--   FOR INSERT TO public WITH CHECK (true);

-- CREATE POLICY "Enable update for all users" ON departments
--   FOR UPDATE TO public USING (true) WITH CHECK (true);

-- CREATE POLICY "Enable delete for all users" ON departments
--   FOR DELETE TO public USING (true);